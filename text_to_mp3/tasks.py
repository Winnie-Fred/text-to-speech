import io
import socket
import base64
import urllib.parse

from django.template.loader import render_to_string

from gtts.tts import gTTSError
from celery_progress.backend import ProgressRecorder
from celery import shared_task
from celery.contrib.abortable import AbortableTask

from .progress_gtts_adapter import ProgressGTTSAdapter
from .exceptions import TaskAbortedException


@shared_task(bind=True, base=AbortableTask)
def convert_text_to_speech(self, text, lang, tld, file_name, context):
    try:
        progress_recorder = ProgressRecorder(self)

        speech = ProgressGTTSAdapter(
            text=text, lang=lang, slow=False, tld=tld, progress_recorder=progress_recorder, task=self,
        )

        bytes_file = io.BytesIO()
        speech.write_to_fp(bytes_file)

        bytes_file.seek(0)
        audio_data = base64.b64encode(bytes_file.read()).decode()
        url_encoded_audio_data = urllib.parse.quote_plus(audio_data)
        context["url_encoded_audio_data"] = url_encoded_audio_data
        context["file_name"] = file_name[:15] + '...' + '.mp3' if len(file_name) > 15 else file_name + '.mp3'
        context["audio_data"] = audio_data
        file_name = f"{file_name}.mp3"
        context["full_length_file_name"] = file_name

        html = render_to_string('conversion_successful.html', context)
        return {"html": html, "context": context}
    except TaskAbortedException:
        context["aborted"] = True
        return {"html": "", "context": context}
    except (gTTSError, socket.error, Exception) as e:
        context["errors"] = [f"An error occurred during the conversion: {e}"]
        return {"context": context}
