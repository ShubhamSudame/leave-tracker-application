# Leave Tracker Application
A sample application to build a leave-tracker, useful for organizations to manage the leaves of each employee.
Developed using NestJS, FastAPI, with a React Next.js frontend.

Below is the architecture diagram of the application, where the REST API is exposed via auth-gateway to the users.

The auth-gateway uses PostgreSQL database and the holidays service makes use of MongoDB database for storing data.

![alt text](<diagrams/architecture/Leave Tracker Architecture Diagram.drawio.png>)