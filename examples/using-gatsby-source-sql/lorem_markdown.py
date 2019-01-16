import requests
import sqlite3
from random import randint
import datetime

url = 'https://jaspervdj.be/lorem-markdownum/markdown.txt'

with sqlite3.connect('./data/sqlite_markdown.sqlite3') as conn:
    cur = conn.cursor()
    cur.execute('DROP TABLE IF EXISTS articles;')
    cur.execute('''CREATE TABLE "articles" (
        "id"	INTEGER NOT NULL UNIQUE,
        "title"	TEXT,
        "slug"	TEXT,
        "body"	TEXT,
        "date"	TEXT,
        PRIMARY KEY("id")
    );''')

    insert_sql = '''INSERT INTO articles (
        title,
        slug,
        body,
        date
    ) VALUES (?,?,?,?);'''

    today = datetime.datetime.now()
    startdate = today - datetime.timedelta(3)

    for i in range(10):

        response = requests.get(url, params={
            'underline-headers': 'off',
            'no-external-links': 'on',
            'no-code': 'on'})

        lines = response.text.splitlines()
        title = lines[0][2:]
        slug = title.replace(' ', '-').lower()
        date = startdate + datetime.timedelta(randint(0, 7))
        body = ' \n'.join(lines[1:])

        cur.execute(insert_sql, (
            title,
            slug,
            body,
            date.strftime('%Y-%m-%d')))
