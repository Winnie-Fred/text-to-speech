import os
import socket
import io
import docx2txt
import uuid 

import cloudinary
import cloudinary.uploader
import cloudinary.api

from django.shortcuts import render, redirect
from django.http import JsonResponse


from gtts.tts import gTTS, gTTSError
from PyPDF4 import PdfFileReader
from render_block import render_block_to_string

from .forms import TypedInInputForm, FileUploadForm


cloudinary.config(cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                  api_key=os.getenv('CLOUDINARY_API_KEY'),
                  api_secret=os.getenv('CLOUDINARY_API_SECRET'),
                  secure=True)

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
            file_name = "speech-" + generate_random_id()
            try:
                speech_audio_file = gTTS(text=text_to_be_converted, lang=lang, slow=False, tld="com.ng") 
                bytes_file = io.BytesIO()
                speech_audio_file.write_to_fp(bytes_file)

                # Upload the mp3 and get its URL
                # ==============================

                # Upload the mp3.
                # Set the asset's public ID and allow overwriting  asset with new versions
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

def generate_random_id():
    return uuid.uuid4().hex[:6].upper()


def convert_file_content(request):
    context = {"speech":None, "errors":[], "preloader":False}
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
                    elif file_name.endswith(".doc") or file_name.endswith(".docx"):
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