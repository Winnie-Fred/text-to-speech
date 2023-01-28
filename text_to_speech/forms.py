from django import forms
from django.utils.translation import gettext_lazy as _
from django.template.defaultfilters import filesizeformat

class TypedInInputForm(forms.Form):
    text_to_convert = forms.CharField(widget=forms.Textarea(attrs={'class': 'text', 'placeholder':"simply copy and paste..."}), required=True,)

class FileUploadForm(forms.Form):

    MAX_UPLOAD_SIZE = 20480

    file_to_convert = forms.FileField(widget=forms.ClearableFileInput(attrs={'class':'default-file-input', 'accept':'.txt,.doc,.docx,.pdf'}), required=True,)
    
    def clean(self):
        cleaned_data = super(FileUploadForm, self).clean()
        file = cleaned_data.get('file_to_convert')

        if file:
            print("file size: ", file.size)
            filename = file.name.lower()
            print(filename)
            if not ((filename.endswith('.txt') or filename.endswith('.doc') or filename.endswith('.docx') or filename.endswith('.pdf'))):
                raise forms.ValidationError("Please upload only .txt, .doc, .docx or .pdf files")

            if file.size > self.MAX_UPLOAD_SIZE:
                raise forms.ValidationError(_('Please keep filesize under %s. Current filesize: %s') % (filesizeformat(self.MAX_UPLOAD_SIZE), filesizeformat(file.size)))

        return file

    