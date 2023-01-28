import os
import gtts
import socket
import io
import docx2txt

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.conf import settings

from PyPDF4 import PdfFileReader
from render_block import render_block_to_string

from .forms import TypedInInputForm, FileUploadForm


STATIC_FILES_DIR = os.path.basename(os.path.normpath(settings.STATIC_ROOT))
# Create your views here.

def home(request):
    context = {"speech":None, "errors":[]}
    text_input_form = TypedInInputForm(request.session.get("form"))
    file_input_form = FileUploadForm()
    if not text_input_form:
        text_input_form = TypedInInputForm()
    context['text_input_form'] = text_input_form
    context['file_input_form'] = file_input_form
    return render(request, 'index.html', context)

def convert_input_text(request):
    context = {"speech":None, "errors":[], "preloader":False}
    lang = 'en'
    if request.method == 'POST' and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        form = TypedInInputForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            request.session['form'] = data
            text_to_be_converted = data.get('text_to_convert')
            name_of_speech_file = "speech.mp3"
            try:
                speech_audio_file = gtts.gTTS(text=text_to_be_converted, lang=lang, slow=False)  
                speech_audio_file.save(f"{STATIC_FILES_DIR}/{name_of_speech_file}")
            except (gtts.tts.gTTSError, socket.error, Exception) as e:
                context["errors"] = [f"An error occured during the conversion: {e}"]
            else:
                context["speech"] = name_of_speech_file
                html = render_block_to_string('conversion_successful.html', 'content', context, request=request)
                return JsonResponse({"html":html, "context":context}, safe=False)
        else:
            errors = []
            for _, value in form.errors.items():
                errors.append(value)
            context["errors"] = errors
        return JsonResponse({"context":context})
    return redirect('text_to_speech:home')

def convert_file_content(request):
    context = {"speech":None, "errors":[], "preloader":False}
    name_of_speech_file = "speech.mp3"
    lang = 'en'
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
                    elif file_name.endswith(".doc") or file_name.endswith(".docx"):
                        text = extract_text_from_docx(uploaded_file)
                except Exception as e:
                    print(f"An exception occured with the file: {e}")
                    context["errors"] = [f"An error occured with the file: {e}"]
                    return JsonResponse({"context":context})

                try:
                    speech_audio_file = gtts.gTTS(text=text, lang=lang, slow=False)  
                    speech_audio_file.save(f"{STATIC_FILES_DIR}/{name_of_speech_file}")
                except (gtts.tts.gTTSError, socket.error, Exception) as e:
                    context["errors"] = [f"An error occured during the conversion: {e}"]
                else:
                    context["speech"] = name_of_speech_file
                    # print("Conversion complete!!!!!!")
                    html = render_block_to_string('conversion_successful.html', 'content', context, request=request)
                    return JsonResponse({"html":html, "context":context}, safe=False)
        else:         
            errors = []
            for _, value in form.errors.items():
                errors.append(value)
            context["errors"] = errors
        return JsonResponse({"context":context})
    return redirect('text_to_speech:home')


def extract_text_from_pdf(file):
    pdf_reader = PdfFileReader(io.BytesIO(file))
    content = []
    # creating a page object
    for i in range(int(pdf_reader.numPages)):
        content.append(pdf_reader.getPage(i).extractText())
    return ''.join(content)

def extract_text_from_txt(file):
    str_text = []
    for line in file:
        str_text.append(line.decode())
    return ''.join(str_text)

def extract_text_from_docx(file):
    return docx2txt.process(file)