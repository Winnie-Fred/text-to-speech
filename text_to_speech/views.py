import gtts
import socket
import io
import docx2txt

from django.shortcuts import render, redirect
from django.http import JsonResponse

from PyPDF4 import PdfFileReader
from render_block import render_block_to_string

from .forms import TypedInInputForm, FileUploadForm


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
                speech_audio_file.save(f"static_in_dev/{name_of_speech_file}")
            except gtts.tts.gTTSError as e:
                context["errors"] = [f"An error occured during the conversion: {e}"]
            except socket.error as e:
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
            file_name = request.FILES['file_to_convert'].name.lower()
            
            if uploaded_file.read():
                if file_name.endswith(".pdf"):
                    text = extract_text_from_pdf(uploaded_file)
                elif file_name.endswith(".txt"):
                    text = extract_text_from_txt(uploaded_file)
                elif file_name.endswith(".doc") or file_name.endswith(".docx"):
                    text = extract_text_from_docx(uploaded_file)

                try:
                    speech_audio_file = gtts.gTTS(text=text, lang=lang, slow=False)  
                    speech_audio_file.save(f"static_in_dev/{name_of_speech_file}")
                except gtts.tts.gTTSError as e:
                    context["errors"] = [f"An error occured during the conversion: {e}"]
                except socket.error as e:
                    context["errors"] = [f"An error occured during the conversion: {e}"]
                else:
                    context["speech"] = name_of_speech_file
                    print("Conversion complete!!!!!!")
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
    pdf_reader = PdfFileReader(io.BytesIO(file.read()))
    content = []
    # creating a page object
    for i in range(int(pdf_reader.numPages)):
        content.append(pdf_reader.getPage(i).extractText() + "\n")
    return ''.join(content)

def extract_text_from_txt(file):
    str_text = []
    for line in file:
        str_text.append(line.decode())
    return ''.join(str_text)

def extract_text_from_docx(file):
    return docx2txt.process(file)