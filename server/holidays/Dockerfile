# Use Python 3.10 alpine as base image
FROM python:3.10-alpine3.19

# Set working directory to /app
WORKDIR /app

# Copy the current directory contents into the container
COPY . /app

# Install poetry as the dependency manager
RUN pip install poetry

# Install production dependencies of the project
RUN poetry install --no-root

# Expose the port that the project will run on
EXPOSE 8000

# Run the production code
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]