import sys
import json
import requests
from pprint import pprint
from datetime import datetime
import mysql.connector

# Database connection
def connect_to_db():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Whz980320!",
        database="userDatabase"
    )
    return connection

# Insert parking record
def insert_parking_record(connection, license_plate, entry_time):
    cursor = connection.cursor()
    query = "INSERT INTO parking_records (license_plate, entry_time) VALUES (%s, %s)"
    cursor.execute(query, (license_plate, entry_time))
    connection.commit()
    return cursor.lastrowid

def post_request(image):
    regions = ['us']
    with open(image, 'rb') as fb:
        response = requests.post(
            'https://api.platerecognizer.com/v1/plate-reader/',
            data=dict(regions=regions),
            files=dict(upload=fb),
            headers={'Authorization': 'YOUR API TOKEN FROM platerecognizer.com'})
    return response.json()

def parse_json(response_json):
    LP = response_json['results'][0]['plate'].upper()
    return LP

def current_time():
    now = datetime.now()
    d_string = now.strftime("%Y-%m-%d")
    t_string = now.strftime("%H:%M:%S")
    return f'{d_string} {t_string}'

if __name__ == '__main__':
    image = sys.argv[1]
    print('Processing Image:', image)
    response_json = post_request(image)
    license_plate = parse_json(response_json)
    print('License Plate:', license_plate)
    entry_time = current_time()
    print('Entry Time is:', entry_time)

    # Connect to the database
    connection = connect_to_db()

    # Insert parking record
    record_id = insert_parking_record(connection, license_plate, entry_time)

    # Close the database connection
    connection.close()
