# syntax=docker/dockerfile:1

FROM python:3.9-slim-buster
ENV PYTHONUNBUFFERED 1
RUN mkdir /code

WORKDIR /code

COPY requirements.txt /code/
RUN pip3 install -r requirements.txt

COPY . /code/

# CMD python run.py
CMD gunicorn --bind 0.0.0.0:5000 -w 3 run:app