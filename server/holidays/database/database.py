from beanie import init_beanie
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from .schemas.holidays_schema import HolidayDocument
import config

class Database:
  _instance = None
  client: AsyncIOMotorClient = None
  
  def __new__(cls):
    if cls._instance is None:
      cls._instance = super(Database, cls).__new__(cls)
    return cls._instance
  
  async def connect_to_database(self):
    self.client = AsyncIOMotorClient(config.ME_CONFIG_MONGODB_URL)
    await init_beanie(database=self.client[config.MONGODB_INITDB_DATABASE], document_models=[HolidayDocument])
    print('Connected to the underlying MongoDB')
    
  def disconnect_from_database(self):
    self.client.close()
    
  async def get_database(self) -> AsyncIOMotorClient:
    return self.client[config.MONGODB_INITDB_DATABASE]
  
  def init(self, app: FastAPI):
    app.add_event_handler('startup', self.connect_to_database)
    app.add_event_handler('shutdown', self.disconnect_from_database)
    # app.state.beanie = self.client.holidays
    