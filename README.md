# Text to Speech
Simple text-to-speech web-based application using Django and Google Translate text-to-speech API

## Check out the project 
Click [here](https://text2speech-bkq4.onrender.com/)
  
### About the project
This project is a simple web-based application that converts text to speech. The speech can be previewed and then downloaded as an mp3 file. It uses Django and uses the Google Translate text-to-speech API for the conversion (with gtts Python library). Celery, Redis and Rabbitmq are used to run the conversion as a background task and to monitor its progress. It can be set up manually, alternatively, Docker is used for quick setup, containerization and deployment.<br>
Currently, about 59 languages and 187 accents are supported.
  
### Python version >= 3.9.7

### How to set up the project locally without Docker
1. Clone (or fork then clone) the repo
2. cd into the project directory and create and activate a virtual environment
3. Install the dependencies with  `pip install -r requirements.txt`
4. Install RabbitMQ and Redis on your machine. These are required by Celery for this project. You can download and install [RabbitMQ](https://www.rabbitmq.com/) and [Redis](https://redis.com/) from their respective official websites or use a package manager appropriate for your operating system.
5. After installing RabbitMQ, start the RabbitMQ server. The exact command to start RabbitMQ may vary depending on your operating system and installation method. For example, on Linux, you can start RabbitMQ using a command like `sudo service rabbitmq-server start` or `sudo systemctl start rabbitmq-server`.
6. Start Redis: After installing Redis, start the Redis server. Similar to RabbitMQ, the exact command to start Redis may depend on your operating system and installation method. On Linux, you can typically start Redis using `redis-server` command.
7. Create a `.env` file and enter values for CELERY_BROKER_URL and CELERY_RESULT_BACKEND. If you are using default settings, these should by default be</br> `CELERY_BROKER_URL=amqp://guest:guest@localhost:5672//` </br>
`CELERY_RESULT_BACKEND=redis://localhost:6379/0`
8. Start a celery worker using `celery -A text_to_speech worker -l info`. Ensure you are in the root directory of the project.
9. Make migrations using `python manage.py migrate`
10. Start the development server with `python manage.py runserver` and go to localhost:8000 in your browser.

### Quick local setup with Docker & Docker compose
1. Make sure you have Docker and Docker Compose installed.
2. Make sure the docker engine is running, otherwise, start it.
3. Follow step 7 in the previous section
4. Go to the project directory root and run `docker-compose build && docker-compose up`.
5. That's it! Now go to localhost:8000 in your browser.
