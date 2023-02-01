# text-to-speech
Simple English text-to-speech web-based application using Django and Google Translate text-to-speech API

## Check out the project 
Click [here](https://text-to-speech-a2ve.onrender.com/)
  
### About the project
This project is a simple web-based application that converts English text to speech. The speech can be previewed and then downloaded as an mp3 file. It is created using Django and uses the Google Translate text-to-speech API for the conversion (with gtts Python library).
  
### Python version >= 3.9.7

### How to set up the project locally
1. Clone (or fork then clone) the repo
1. cd into the project directory and create and activate a virtual environment
2. Install the dependencies with  `pip install -r requirements.txt`
3. mp3 files are hosted on Cloudinary. You can create a cloudinary account [here](https://cloudinary.com/users/register_free). Enter your cloudinary cloud name, api key and secret in a .env file in the root of the project directory.
4. Start the development server with `python manage.py runserver` and go to localhost in your browser
