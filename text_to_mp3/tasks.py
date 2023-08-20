import io
import socket

import cloudinary
import cloudinary.uploader
import cloudinary.api

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
        folder_name = 'text_to_speech'

        response = cloudinary.uploader.upload(
            file=bytes_file.getvalue(), public_id=file_name, unique_filename=False, overwrite=True,
            resource_type='video',
            folder=folder_name,
        )
        src_url = response['secure_url']
        public_id = response['public_id']
        downloadable_url = cloudinary.utils.cloudinary_url(public_id, resource_type='video', transformation={'flags': f'attachment:{file_name}'})[0]

        context["speech_src_mp3"] = src_url
        context["speech_download_mp3"] = downloadable_url
        context["file_name"] = file_name[:15] + '...' + '.mp3' if len(file_name) > 15 else file_name + '.mp3'
        html = render_to_string('conversion_successful.html', context)
        return {"html": html, "context": context}
    except TaskAbortedException:
        context["aborted"] = True
        return {"html": "", "context": context}
    except (gTTSError, socket.error, Exception) as e:
        context["errors"] = [f"An error occurred during the conversion: {e}"]
        return {"context": context}
