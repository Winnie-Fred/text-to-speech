from django import forms

class TypedInInputForm(forms.Form):
    text_to_convert = forms.CharField(widget=forms.Textarea(attrs={'class': 'text', 'placeholder':"simply copy and paste..."}), required=True,)

class FileUploadForm(forms.Form):
    file_to_convert = forms.FileField(widget=forms.ClearableFileInput(attrs={'class':'default-file-input', 'accept':'.txt,.doc,.docx,.pdf'}), required=True,)
    
    def clean(self):
        cleaned_data = super(FileUploadForm, self).clean()
        file = cleaned_data.get('file_to_convert')

        if file:
            filename = file.name.lower()
            print(filename)
            if not ((filename.endswith('.txt') or filename.endswith('.doc') or filename.endswith('.docx') or filename.endswith('.pdf'))):
                raise forms.ValidationError("Please upload only .txt, .doc, .docx or .pdf files")               

        return file