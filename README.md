# LocalAreaText (LAT)

How can I simply share text with other devices in my local network?
LAT automatically synchronizes the text you input on the site with every other device that visits the site.
It also stores the inputted text so it is not lost when you shutdown the server.
Whenever the server connection is lost, this is displayed to the user.

LAT is build with python and uses Flask as well as Flask-SocketIO on the backend.
On the frontend it uses Socket.IO to communicate with the server.

## Installation

1. Make sure a recent version of python is installed.
2. Install the dependencies:
```sh
pip install -r requirements.txt
```

## Usage

1. Start the web server with:
```sh
python app.py
```
2. Visit `DEVICE_IP:5000` in your browser and replace `DEVICE_IP` accordingly.
3. When you are done, you can shutdown the server with Ctrl+C.
