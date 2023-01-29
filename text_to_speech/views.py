import os
from gtts.tts import gTTS, gTTSError
import socket
import io
import docx2txt
import uuid

from django.shortcuts import render, redirect
from django.core.files import File
from django.http import JsonResponse
from django.conf import settings

from PyPDF4 import PdfFileReader
from render_block import render_block_to_string

from .forms import TypedInInputForm, FileUploadForm
from .models import SpeechFile


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
    try:
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
                    speech_audio_file = gTTS(text=text_to_be_converted, lang=lang, slow=False) 
                    if not os.path.isdir("speech_files"):
                        # Create dir if it does not exist
                        os.makedirs("speech_files")
                    speech_audio_file.save(f"{settings.MEDIA_ROOT}/{name_of_speech_file}")
                    if os.path.isdir(f"{settings.MEDIA_ROOT}/{name_of_speech_file}"):
                        print("it created the speech file")
                    else:
                        print("it did not")

                    
                except (gTTSError, socket.error, Exception) as e:
                    context["errors"] = [f"An error occured during the conversion: {e}"]
                else:                                   
                    file_name, _ = generate_unique_file_name()
                    new_speech_file = SpeechFile()
                    new_speech_file.name = file_name
                    new_speech_file.mp3.save(file_name, File(open(f"{settings.MEDIA_ROOT}/{name_of_speech_file}", "rb")))
                    new_speech_file.save()                   
                    speech_file = SpeechFile.objects.get(name=file_name)
                    context["speech_mp3"] = speech_file.mp3.url

                    html = render_block_to_string('conversion_successful.html', 'content', context, request=request)
                    return JsonResponse({"html":html, "context":context}, safe=False)
            else:
                errors = []
                for _, value in form.errors.items():
                    errors.append(value)
                context["errors"] = errors
            return JsonResponse({"context":context})
        return redirect('text_to_speech:home')
    except Exception as e:
        print("This is the error: ", e)

def generate_unique_file_name():
    speech_files = SpeechFile.objects.all()
    while True:
        unique_id = uuid.uuid4()
        file_name = 'speech-' + str(uuid.uuid4())
        if file_name not in speech_files:
            return file_name, unique_id


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
                    speech_audio_file = gTTS(text=text, lang=lang, slow=False)  
                    if not os.path.isdir("speech_folder"):
                        # Create dir if it does not exist
                        os.makedirs("speech_folder")
                    speech_audio_file.save(f"speech_folder/{name_of_speech_file}")
                except (gTTSError, socket.error, Exception) as e:
                    context["errors"] = [f"An error occured during the conversion: {e}"]
                else:
                    file_name, _ = generate_unique_file_name()
                    new_speech_file = SpeechFile()
                    new_speech_file.name = file_name
                    new_speech_file.mp3.save(file_name, File(open(f"speech_folder/{name_of_speech_file}", "rb")))
                    new_speech_file.save()                   
                    speech_file = SpeechFile.objects.get(name=file_name)
                    context["speech_mp3"] = speech_file.mp3.url
                    # print("Conversion complete!!!!!")
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