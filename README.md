
# Recruitment Website

A comprehensive recruitment platform where job seekers can find their desired positions,
employers can discover the right candidates, and administrators can efficiently manage the
system.

# Install And Run

- Clone the project.
- Set up the environment variable file (.env).
- Use "npm install" to install all dependencies.
- Run project with "npm start"

# Environment Configuration

This document provides instructions on how to configure the environment variables for the Recruitment Website project. These variables are stored in a .env file and are essential for the application's functionality.

## Database Configuration
MONGODB_URI: The connection string for MongoDB. This includes the protocol, username, password, cluster address, and database name. Ensure the retryWrites and w parameters are set appropriately for your configuration.

## Server Configuration
PORT: The port number on which the application server will run.

## Thread Pool Configuration
UV_THREADPOOL_SIZE: Number of threads to use in the libuv threadpool. This can affect the performance of I/O operations.

## Frontend URL
FE_URL: The URL where the frontend of the application is hosted.

## JWT Configuration
JWT_SECRET_KEY: The secret key used for signing JSON Web Tokens (JWT).
JWT_REFRESH_KEY: The secret key used for signing refresh tokens.

## Email Configuration
MAIL_SEND: The email address used for sending emails.

## Google OAuth Configuration
OAUTH_CLIENT_ID: The client ID for Google OAuth.
OAUTH_CLIENT_SECRET: The client secret for Google OAuth.
OAUTH_REDIRECT_URI: The redirect URI for Google OAuth.
OAUTH_REFRESH_TOKEN: The refresh token for Google OAuth.

## Redis Configuration
REDIS_PASSWORD: The password for accessing the Redis instance.
REDIS_URI: The URI for connecting to the Redis instance.

## Setting Up Your .env File
Create a file named .env in the root directory of your project and add the required environment variables in the following format:

- MONGODB_URI="your-mongodb-uri"

- PORT="your-port-number"

- UV_THREADPOOL_SIZE="your-threadpool-size"

- FE_URL="your-frontend-url"

- JWT_SECRET_KEY="your-jwt-secret-key"

- JWT_REFRESH_KEY="your-jwt-refresh-key"

- MAIL_SEND="your-email-address"

- OAUTH_CLIENT_ID="your-oauth-client-id"

- OAUTH_CLIENT_SECRET="your-oauth-client-secret"

- OAUTH_REDIRECT_URI="your-oauth-redirect-uri"

- OAUTH_REFRESH_TOKEN="your-oauth-refresh-token"

- REDIS_PASSWORD="your-redis-password"

- REDIS_URI="your-redis-uri"
