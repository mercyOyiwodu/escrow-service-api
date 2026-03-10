# Express.js Project

This is a simple Express.js application that provides a health check endpoint.

## Installation

1. Clone the repository or download the project files.
2. Navigate to the project directory:
   ```
   cd express-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Running the Server

To start the server, run the following command:
```
npm start
```

The server will start and listen on the specified port (default is 3000).

## Health Check Endpoint

You can check the health of the application by visiting the following URL in your browser or using a tool like Postman:
```
http://localhost:3000/health
```

This will return a JSON response:
```json
{ "status": "ok" }
```