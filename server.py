#!/usr/bin/env python3
# -*- coding:utf-8 -*-

import os
from flask import Flask, send_file, send_from_directory, redirect, request, url_for, flash
from flask_cors import CORS
from werkzeug.utils import secure_filename

####
# Init Flask App
####
app = Flask(__name__, static_url_path='')
CORS(app, resources={r"/.*": {"origins": "*"}})


####
# Configure serve static files (html, js, css...)
####

@app.route('/index.html')
def send_index():
    return send_file('index.html')

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('css', path)

@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory('assets', path)

@app.route('/node_modules/<path:path>')
def send_node_modules(path):
    return send_from_directory('node_modules', path)

@app.route('/')
def homepage():
    return redirect("/index.html", code=302)


####
# Create endpoint "/up" with classic upload form
####

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/uploads/<filename>')
def send_uploads(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/up', methods=['GET', 'POST'])
def upload_file():
    upload_form = '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''

    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            upload_form += '''
            <img src="uploads/{0}" alt="{0}" />
            '''.format(filename)

    return upload_form


####
# Serve Apis
####

@app.route('/api')
def api():
    return "Hello World !"

@app.route('/api/v1/pictures', methods=['GET', 'POST'])
def api_upload_picture():
    if request.method == 'POST':
        # print(request, request.args, request.files, request.get_json())
        fileStorage = request.files['file']
        fileStorage.save("uploads/input_data.jpg")
    return data_processing("uploads/input_data.jpg")

####
# Start point to do data processing and output a json
####
def data_processing(input_file_path):
    return """{
    'status': 'success'
}"""

####
# Main - start Flask server
####
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000 ,debug=True)
