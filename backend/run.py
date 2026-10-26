from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    # Get configuration from environment
    config_name = os.getenv('FLASK_ENV', 'development')
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=8882,
        debug=config_name == 'development'
    )
