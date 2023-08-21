import os
import uuid
import base64
import urllib.parse

from io import BytesIO

import docx2txt
import fitz


from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.urls import reverse
from django.template.loader import render_to_string
from django.http import FileResponse, HttpResponseBadRequest


from celery.result import AsyncResult

from .forms import TextToConvertForm, FileUploadForm, VoiceAccentForm, ChooseLanguageForm, MAX_NO_OF_CHARS
from .tasks import convert_text_to_speech


# Create your views here.

def generate_random_id():
    return uuid.uuid4().hex[:6].upper()

def home(request):
    context = {}
    text_input_form = TextToConvertForm(request.session.get("text_input_form_data"))
    file_input_form = FileUploadForm()
    voice_accent_form = VoiceAccentForm()
    choose_lang_form = ChooseLanguageForm()
    if not text_input_form:
        text_input_form = TextToConvertForm()
    context['text_input_form'] = text_input_form
    context['file_input_form'] = file_input_form
    context['voice_accent_form'] = voice_accent_form
    context['choose_lang_form'] = choose_lang_form
    return render(request, 'index.html', context)


def convert_input_text(request):
    if request.method == 'POST' and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        context = {"url_encoded_audio_data":"", "file_name":"", "get_progress_url":"",
                   "audio_data":"", "full_length_file_name":"",
                   "abort_task_url":"", "errors":False, "aborted":False,
                   "extra_info":''}
        context["form_errors"] = {}
        context["form_errors"]["text_input_form_errors"] = []
        context["form_errors"]["voice_accent_form_errors"] = []
        context["form_errors"]["choose_lang_form_errors"] = []

        text_input_form = TextToConvertForm(request.POST)
        voice_accent_form = VoiceAccentForm(request.POST)
        choose_lang_form = ChooseLanguageForm(request.POST)
        
        if text_input_form.is_valid() and voice_accent_form.is_valid() and choose_lang_form.is_valid():
            text_input_form_data = text_input_form.cleaned_data

            request.session['text_input_form_data'] = text_input_form_data
            text_to_be_converted = text_input_form_data.get('text_to_convert')
            lang = choose_lang_form.cleaned_data.get('select_lang')
            tld = voice_accent_form.cleaned_data.get('select_voice_accent')
            file_name = "speech-" + generate_random_id()
            task = convert_text_to_speech.delay(text_to_be_converted, lang, tld, file_name, context)
            context['get_progress_url'] = reverse('text_to_mp3:task_status', args=[task.id])
            context['abort_task_url'] = reverse('text_to_mp3:abort_task', args=[task.id])
            html = render_to_string('conversion_in_progress.html')
            return JsonResponse({"html":html, "context":context}, safe=False)

        context["form_errors"]["text_input_form_errors"] = [value for _, value in text_input_form.errors.items()]
        context["form_errors"]["voice_accent_form_errors"] = [value for _, value in voice_accent_form.errors.items()]
        context["form_errors"]["choose_lang_form_errors"] = [value for _, value in choose_lang_form.errors.items()]

        context["errors"] = True
        
        return JsonResponse({"context":context})
    return redirect('text_to_mp3:home')


