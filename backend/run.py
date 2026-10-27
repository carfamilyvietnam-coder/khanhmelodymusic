import os
from dotenv import load_dotenv

load_dotenv()

from app import create_app

app = create_app(os.getenv('FLASK_ENV', 'production'))

if __name__ == '__main__':
    config_name = os.getenv('FLASK_ENV', 'production')
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', '8882')),
        debug=config_name == 'development'
    )
