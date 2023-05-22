# myx dj suite

## Purpose
Myx is a suite of tools to help DJs build mixes &amp; sets. I built this to help me and other beginner DJs create smoother and smarter mixes, all while putting the creative power in the hands of the DJ. Current version allows for mashup searching and shortest transition path searching.

## Tech Stack
* Frontend: React
* Backend: Flask & PostgreSQL
* State: Redis
* Deployment: Fly.io & Nginx

## Starting Instructions
### Development Mode (127.0.0.1)
_This mode is meant for developing new features, allowing quick code changes and immediate DOM updates._

Backend
* switch to DEV_DB in `app.py`
* `cd backend`
* `pipenv shell`
* `python run.py`

Database / State
* open up Docker Desktop
* comment out everything below line 8 in `docker-compose.yaml`
* run `docker-compose up --build`

Frontend
* `cd frontend`
* `npm install`
* `npm start`

### Testing Mode (myx.localhost)
_This mode is meant for verifying new features work in a containerized environment._
* open up Docker Desktop
* backend `.env`: uncomment only testing mode lines
* `config.py`: comment out appropriate database url
* frontend `Dockerfile`: comment out myxdj.live and uncomment myx.localhost
* frontend `nginx.conf`: comment out myxdj.live and uncomment myx.localhost
* uncomment out all containers in `docker-compose.yaml`
* run `docker-compose up --build` or `docker-compose up` as needed
* access the app at myx.localhost!

### Deployment Mode (myxdj.live)
_This mode is meant for deploying actual code to Fly.io._
* `config.py`: comment out appropriate database url
* frontend `Dockerfile`: comment out myx.localhost and uncomment myxdj.live
* frontend `nginx.conf`: comment out myx.localhost and uncomment myxdj.live

## Testing Instructions
For `backend` testing, run `IS_TESTING=True pytest` within your pipenv shell.

## Common Errors
_This section is meant to address any commonly reached problems when interacting with Myx locally._
* Development – (`CORS Errors`): CORS errors might pop up in the browser console when interacting with the application. Frequently, there is no actual CORS error, but instead a backend error (e.g. key error), that you'll be able to observe in the backend logs.
* Browser – (`INVALID_CLIENT: Invalid redirect URI`): The Spotify Web API is not configured properly with the API URL needed to run your app. Add a correct, valid redirect URI to the Web API.
* Backend – (`KeyError: 'access_token'`): The backend does not have the correct redirect URI to point to after authentication. Make sure to return the correct URI in the backend `.env` file.

## Next Steps
_This section is meant to layout the next steps for making Myx better._
* Initiate one HTTPS connection per session & maintain persistent connection.
* Use async / concurrency to reduce API response time for large playlist audio features.
* Implement caching / expiration for the /api/authenticate endpoint to minimize backend hits.
* Determine if double API calls in development logger are real or just debugger glitches.