def convert_file_content(request):
    if request.method == 'POST' and request.headers.get('x-requested-with') == 'XMLHttpRequest' and 'file_to_convert' in request.FILES:
        context = {"url_encoded_audio_data":"", "file_name":"", "get_progress_url":"",
                   "audio_data":"", "full_length_file_name":"",
                   "abort_task_url":"", "errors":False, "aborted":False,
                   "extra_info":''}
        context["form_errors"] = {}
        context["form_errors"]["file_upload_form_errors"] = []
        context["form_errors"]["voice_accent_form_errors"] = []
        context["form_errors"]["choose_lang_form_errors"] = []

        file_upload_form = FileUploadForm(request.POST, request.FILES)
        voice_accent_form = VoiceAccentForm(request.POST)
        choose_lang_form = ChooseLanguageForm(request.POST)

        if file_upload_form.is_valid() and voice_accent_form.is_valid() and choose_lang_form.is_valid():
            uploaded_file = file_upload_form.cleaned_data.get('file_to_convert')      

            read_uploaded_file = uploaded_file.read()
            file_name = uploaded_file.name
            text = ''
            
            try:
                if file_name.endswith(".pdf"):
                    text = extract_text_from_pdf(read_uploaded_file)
                elif file_name.endswith(".txt"):
                    text = extract_text_from_txt(uploaded_file)
                elif file_name.endswith(".docx"):
                    text = extract_text_from_docx(uploaded_file)
            except Exception as e:
                context["form_errors"]["file_upload_form_errors"] = [f"An error occured with the file: {e}"]
                context["errors"] = True
                return JsonResponse({"context":context})

            if not text.strip():
                context["form_errors"]["file_upload_form_errors"] = ["The submitted file must contain text."]
                context["errors"] = True
                return JsonResponse({"context":context})

            if len(text) > MAX_NO_OF_CHARS:
                context["extra_info"] = [f"The uploaded file has {len(text)} characters. Only the first {MAX_NO_OF_CHARS} characters will be converted to speech."]             
                text = text[:MAX_NO_OF_CHARS]


            base_name, _ = os.path.splitext(file_name)
            file_name = f"{base_name}-{generate_random_id()}"
            tld = voice_accent_form.cleaned_data.get('select_voice_accent')
            lang = choose_lang_form.cleaned_data.get('select_lang')

            task = convert_text_to_speech.delay(text, lang, tld, file_name, context)
            context['get_progress_url'] = reverse('text_to_mp3:task_status', args=[task.id])
            context['abort_task_url'] = reverse('text_to_mp3:abort_task', args=[task.id])
            html = render_to_string('conversion_in_progress.html')
            return JsonResponse({"html":html, "context":context}, safe=False)

            
        context["form_errors"]["file_upload_form_errors"] = [value for _, value in file_upload_form.errors.items()]
        context["form_errors"]["voice_accent_form_errors"] = [value for _, value in voice_accent_form.errors.items()]
        context["form_errors"]["choose_lang_form_errors"] = [value for _, value in choose_lang_form.errors.items()]

        context["errors"] = True
        
        return JsonResponse({"context":context})
    return redirect('text_to_mp3:home')


def get_conversion_progress(request, task_id):
    response_data = {
        'task_completed': False,
        'progress': 0,    
        'success': False,
        'aborted': False,
        'errors': [],
        'html':'',
        'context':{},
    }
    
    task = AsyncResult(task_id)

    if task.info is None:
        if task.state not in ['PENDING', 'STARTED', 'SUCCESS']:
            response_data['errors'].append('Oops! Something went wrong.')
        return JsonResponse(response_data)

    response_data['task_completed'] = task.ready()
    response_data['progress'] = task.info.get('percent', 0)
    print('progress: ', response_data['progress'])
    
    if response_data['task_completed']:
        if task.state == 'SUCCESS':
            context = task.result.get('context')
            if not context['errors']:
                response_data['success'] = True
                response_data['html'] = task.result.get('html')
                response_data['context'] = context

                request.session['url_encoded_audio_data'] = context['url_encoded_audio_data']
                request.session['file_name'] = context['full_length_file_name']
            else:
                response_data['context']['errors'] = context['errors']
        else:
            # Handle other task states (e.g., 'FAILURE', 'REVOKED', etc.)
            response_data['errors'].extend(['Something went wrong!', 'Task failed or revoked'])
    return JsonResponse(response_data)


def abort_task(request, task_id):
    task = convert_text_to_speech.AsyncResult(task_id)   
    task.abort()
    response_data = {'message':"The conversion has been aborted"}
    return JsonResponse(response_data)

def download_audio(request):
    url_encoded_audio_data = request.session.get('url_encoded_audio_data', '')
    file_name = request.session.get('file_name', '')
    
    if url_encoded_audio_data:
        decoded_audio_data = base64.b64decode(urllib.parse.unquote_plus(url_encoded_audio_data))
        audio_bytes_io = BytesIO(decoded_audio_data)
        
        audio_file_name = file_name if file_name else 'speech.mp3'
        
        response = FileResponse(audio_bytes_io, content_type='audio/mpeg')
        response['Content-Disposition'] = f'attachment; filename="{audio_file_name}"'        
        return response
    else:
        return HttpResponseBadRequest("Missing or invalid audio data")


def extract_text_from_pdf(file):
    with fitz.open(stream=file) as doc:
        content = []
        for page in doc:
            content.append(page.get_text())

    return ''.join(content)

def extract_text_from_txt(file):
    str_text = []
    for line in file:
        str_text.append(line.decode())
    return ''.join(str_text)

def extract_text_from_docx(file):
    return docx2txt.process(file)