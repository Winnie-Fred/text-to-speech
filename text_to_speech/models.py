from django.db import models

# Create your models here.

class SpeechFile(models.Model):

    class Meta:
        verbose_name_plural = 'Speech Files'

    name = models.CharField(max_length=100)
    mp3 = models.FileField()

    def __str__(self):
        return self.name



