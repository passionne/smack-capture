#!/usr/bin/env python3
# -*- coding:utf-8 -*-

from flask import Flask, send_file, send_from_directory, redirect
from flask_cors import CORS

app = Flask(__name__, static_url_path='')
CORS(app, resources={r"/*": {"origins": "*"}})

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

@app.route('/api')
def api():
    return "Hello World !"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000 ,debug=True)
