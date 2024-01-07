# To run the server locally:
Clone this git repository first. Then, follow these steps:

## First time setup:
### For Linux:
1a. First, create a virtual environment for python using ```virtualenv .venv``` in your current directory.  
1b. Now, activate this virtual environment using ```source .venv/bin/activate``` for Bash.  

### For Windows:
1a. First, install the latest version of Python 3 (Python 3.xx) from the Microsoft Store (or, install it in your preferable method.)    
1b. Next, create a virtual environment for python using ```python -m venv .venv``` in your current directory.  
1c. Now, activate this virtual environment by typing ```.venv\Scripts\activate```.  

### Continue with these:
2. Now, install the required libraries by running ```pip install -r requirements.txt``` while in the virtual environment.  
3. Deactivate this virtual environment by typing ```deactivate```.  

## Every other time:
1 (Linux). Activate the virtual environment using ```source .venv/bin/activate``` for Bash.  
1 (Windows). Activate the virtual environment by typing ```.venv\Scripts\activate```.  
2. Now, run "python app.py" to start the server up.  
3. Navigate to the URL as printed in the terminal (usually http://127.0.0.1:5000).  
4. After you're done, shut down the server by simply pressing ```Ctrl + C``` to terminate the Flask server.  
5. Deactivate this virtual environment by typing ```deactivate```.  

---
