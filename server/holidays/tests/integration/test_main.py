from fastapi.testclient import TestClient
from fastapi import status
from main import app
import pytest

client = TestClient(app=app)

def test_create_holiday():
  request_body = {
    'date': '2024-01-01',
    'name': 'New Year\'s Day',
    'type': 'International'
  }
  response = client.put('/holidays', json=request_body)
  assert response.status_code == status.HTTP_200_OK
  assert response.json()['date'] == request_body.date
  
"""
  Unit Tests
  1. Validation of Schema
    i. date, name, type must be provided for the add holiday controller
    ii. type must match HolidayType
    iii. The query parameters must be provided correctly for get holidays controller
    iv. Provide date in an unrecognized format
  Integration Tests
  1. Test add holiday for idempotency for using same date, which should update the object in the database
  2. Test delete holiday, check multiple deletions
  3. Test get holidays, with different query parameters
"""