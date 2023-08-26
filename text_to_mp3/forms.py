from django import forms
from django.utils.translation import gettext_lazy as _
from django.template.defaultfilters import filesizeformat

import gtts
import magic


MAX_NO_OF_CHARS = 2500
MAX_FILE_UPLOAD_SIZE = 10 * 1024 * 1024


allowed_mime_types = {
    "text/plain":"TXT",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":"DOCX",
    "application/pdf":"PDF",
}

def file_type_is_allowed(file):
    file_buffer = file.read()
    file.seek(0)
    file_mime_type = magic.from_buffer(file_buffer, mime=True)    
    return file_mime_type in allowed_mime_types

def get_file_type(file):
    file_buffer = file.read()
    file.seek(0)
    file_mime_type = magic.from_buffer(file_buffer, mime=True)
    return allowed_mime_types.get(file_mime_type, '')


class TextToConvertForm(forms.Form):
    text_to_convert = forms.CharField(widget=forms.Textarea(attrs={'class': 'text', 'placeholder':"Type or paste text here"}), required=True, max_length=MAX_NO_OF_CHARS, )

class FileUploadForm(forms.Form):

    file_to_convert = forms.FileField(widget=forms.ClearableFileInput(attrs={'class':'default-file-input', 'accept':'.txt,.docx,.pdf'}), 
                                      required=True,)
  
    def clean_file_to_convert(self):
        file = self.cleaned_data.get('file_to_convert')

        if file:
            if not file_type_is_allowed(file):
                raise forms.ValidationError("Please upload only .txt, .docx or .pdf files")

            if file.size > MAX_FILE_UPLOAD_SIZE:
                raise forms.ValidationError(_('Please keep file size under %s. Current file size: %s') % (filesizeformat(MAX_FILE_UPLOAD_SIZE), 
                                                                                                        filesizeformat(file.size)))

        return file

