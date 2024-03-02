from fastapi import FastAPI
from controllers.holidays_controller import holidays_router
from database.database import Database

app = FastAPI()

db = Database()
db.init(app)

app.include_router(holidays_router)