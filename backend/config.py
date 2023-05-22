import os

def get_env_variable(name):
    try:
        return os.environ.get(name) 
    except KeyError:
        message = "Expected environment variable '{}' not set.".format(name)
        raise Exception(message)

DB_FILE = "songs.db"

pg_username = get_env_variable('POSTGRES_USER')
pg_password = get_env_variable('POSTGRES_PASSWORD')
pg_host = get_env_variable('POSTGRES_HOST')
pg_port = get_env_variable('POSTGRES_PORT')
pg_db = get_env_variable('POSTGRES_DB')
redis_url = get_env_variable('REDIS_URL')
backend_url = get_env_variable('BACKEND_URL')
frontend_url = get_env_variable('FRONTEND_URL')
database_url = get_env_variable('DATABASE_URL')
CLIENT_ID = get_env_variable('CLIENT_ID')
CLIENT_SECRET = get_env_variable('CLIENT_SECRET')
SECRET_KEY = get_env_variable('SECRET_KEY')
IS_TESTING = get_env_variable('IS_TESTING') or 'False'

DEV_DB = f'sqlite:///{DB_FILE}'

# Testing Mode
# PROD_DB = database_url or f'postgresql://{pg_username}:{pg_password}@{pg_host}:{pg_port}/{pg_db}'
# Deployment Mode
PROD_DB = database_url.replace('postgres://', 'postgresql://', 1)