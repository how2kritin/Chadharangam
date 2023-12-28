from flask import Flask, render_template, redirect, request, session, flash  # Import Flask and render_template classes from the flask module.
from flask_cors import CORS
from flask_socketio import SocketIO, send, join_room, leave_room
import sqlite3
from coolname import generate_slug  # to create random room codes
import os  # to create a directory for the databases, if a directory doesn't exist already.
import random

path = "Databases"
if not os.path.exists(path):
    os.makedirs(path)

# Create the databases
database = sqlite3.connect('Databases/users.db')
database.execute("CREATE TABLE IF NOT EXISTS USERS (username TEXT PRIMARY KEY, password TEXT, wins INT DEFAULT 0, losses INT DEFAULT 0, draws INT DEFAULT 0)")  # text passwords for now, encrypt later.
database = sqlite3.connect('Databases/currGameInstances.db')
database.execute("CREATE TABLE IF NOT EXISTS GAMES (room_code TEXT PRIMARY KEY, player1_username TEXT, player2_username TEXT, gameState TEXT)")

# Create the flask server and initialise the session
app = Flask(__name__)
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
app.config["SECRET_KEY"] = "somerandosecretkeylol1729!!"
socketio = SocketIO(app)

CORS(app)

# Miscellaneous global variables
rooms = dict()


# All the routes and their associated functions:
@app.route("/", methods=["POST", "GET"])
def auth():
    # session.clear()  # To clear their session. Treat this as logging out. Implement proper logout later.
    listOfQuotes = ["Chess players know how to mate!", "Google En Passant", "pawnhub.com", "Chess speaks for itself!", "Always defend your bishop with your other bishop"]
    quote = random.choice(listOfQuotes)
    return render_template("auth.html", quote=quote)


@app.route("/userdata", methods=['POST'])
def handleUser():
    username = request.form.get('username')
    password = request.form.get('password')
    room_code = request.form.get('room_code')

    if room_code:
        print(f"Username is {username}, password is {password}, room code entered is {room_code}.")
        # Check if the entered room code is valid.
        if room_code not in rooms:
            flash("A room with this code doesn't exist. Please enter a valid room code, or don't enter a room code at all to create a new room.")
            return redirect("/")

    else:
        print(f"Username is {username}, password is {password}. Generating a room code. Will use the room code if the username and password are valid.")
        room_code = generate_slug()
        while room_code in rooms:
            room_code = generate_slug()
        rooms[room_code] = {"members": 0, "allMoves": [], "player1": "", "player2": ""}

    # First, check if this user exists in the database.
    with sqlite3.connect('Databases/users.db') as database:
        cursor = database.cursor()
        query = f'SELECT username, password FROM USERS WHERE username="{username}"'
        cursor.execute(query)
        data = cursor.fetchall()  # List of tuples

        if len(data) != 0:  # Check if user already exists in the database
            if data[0][1] != password:
                flash("This username already exists in the database, but the entered password is incorrect. Either enter the correct password, or use a different username to create an account.")
                return redirect("/")
            else:
                print("Successfully logged in!")
                session['username'], session['room_code'] = username, room_code
                return redirect("/waiting")
        else:
            print("New user, creating an account.")
            cursor.execute("INSERT INTO USERS (username, password) VALUES (?, ?)", (username, password))
            database.commit()
            print("Successfully added this user to the database!")
            session['username'], session['room_code'] = username, room_code
            return redirect("/waiting")


@app.route("/waiting")
def waitForPlayer():
    username, room_code = session.get('username'), session.get('room_code')
    if room_code is None or username is None or room_code not in rooms:
        return redirect("/")
    elif rooms[room_code]["members"] >= 2:
        flash("Sorry, this room already has 2 players! Please join a different room, or create a new room.")
        return redirect("/")

    return render_template("waitingroom.html", username=username, room_code=room_code)

@socketio.on("connect")
def connect(auth):
    username, room_code = session.get('username'), session.get('room_code')
    if room_code is None or username is None:
        return
    elif room_code not in rooms:  # If the user is in a room that doesn't exist as a valid room, then kick them out of that room.
        leave_room(room_code)
        return

    join_room(room_code)
    rooms[room_code]["members"] += 1
    if rooms[room_code]["members"] == 1:
        rooms[room_code]["player1"] = username
    else:
        rooms[room_code]["player2"] = username

    send({"name": username, "message": "has entered the room!", "playerCount": rooms[room_code]["members"], "player1": rooms[room_code]["player1"], "player2": rooms[room_code]["player2"]}, to=room_code)
    print(f"{username} has joined the room {room_code}")

@socketio.on("disconnect")
def disconnect():
    username, room_code = session.get('username'), session.get('room_code')
    leave_room(room_code)

    if room_code in rooms:
        rooms[room_code]["members"] -= 1
        if rooms[room_code]["members"] <= 0:  # If the last member has left the room, then delete the room itself.
            del rooms[room_code]

        if rooms[room_code]["player2"] == username:
            rooms[room_code]["player2"] = ""
        else:
            rooms[room_code]["player1"] = rooms[room_code]["player2"]
            rooms[room_code]["player2"] = ""

        send({"name": username, "message": "has left the room!", "playerCount": rooms[room_code]["members"], "player1": rooms[room_code]["player1"], "player2": rooms[room_code]["player2"]}, to=room_code)
        print(f"{username} has left the room {room_code}")

@socketio.on("message")
def message(data):
    username, room_code = session.get('username'), session.get('room_code')
    if room_code not in rooms:
        return
    if data['data'] == "start":
        print("Starting game!")
        startGame()
    else:
        sendPlayOfGame(data)

def sendPlayOfGame(data):
    username, room_code = session.get('username'), session.get('room_code')
    moveMadeBy = ""
    if rooms[room_code]["player1"] == username:
        moveMadeBy = "White"
    else:
        moveMadeBy = "Black"
    send({moveMadeBy: moveMadeBy, source: data["source"], destination: data["destination"]}, to=room_code)
    rooms[room_code]["allMoves"] += [ moveMadeBy, data["source"], data["destination"] ]
    print(f"Latest move by {username}'s ({moveMadeBy}) is piece from {data['source']} moved to piece at {data['dest']}")

def startGame():




# Run the flask server
if __name__ == '__main__':
    socketio.run(app, debug=True)
