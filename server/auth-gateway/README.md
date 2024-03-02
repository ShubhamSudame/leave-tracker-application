## Auth Gateway

This auth-gateway project is implemented using [NestJS](https://github.com/nestjs/nest) framework in TypeScript language. It serves as the authentication and authorization layer, and user store for the application.

## Docker
The Auth Gateway includes Docker-compose and Dockerfile for easy deployment and containerization. PostgreSQL database is used for development and production. TypeORM is the Object-Relation Mapper used to interact with the database.

## Installation of dependencies

```bash
$ cd server/auth-gateway/
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Usage of REST APIs
The list of REST API endpoints can be viewed by starting the app and accessing http://localhost:3000/api to view the OpenAPIv3 documentation.

## Testing
The Auth Gateway includes comprehensive unit and integration tests using the Jest Testing framework.
The Unit test files are present within the component folders, while the integration test files are situated in test/ folder. The integration testing makes use of Better-SQLite3 as the in-memory database for testing.

```bash
# Run all unit and integration tests
$ npm run test

# Run specific test file
$ npm run test:spec src/auth/auth.controller.spec.ts
$ npm run test:spec test/integration/controllers/auth.controller.spec.ts
```

## License
This project is licensed under the MIT License.
