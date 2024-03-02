from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, validator
from beanie import Document, PydanticObjectId
from datetime import datetime
from bson import ObjectId
import config

class HolidayType(str, Enum):
  FESTIVAL = 'Festival'
  REGIONAL = 'Regional'
  NATIONAL = 'National'
  INTERNATIONAL = 'International'

class DayOfWeek(str, Enum):
  MONDAY = 'Monday'
  TUESDAY = 'Tuesday'
  WEDNESDAY = 'Wednesday'
  THURSDAY = 'Thursday'
  FRIDAY = 'Friday'
  SATURDAY = 'Saturday'
  SUNDAY = 'Sunday'

class Holiday(BaseModel):
  """
    Container for a single holiday record.
  """
  date: str = Field(..., index=True, unique=True)
  name: str
  type: HolidayType
  
  """
    Configures Pydantic to allow population by field name, and encode ObjectId instances as strings when converting to JSON
  """
  model_config = ConfigDict(
    arbitrary_types_allowed = True,
    json_encoders = { ObjectId: str },
    populate_by_name = True,
    json_schema_extra = {
      'example': {
        'date': datetime.strptime('2024-01-01', '%Y-%m-%d').date().isoformat(),
        'name': 'New Year\'s Day',
        'type': HolidayType.INTERNATIONAL,
      }
    }
  )
  
  class Settings:
    name = 'holidays'
    collection = 'holidays'
    
  @validator('date', pre=True)
  def parse_date(cls, v: str):  
    for fmt in config.DATE_FORMATS:
      try:
        return datetime.strptime(v, fmt).date().isoformat()
      except ValueError:
        pass
    raise ValueError('Invalid date format')
  
class HolidayDocument(Holiday, Document):
  # The primary key for the Holiday, stored as a `str` on the instance.
  # This will be aliased to `_id` when sent to MongoDB,
  # but provided as `id` in the API requests and responses.
  id: Optional[PydanticObjectId] = Field(alias='_id', default=None)
  dayOfWeek: DayOfWeek

  