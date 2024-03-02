from dotenv import load_dotenv
import os

load_dotenv()

ME_CONFIG_MONGODB_URL = os.environ.get('ME_CONFIG_MONGODB_URL')
PORT = os.environ.get('PORT')
MONGODB_INITDB_DATABASE = os.environ.get('MONGODB_INITDB_DATABASE')
DATE_FORMATS = {'%Y-%m-%d', '%d-%m-%Y', '%m-%d-%Y', '%Y/%m/%d', '%d/%m/%Y', '%m/%d/%Y'}