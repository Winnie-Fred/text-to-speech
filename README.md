# text-to-speech
Simple text-to-speech web-based application using Django and Google Translate text-to-speech API

## Check out the project 
Click [here](https://text-to-speech-a2ve.onrender.com/)
  
### About the project
This project is a simple web-based application that converts text to speech. The speech can be previewed and then downloaded as an mp3 file. It is created using Django and uses the Google Translate text-to-speech API for the conversion (with gtts Python library). Celery, Redis and Rabbitmq are used to run the conversion as a background task and to monitor its progress.
Currently, about 59 languages and 187 accents are supported.
  
### Python version >= 3.9.7

### How to set up the project locally
1. Clone (or fork then clone) the repo
2. cd into the project directory and create and activate a virtual environment
3. Install the dependencies with  `pip install -r requirements.txt`
4. mp3 files are hosted on Cloudinary. You can create a free cloudinary account [here](https://cloudinary.com/users/register_free). Enter your cloudinary cloud name, api key and secret in a .env file in the root of the project directory like so: <br>
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
5. Install RabbitMQ and Redis on your machine. These are used for running Celery as a background task and monitoring the task progress. You can download and install [RabbitMQ](https://www.rabbitmq.com/) and [Redis](https://redis.com/) from their respective official websites or use a package manager appropriate for your operating system.
6. After installing RabbitMQ, start the RabbitMQ server. The exact command to start RabbitMQ may vary depending on your operating system and installation method. For example, on Linux, you can start RabbitMQ using a command like `sudo service rabbitmq-server start` or `sudo systemctl start rabbitmq-server`.
7. Start Redis: After installing Redis, start the Redis server. Similar to RabbitMQ, the exact command to start Redis may depend on your operating system and installation method. On Linux, you can typically start Redis using `redis-server` command.
8. Alternatively, you can use Docker to run RabbitMQ and Redis as containers, which provides an easy and isolated way to set up and manage these services. Install Docker: Install Docker on your machine by following the instructions for your specific operating system from the official [Docker](https://www.docker.com/) website. Run Redis and RabbitMQ as containers using `docker run --name my-redis -d -p 6379:6379 redis` and
`docker run --name my-rabbitmq -d -p 5672:5672 rabbitmq`  commands respectively.
9. Start a celery worker using `celery -A text_to_speech worker -l info`.
10. Start the development server with `python manage.py runserver` and go to localhost in your browser