class VoiceAccentForm(forms.Form):
    ACCENT_CHOICES = (
        ('com', 'Local/Default'),
        ('ad', 'Andorra'),
        ('ae', 'United Arab Emirates'),
        ('com.af', 'Afghanistan'),
        ('com.ag', 'Antigua and Barbuda'),
        ('al', 'Albania'),
        ('am', 'Armenia'),
        ('co.ao', 'Angola'),
        ('com.ar', 'Argentina'),
        ('as', 'American Samoa'),
        ('at', 'Austria'),
        ('com.au', 'Australia'),
        ('az', 'Azerbaijan'),
        ('ba', 'Bosnia and Herzegovina'),
        ('com.bd', 'Bangladesh'),
        ('be', 'Belgium'),
        ('bf', 'Burkina Faso'),
        ('bg', 'Bulgaria'),
        ('com.bh', 'Bahrain'),
        ('bi', 'Burundi'),
        ('bj', 'Benin'),
        ('com.bn', 'Brunei'),
        ('com.bo', 'Bolivia'),
        ('com.br', 'Brazil'),
        ('bs', 'Bahamas'),
        ('bt', 'Bhutan'),
        ('co.bw', 'Botswana'),
        ('by', 'Belarus'),
        ('com.bz', 'Belize'),
        ('ca', 'Canada'),
        ('cd', 'Democratic Republic of the Congo'),
        ('cf', 'Central African Republic'),
        ('cg', 'Republic of the Congo'),
        ('ch', 'Switzerland'),
        ('ci', "Côte d'Ivoire"),
        ('co.ck', 'Cook Islands'),
        ('cl', 'Chile'),
        ('cm', 'Cameroon'),
        ('cn', 'China'),
        ('com.co', 'Colombia'),
        ('co.cr', 'Costa Rica'),
        ('com.cu', 'Cuba'),
        ('cv', 'Cape Verde'),
        ('com.cy', 'Cyprus'),
        ('cz', 'Czech Republic'),
        ('de', 'Germany'),
        ('dj', 'Djibuti'),
        ('dk', 'Denmark'),
        ('dm', 'Dominica'),
        ('com.do', 'Dominican Republic'),
        ('dz', 'Algeria'),
        ('com.ec', 'Ecuador'),
        ('ee', 'Estonia'),
        ('com.eg', 'Egypt'),
        ('es', 'Spain'),
        ('com.et', 'Ethiopia'),
        ('fi', 'Finland'),
        ('com.fj', 'Fiji'),
        ('fm', 'Micronesia'),
        ('fr', 'France'),
        ('ga', 'Gabon'),
        ('ge', 'Georgia'),
        ('gg', 'Guernsey'),
        ('com.gh', 'Ghana'),
        ('com.gi', 'Gibraltar'),
        ('gl', 'Greenland'),
        ('gm', 'Gambia'),
        ('gr', 'Greece'),
        ('com.gt', 'Guatemala'),
        ('gy', 'Guyana'),
        ('com.hk', 'Hong Kong'),
        ('hn', 'Honduras'),
        ('hr', 'Croatia'),
        ('ht', 'Haiti'),
        ('hu', 'Hungary'),
        ('co.id', 'Indonesia'),
        ('ie', 'Ireland'),
        ('co.il', 'Israel'),
        ('im', 'Isle of Man'),
        ('co.in', 'India'),
        ('iq', 'Iraq'),
        ('is', 'Iceland'),
        ('it', 'Italy'),
        ('je', 'Jersey'),
        ('com.jm', 'Jamaica'),
        ('jo', 'Jordan'),
        ('co.jp', 'Japan'),
        ('co.ke', 'Kenya'),
        ('com.kh', 'Cambodia'),
        ('ki', 'Kiribati'),
        ('kg', 'Kyrgyzstan'),
        ('co.kr', 'South Korea'),
        ('com.kw', 'Kuwait'),
        ('kz', 'Kazakhstan'),
        ('la', 'Laos'),
        ('com.lb', 'Lebanon'),
        ('li', 'Liechtenstein'),
        ('lk', 'Sri Lanka'),
        ('co.ls', 'Lesotho'),
        ('lt', 'Lithuania'),
        ('lu', 'Luxembourg'),
        ('lv', 'Latvia'),
        ('com.ly', 'Libya'),
        ('co.ma', 'Marocco'),
        ('md', 'Moldova'),
        ('me', 'Montenegro'),
        ('mg', 'Madagascar'),
        ('mk', 'Macedonia'),
        ('ml', 'Mali'),
        ('com.mm', 'Myanmar'),
        ('mn', 'Mongolia'),
        ('com.mt', 'Malta'),
        ('mu', 'Mauritius'),
        ('mv', 'Maldives'),
        ('mw', 'Malawi'),
        ('com.mx', 'Mexico'),
        ('com.my', 'Malaysia'),
        ('co.mz', 'Mozambique'),
        ('com.na', 'Namibia'),
        ('com.ng', 'Nigeria'),
        ('com.ni', 'Nicaragua'),
        ('ne', 'Niger'),
        ('nl', 'Netherlands'),
        ('no', 'Norway'),
        ('com.np', 'Nepal'),
        ('nr', 'Nauru'),
        ('nu', 'Niue'),
        ('co.nz', 'New Zealand'),
        ('com.om', 'Oman'),
        ('com.pa', 'Panama'),
        ('com.pe', 'Peru'),
        ('com.pg', 'Papua New Guinea'),
        ('com.ph', 'Philippines'),
        ('com.pk', 'Pakistan'),
        ('pl', 'Poland'),
        ('pn', 'Pitcairn Islands'),
        ('com.pr', 'Puerto Rico'),
        ('ps', 'Palestine'),
        ('pt', 'Portugal'),
        ('com.py', 'Paraguay'),
        ('com.qa', 'Qatar'),
        ('ro', 'Romania'),
        ('ru', 'Russia'),
        ('rw', 'Rwanda'),
        ('com.sa', 'Saudi Arabia'),
        ('com.sb', 'Solomon Islands'),
        ('sc', 'Seychelles'),
        ('se', 'Sweden'),
        ('com.sg', 'Singapore'),
        ('sh', 'St. Helena'),
        ('si', 'Slovenia'),
        ('sk', 'Slovakia'),
        ('com.sl', 'Sierra Leone'),
        ('sn', 'Senegal'),
        ('so', 'Somalia'),
        ('sm', 'San Marino'),
        ('sr', 'Suriname'),
        ('st', 'São Tomé and Príncipe'),
        ('com.sv', 'El Salvador'),
        ('td', 'Chad'),
        ('tg', 'Togo'),
        ('co.th', 'Thailand'),
        ('com.tj', 'Tajikistan'),
        ('tl', 'Timor-Leste'),
        ('tm', 'Turkmenistan'),
        ('tn', 'Tunisia'),
        ('to', 'Tonga'),
        ('com.tr', 'Turkey, Turkish Republic of Northern Cyprus'),
        ('tt', 'Trinidad and Tobago'),
        ('com.tw', 'Taiwan'),
        ('co.tz', 'Tanzania'),
        ('com.ua', 'Ukraine'),
        ('co.ug', 'Uganda'),
        ('co.uk', 'United Kingdom'),
        ('com.uy', 'Uruguay'),
        ('co.uz', 'Uzbekistan'),
        ('com.vc', 'St. Vincent and the Grenadines'),
        ('co.ve', 'Venezuela'),
        ('co.vi', 'United States Virgin Islands'),
        ('com.vn', 'Vietnam'),
        ('vu', 'Vanuatu'),
        ('ws', 'Samoa'),
        ('rs', 'Serbia'),
        ('co.za', 'South Africa'),
        ('co.zm', 'Zambia'),
        ('co.zw', 'Zimbabwe'),
        ('cat', 'Catalan'),
    )

    select_voice_accent = forms.ChoiceField(choices=ACCENT_CHOICES)


class ChooseLanguageForm(forms.Form):
    select_lang = forms.ChoiceField(choices=gtts.lang.tts_langs().items())
    