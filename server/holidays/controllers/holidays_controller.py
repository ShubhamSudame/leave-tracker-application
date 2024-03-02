from fastapi import APIRouter, HTTPException, Query, status, Response
from database.schemas.holidays_schema import Holiday, HolidayDocument, HolidayType
from typing import List, Optional
from datetime import datetime
from utils import find_date_format

holidays_router = APIRouter()
  
@holidays_router.get('/holidays', response_model=List[HolidayDocument])
async def get_holidays(
  year: Optional[int] = None,
  month: Optional[int] = None,
  type: Optional[HolidayType] = None,
  from_: Optional[str] = Query(None, alias='from'),
  to: Optional[str] = Query(None),
  days: Optional[List[str]] = Query(None),
  notdays: Optional[List[str]] = Query(None) 
):
  if month is not None and year is None:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Year must be provided if month is provided')
  if from_ is not None and to is not None and datetime.strptime(from_, find_date_format(from_)) > datetime.strptime(to, find_date_format(to)):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='from date must be before to date')
  if days is not None and notdays is not None and set(days) & set(notdays):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='"days" and "notdays" lists must not have any common elements')
  
  query = {}
  if year is not None:
    query['date'] = { '$regex': f'^{year}'}
  if month is not None:
    query['date'] = { '$regex': f'^{year}-{month:02d}' }
  if type is not None:
    query['type'] = type
  if from_ is not None:
    query.setdefault('date', {})['$gte'] = from_
  if to is not None:
    query.setdefault('date', {})['$lte'] = to
  if days is not None:
    query['dayOfWeek'] = { '$in': days }
  if notdays is not None:
    query['dayOfWeek'] = { '$nin': notdays }
  return await HolidayDocument.find(query).to_list()

@holidays_router.put('/holidays', response_model=HolidayDocument)
async def add_holiday(holiday: Holiday) -> HolidayDocument:
  try:
    existing_holiday = await HolidayDocument.find_one({ 'date': holiday.date })
    if existing_holiday:
      await existing_holiday.update({ '$set': holiday.model_dump(exclude={'id'}) })
      return existing_holiday
    new_holiday = HolidayDocument(**holiday.model_dump(), dayOfWeek=datetime.strptime(holiday.date, find_date_format(holiday.date)).strftime('%A'))
    await new_holiday.insert()
    return new_holiday
  except:
    return {}
  
@holidays_router.delete('/holidays/{date}')
async def delete_holiday(date: str):
  holiday = await HolidayDocument.find_one({ 'date': date })
  if not holiday:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Holiday not found')
  await holiday.delete()
  return Response(status_code=status.HTTP_204_NO_CONTENT)