from django import forms

class TypedInInputForm(forms.Form):
    text_to_convert = forms.CharField(widget=forms.Textarea(attrs={'class': 'text', 'name':'text_to_convert', 'placeholder':"simply copy and paste..."}), required=True,)