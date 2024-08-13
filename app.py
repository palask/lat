from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit

# Setting: Path to the file where text will be saved
TEXT_FILE_PATH = "text_data.txt"

# Function to read text from the file
def read_text_from_file():
    try:
        with open(TEXT_FILE_PATH, "r") as file:
            return file.read()
    except FileNotFoundError:
        return ""  # Return empty string if file does not exist

# Function to write text to the file
def write_text_to_file(text):
    with open(TEXT_FILE_PATH, "w") as file:
        file.write(text)

app = Flask(__name__)
socketio = SocketIO(app)

# Variable to store the current text
current_text = read_text_from_file()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_text", methods=["GET"])
def get_text():
    return jsonify({"text": current_text})

@socketio.on("text_update")
def handle_text_update(data):
    global current_text
    current_text = data["text"]
    write_text_to_file(current_text)
    emit("update_text", data, broadcast=True)

if __name__ == "__main__":
    print("LAT Server is running")
    socketio.run(app, host="0.0.0.0", port=5000)
