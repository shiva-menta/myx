from app import app
import config

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8000)