import logging
import requests
import urllib
import re
import base64

from gtts.tts import gTTS, gTTSError

# Logger
log = logging.getLogger(__name__)
log.addHandler(logging.NullHandler())

class ProgressGTTSAdapter(gTTS):
    def __init__(self, *args, progress_recorder=None, **kwargs):
        self.progress_recorder = progress_recorder

        # Remove the custom arguments from kwargs before calling the parent class's __init__ method
        kwargs.pop('progress_recorder', None)
        super().__init__(*args, **kwargs)

    def stream(self):
        """Do the TTS API request(s) and stream bytes

        Raises:
            :class:`gTTSError`: When there's an error with the API request.

        """
        # When disabling ssl verify in requests (for proxies and firewalls),
        # urllib3 prints an insecure warning on stdout. We disable that.
        try:
            requests.packages.urllib3.disable_warnings(
                requests.packages.urllib3.exceptions.InsecureRequestWarning
            )
        except:
            pass
        
        prepared_requests = self._prepare_requests()
        for idx, pr in enumerate(prepared_requests):
            if self.progress_recorder is not None:                
                self.progress_recorder.set_progress(idx+1, len(prepared_requests))
            try:
                with requests.Session() as s:
                    # Send request
                    r = s.send(
                        request=pr, proxies=urllib.request.getproxies(), verify=False
                    )

                log.debug("headers-%i: %s", idx, r.request.headers)
                log.debug("url-%i: %s", idx, r.request.url)
                log.debug("status-%i: %s", idx, r.status_code)

                r.raise_for_status()
            except requests.exceptions.HTTPError as e:  # pragma: no cover
                # Request successful, bad response
                log.debug(str(e))
                raise gTTSError(tts=self, response=r)
            except requests.exceptions.RequestException as e:  # pragma: no cover
                # Request failed
                log.debug(str(e))
                raise gTTSError(tts=self)

            # Write
            for line in r.iter_lines(chunk_size=1024):
                decoded_line = line.decode("utf-8")
                if "jQ1olc" in decoded_line:
                    audio_search = re.search(r'jQ1olc","\[\\"(.*)\\"]', decoded_line)
                    if audio_search:
                        as_bytes = audio_search.group(1).encode("ascii")
                        yield base64.b64decode(as_bytes)
                    else:
                        # Request successful, good response,
                        # no audio stream in response
                        raise gTTSError(tts=self, response=r)
            log.debug("part-%i created", idx)
