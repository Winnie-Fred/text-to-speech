import io
import socket

import cloudinary
import cloudinary.uploader
import cloudinary.api

from gtts.tts import gTTSError
from render_block import render_block_to_string
from celery_progress.backend import ProgressRecorder
from celery import shared_task

from .progress_gtts_adapter import ProgressGTTSAdapter


@shared_task(bind=True)
def convert_text_to_speech(self, text, lang, tld, file_name, context):
    try:
        progress_recorder = ProgressRecorder(self)

        speech = ProgressGTTSAdapter(
            text=text, lang=lang, slow=False, tld=tld, progress_recorder=progress_recorder, 
        )

        bytes_file = io.BytesIO()
        speech.write_to_fp(bytes_file)

        # Upload the mp3.
        # Set the asset's public ID and allow overwriting asset with new versions
        cloudinary.uploader.upload(
            file=bytes_file.getvalue(), public_id=file_name, unique_filename=False, overwrite=True,
            resource_type='video'
        )
        mp3_info = cloudinary.api.resource(file_name, resource_type='video')
        src_url = mp3_info['secure_url']
        context["speech_mp3"] = src_url

        context["speech_mp3"] = 'hello'
        context["file_name"] = file_name[:15] + '...' + '.mp3' if len(file_name) > 15 else file_name + '.mp3'
        html = render_block_to_string('conversion_successful.html', 'content', context)
        return {"html": html, "context": context}

    except (gTTSError, socket.error, Exception) as e:
        context["errors"] = [f"An error occurred during the conversion: {e}"]
        html = render_block_to_string('index.html', 'content', context)
        return {"html": html, "context": context}
