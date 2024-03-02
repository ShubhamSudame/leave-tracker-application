# Build Stage
# Build docker image on a base image
FROM node:20.9.0-alpine AS build

# Create a working directory in this container
WORKDIR /usr/src/app

# Copy all the package.json, package-lock.json into the working directory
COPY package*.json ./

# Install all the dependencies
RUN npm install

# Copy the source code
COPY . .

# Generate the bundle that transpiles TypeScript into JavaScript to ./dist folder in working directory
RUN npm run build

# Production Stage
FROM node:20.9.0-alpine

WORKDIR /usr/src/app

# Copy the generated dist folder from the build stage into the current production stage working directory
COPY --from=build /usr/src/app/dist ./dist

COPY package*.json ./

# Install production dependencies, not dev-dependencies
RUN npm install --omit=dev

# Remove the package.json and package-lock.json files as they aren't needed anymore
RUN rm package*.json

EXPOSE 3000

# Start the NestJS server
CMD ["node", "dist/main.js"]