from flask import Flask, render_template, redirect, request, json, jsonify, session, flash  # Import Flask and render_template classes from the flask module.
from flask_cors import CORS
from flask_session import Session  # to store user details for the duration of a session.
import sqlite3
from coolname import generate_slug  # to create random room codes
import os  # to create a directory for the databases, if a directory doesn't exist already.

path = "Databases"
if not os.path.exists(path):
    os.makedirs(path)

# Create the databases
database = sqlite3.connect('Databases/users.db')
database.execute("CREATE TABLE IF NOT EXISTS USERS (username TEXT PRIMARY KEY, password TEXT, wins INT DEFAULT 0, losses INT DEFAULT 0, draws INT DEFAULT 0)") # text passwords for now, encrypt later.
database = sqlite3.connect('Databases/currGameInstances.db')
database.execute("CREATE TABLE IF NOT EXISTS GAMES (roomname TEXT PRIMARY KEY, player1username TEXT, player2username TEXT, gameState TEXT)")

# Create the flask server and initialise the session
app = Flask(__name__, template_folder='webpages')
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
CORS(app)

# Miscellaneous global variables
allcurrentroomcodes = set()

# All the routes and their associated functions:
@app.route("/")
def auth():
    return render_template("auth.html")


@app.route("/userdata", methods=['POST'])
def handleUser():
    username = request.form.get('username')
    password = request.form.get('password')
    room_code = request.form.get('room_code')

    if room_code:
        print(f"Username is {username}, password is {password}, room code is {room_code}.")
    else:
        print(f"Username is {username}, password is {password}. Generating a room code. Will use the room code if the username and password are valid.")
        room_code = generate_slug()
        while room_code in allcurrentroomcodes:
            room_code = generate_slug()
        allcurrentroomcodes.add(room_code)

    # First, check if this user exists in the database.
    with sqlite3.connect('Databases/users.db') as database:
        cursor = database.cursor()
        query = f'SELECT username, password FROM USERS WHERE username="{username}"'
        cursor.execute(query)
        data = cursor.fetchall()  # List of tuples

        if len(data) != 0:  # Check if user already exists in the database
            if(data[0][1] != password):
                flash("This username already exists in the database, but the entered password is incorrect. Either enter the correct password, or use a different username to create an account.")
                return redirect("/", code=302)
            else:
                print("Successfully logged in!")
                session['username'], session['room_code'] = username, room_code
                return redirect(f"/waiting", code=302)
        else:
            print("New user, creating an account.")
            cursor.execute("INSERT INTO USERS (username, password) VALUES (?, ?)", (username, password))
            database.commit()
            print("Successfully added this user to the database!")
            session['username'], session['room_code'] = username, room_code
            return redirect(f"/waiting", code=302)


@app.route("/waiting")
def waitForPlayer():
    username, room_code = session.get('username'), session.get('room_code')
    return render_template("waitingroom.html", username=username, room_code=room_code)


# Run the flask server
if __name__ == '__main__':
    app.run(debug=True)

