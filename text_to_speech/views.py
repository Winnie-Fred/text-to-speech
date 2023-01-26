import gtts
import socket

from django.shortcuts import render, redirect

from .forms import TypedInInputForm


# Create your views here.

def home(request):
    context = {"speech":None, "errors":[]}
    form = TypedInInputForm(request.session.get("form"))
    if not form:
        form = TypedInInputForm()
    context['text_input_form'] = form
    return render(request, 'index.html', context)

def convert_entered_text(request):
    context = {"speech":None, "errors":[]}
    lang = 'en'
    if request.method == "POST":
        form = TypedInInputForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            print(data)
            request.session['form'] = data
            text_to_be_converted = data.get('text_to_convert')
            name_of_speech_file = "speech.mp3"
            try:
                speech_audio_file = gtts.gTTS(text=text_to_be_converted, lang=lang, slow=False)  
                speech_audio_file.save(f"static_in_dev/{name_of_speech_file}")
            except gtts.tts.gTTSError as e:
                context["errors"] = [f"An error occured during the conversion: {e}"]
                print(context['errors'])
            except socket.error as e:
                context["errors"] = [f"An error occured during the conversion: {e}"]
                print(context['errors'])            
            else:
                context["speech"] = name_of_speech_file
                return render(request, "conversion_successful.html", context)
        else:
            context["errors"] = form.errors
            print(form.errors)
        return render(request, "index.html", context)
    return redirect('text_to_speech:home')