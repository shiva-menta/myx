# syntax=docker/dockerfile:1

FROM python:3.9-slim-buster
ENV PYTHONUNBUFFERED 1
RUN mkdir /code

WORKDIR /code

RUN pip install pipenv
# COPY requirements.txt /code/
COPY Pipfile Pipfile.lock ./
RUN pipenv install

COPY . .

# curl download for debugging
RUN apt-get update && apt-get install -y curl

# CMD python run.py
CMD pipenv run gunicorn --bind 0.0.0.0:8000 -w 3 run:app