import os
import socket
import io
import uuid
import docx2txt

import cloudinary
import cloudinary.uploader
import cloudinary.api
import fitz

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.urls import reverse


from gtts.tts import gTTS, gTTSError
from render_block import render_block_to_string
from celery.result import AsyncResult

from .forms import TypedInInputForm, FileUploadForm, VoiceAccentForm, ChooseLanguageForm
from .tasks import convert_text_to_speech


cloudinary.config(cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                  api_key=os.getenv('CLOUDINARY_API_KEY'),
                  api_secret=os.getenv('CLOUDINARY_API_SECRET'),
                  secure=True)

# Create your views here.

def home(request):
    context = {"speech":None, "errors":[]}
    text_input_form = TypedInInputForm(request.session.get("form"))
    file_input_form = FileUploadForm()
    voice_accent_form = VoiceAccentForm()
    choose_lang_form = ChooseLanguageForm()
    if not text_input_form:
        text_input_form = TypedInInputForm()
    context['text_input_form'] = text_input_form
    context['file_input_form'] = file_input_form
    context['voice_accent_form'] = voice_accent_form
    context['choose_lang_form'] = choose_lang_form
    return render(request, 'index.html', context)


def convert_input_text(request):
    context = {"speech":None, "errors":[]}
    if request.method == 'POST' and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        text_input_form = TypedInInputForm(request.POST)
        voice_accent_form = VoiceAccentForm(request.POST)
        choose_lang_form = ChooseLanguageForm(request.POST)
        
        if text_input_form.is_valid() and voice_accent_form.is_valid() and choose_lang_form.is_valid():
            text_input_form_data = text_input_form.cleaned_data
            voice_accent_form_data = voice_accent_form.cleaned_data
            choose_lang_form_data = choose_lang_form.cleaned_data

            request.session['form'] = text_input_form_data
            text_to_be_converted = text_input_form_data.get('text_to_convert')
            lang = choose_lang_form_data.get('select_lang')
            tld = voice_accent_form_data.get('select_voice_accent')
            file_name = "speech-" + generate_random_id()
            task = convert_text_to_speech.delay(text_to_be_converted, lang, tld, file_name, context)
            context['get_progress_url'] = reverse('text_to_mp3:task_status', args=[task.id])
            html = render_block_to_string('conversion_in_progress.html', 'content', context, request=None)
            return JsonResponse({"html":html, "context":context}, safe=False)

        context["form_errors"] = {}

        context["form_errors"]["text_input_form_errors"] = [value for _, value in text_input_form.errors.items()]
        context["form_errors"]["voice_accent_form_errors"] = [value for _, value in voice_accent_form.errors.items()]
        context["form_errors"]["choose_lang_form_errors"] = [value for _, value in choose_lang_form.errors.items()]

        context["errors"] = True
        
        return JsonResponse({"context":context}, safe=False)
    return redirect('text_to_mp3:home')

def generate_random_id():
    return uuid.uuid4().hex[:6].upper()


def convert_file_content(request):
    context = {"speech":None, "errors":[]}
    lang='en'
    if request.method == 'POST' and request.headers.get('x-requested-with') == 'XMLHttpRequest' and 'file_to_convert' in request.FILES:
        form = FileUploadForm(request.POST, request.FILES or None)
        if form.is_valid():
            uploaded_file = request.FILES['file_to_convert']
            read_uploaded_file = uploaded_file.read()
            file_name = request.FILES['file_to_convert'].name.lower()
            text = ''
            
            if read_uploaded_file:
                try:
                    if file_name.endswith(".pdf"):
                        text = extract_text_from_pdf(read_uploaded_file)
                    elif file_name.endswith(".txt"):
                        text = extract_text_from_txt(uploaded_file)
                    elif file_name.endswith(".docx"):
                        text = extract_text_from_docx(uploaded_file)
                except Exception as e:
                    context["errors"] = [f"An error occured with the file: {e}"]
                    return JsonResponse({"context":context})

                file_name  += generate_random_id()

                try:
                    speech_audio_file = gTTS(text=text, lang=lang, slow=False, tld="com.ng") 
                    bytes_file = io.BytesIO()
                    speech_audio_file.write_to_fp(bytes_file)

                    # Upload the mp3 and get its URL
                    # ==============================

                    # Upload the mp3.
                    # Set the asset's public ID and allow overwriting the asset with new versions
                    cloudinary.uploader.upload(file=bytes_file.getvalue(), public_id=file_name, unique_filename = False, overwrite=True, resource_type='video')

                    # Build the URL for the image and save it in the variable 'src_url'
                    # src_url = cloudinary.CloudinaryVideo("my_file").build_url()
                                        
                    mp3_info=cloudinary.api.resource(file_name, resource_type='video')
                    src_url = mp3_info['secure_url']

                    # Log the mp3 URL to the console. 
                    # Copy this URL in a browser tab to generate the image on the fly.
                except (gTTSError, socket.error, Exception) as e:
                    context["errors"] = [f"An error occured during the conversion: {e}"]
                else:                                   
                    context["speech_mp3"] = src_url
                    context["file_name"] = file_name + '.mp3'
                    if len(file_name) > 15:
                        context['file_name'] = file_name[:15] + '...' + '.mp3'

                    html = render_block_to_string('conversion_successful.html', 'content', context, request=request)
                    return JsonResponse({"html":html, "context":context}, safe=False)
        else:   
            errors = []
            for _, value in form.errors.items():
                errors.append(value)
            context["errors"] = errors
        return JsonResponse({"context":context})
    return redirect('text_to_mp3:home')

def get_conversion_progress(request, task_id):
    response_data = {
        'task_completed': False,
        'progress': 0,    
        'success': False,
        'errors': []
    }

    if task_id:
        task = AsyncResult(task_id)
        response_data['task_completed'] = task.ready()
        response_data['progress'] = task.info.get('percent', 0)
        print('progress: ', response_data['progress'])
        
        if response_data['task_completed']:
            if task.state == 'SUCCESS':
                if not task.result.get('context')['errors']:
                    response_data['success'] = True
                    response_data['html'] = task.result.get('html')
                    response_data['context'] = task.result.get('context')
                else:
                    response_data['context'] = {}
                    response_data['context']['errors'] = task.result.get('context')['errors']
            else:
                # Handle other task states (e.g., 'FAILURE', 'REVOKED', etc.)
                response_data['errors'].extend(['Something went wrong!', 'Task failed or revoked'])
    else:
        response_data['errors'].append('Invalid task ID')

    return JsonResponse(response_data)


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