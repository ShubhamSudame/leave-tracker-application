from datetime import datetime
import config

def find_date_format(date_string: str) -> str:
  for date_format in config.DATE_FORMATS:
    try:
      datetime.strptime(date_string, date_format)
      return date_format
    except ValueError:
      pass
  raise ValueError('Invalid date format')