# Note App Service Architecture

This document outlines the architecture of the Note App service, a Node.js application designed to provide backend services for a note-taking application.

## 1. Technology Stack

The application is built with the following technologies:

- **Backend Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **Authentication:** [JSON Web Tokens (JWT)](https://jwt.io/)
- **File Storage:** [Cloudinary](https://cloudinary.com/) for media uploads
- **AI Integration:** [Google Gemini API](https://ai.google.dev/)
- **Environment Management:** [dotenv](https://www.npmjs.com/package/dotenv)
- **Real-time Development:** [nodemon](https://nodemon.io/)

## 2. Project Structure

The project follows a standard feature-based structure, which promotes separation of concerns and modularity.

```
note-app-service/
├── .gitignore
├── package-lock.json
├── package.json
└── server/
    ├── app.js
    ├── server.js
    ├── config/
    │   └── env.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── dashboard.controller.js
    │   ├── deadline.controller.js
    │   ├── gemini.controller.js
    │   ├── mockInterview.controller.js
    │   ├── notes.controller.js
    │   ├── progress.controller.js
    │   ├── resource.controller.js
    │   ├── revision.controller.js
    │   ├── subtopics.controller.js
    │   └── topics.controller.js
    ├── middlewares/
    │   ├── auth.middleware.js
    │   ├── cloudinary.config.js
    │   └── error.middlewares.js
    ├── models/
    │   ├── deadline.model.js
    │   ├── mockInterview.model.js
    │   ├── note.model.js
    │   ├── progress.model.js
    │   ├── resource.model.js
    │   ├── subtopic.model.js
    │   ├── topic.model.js
    │   └── user.model.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── dashboard.routes.js
    │   ├── deadlines.routes.js
    │   ├── gemini.routes.js
    │   ├── mockInterview.routes.js
    │   ├── notes.routes.js
    │   ├── progress.routes.js
    │   ├── resource.routes.js
    │   ├── revision.routes.js
    │   ├── subtopics.routes.js
    │   └── topics.routes.js
    ├── services/
    │   ├── dashboard.service.js
    │   ├── deadline.service.js
    │   ├── gemini.service.js
    │   ├── mockInterview.service.js
    │   ├── notes.service.js
    │   ├── progress.service.js
    │   ├── resource.service.js
    │   ├── revision.service.js
    │   ├── subtopics.service.js
    │   ├── topic.service.js
    │   └── user.service.js
    └── utils/
        ├── db.js
        └── responseHelper.js
```

### Directory Breakdown

- **`config`**: Contains configuration files, primarily for managing environment variables.
- **`controllers`**: Each file corresponds to a resource (e.g., `notes.controller.js`) and handles incoming HTTP requests, validates input, and calls the appropriate service to execute business logic.
- **`middlewares`**: Holds custom middleware functions. Key middleware includes authentication checks (`auth.middleware.js`) and error handling.
- **`models`**: Defines the Mongoose schemas for all database collections (e.g., `user.model.js`, `note.model.js`).
- **`routes`**: Defines the API endpoints. Each file maps HTTP methods and URLs to specific controller functions.
- **`services`**: Contains the core business logic of the application. Controllers delegate tasks to these services. This keeps the controllers lean and focused on handling the HTTP layer.
- **`utils`**: Includes utility modules, such as the database connection setup (`db.js`) and response helpers.

## 3. Architectural Pattern

The application employs a layered architecture that is a variation of the **Model-View-Controller (MVC)** pattern, often referred to as a **Model-Service-Controller** or **Service-Oriented Architecture**.

- **Models**: Represent the data structure and interact with the database.
- **Services**: Encapsulate the business logic.
- **Controllers**: Handle the presentation logic (in this case, the API request/response cycle).
- **Routes**: Map URLs to controllers.

This separation makes the application easier to maintain, scale, and test.

## 4. Data Flow

A typical API request flows through the application as follows:

1.  **HTTP Request**: A client sends a request to an API endpoint (e.g., `POST /api/notes`).
2.  **Routing**: The Express router defined in `server/app.js` and the corresponding file in `server/routes/` matches the endpoint and directs the request to the appropriate controller function (e.g., `createNote` in `notes.controller.js`).
3.  **Middleware**: The request passes through any configured middleware, such as the authentication middleware which verifies the JWT.
4.  **Controller**: The controller function receives the request, extracts relevant data from the request body, parameters, or query string.
5.  **Service**: The controller calls the corresponding service function (e.g., `notes.service.js`) to perform the main business logic.
6.  **Model**: The service interacts with the database through Mongoose models to create, read, update, or delete data.
7.  **Response**: The service returns the result to the controller, which then formats and sends the HTTP response back to the client.

## 5. Key Components

### Authentication

Authentication is handled using JWT. The flow is as follows:
1.  A user logs in with their credentials via `/api/auth/login`.
2.  The `auth.controller.js` uses the `user.service.js` to validate the credentials.
3.  Upon successful validation, a JWT is generated and sent back to the client.
4.  The client includes the JWT in the `Authorization` header for all subsequent requests to protected endpoints.
5.  The `auth.middleware.js` middleware intercepts these requests, verifies the JWT, and attaches the user's information to the request object.

### AI Integration (Google Gemini)

The application integrates with the Google Gemini API to provide AI-powered features.

- **`gemini.routes.js`**: Defines the `/api/gemini` endpoint.
- **`gemini.controller.js`**: The `trackPreparation` function in this controller is responsible for fetching all of a user's notes. It then formats these notes into a single string.
- **`gemini.service.js`**: This service receives the formatted notes and sends them to the Google Gemini API for analysis. It uses the `gemini-1.5-flash-latest` model to analyze the user's preparation based on their notes and provides suggestions for improvement.

This integration allows the application to offer a "preparation analysis" feature, giving users AI-powered feedback on their study habits.

### Mock Interview Feature

The application provides a mock interview feature to help users practice for technical interviews.

- **`mockInterview.routes.js`**: Defines endpoints for starting interviews, submitting answers, and getting feedback.
- **`mockInterview.controller.js`**: Handles the logic for creating interview sessions, processing user answers, and interacting with the Gemini API for generating questions and feedback.
- **`mockInterview.service.js`**: Contains the core business logic for the mock interview feature, including communication with the Gemini API to get interview questions and evaluate answers.
- **`gemini.service.js`**: The Gemini service is also used by the mock interview feature to generate questions and analyze user responses, providing a realistic interview experience.

## 6. Database Schema

The application uses several Mongoose models to define the database schema. The key models are:

- **`User`**: Stores user information, including name, email, and hashed password.
- **`Topic`**: Represents a topic created by a user.
- **`Subtopic`**: Represents a sub-topic within a topic.
- **`Note`**: Stores the content of a note, linked to a sub-topic.
- **`MockInterview`**: Stores details about mock interview sessions, including questions, user answers, and AI-generated feedback.
- **`Progress`**: Tracks the user's progress on different topics.
- **`Deadline`**: Stores deadlines for topics.
- **`Resource`**: Stores external resources related to topics.
- **`Revision`**: Manages revision schedules for topics.

These models are interconnected to create a relational-like structure within the NoSQL database.

## 7. Error Handling

The application uses a centralized error handling mechanism.

- **`error.middlewares.js`**: A custom error-handling middleware can be implemented to catch errors that occur in the application.
- **`responseHelper.js`**: The `successResponse` and `errorResponse` functions in this utility provide a consistent format for all API responses, which simplifies error handling on the client-side.

## 8. Future Improvements

- **Implement comprehensive testing**: Add unit and integration tests to ensure code quality and reliability.
- **Input validation**: Use a library like Joi or express-validator to implement robust input validation in the controllers.
- **Caching**: Introduce a caching layer (e.g., Redis) to improve performance for frequently accessed data.
- **API Documentation**: Generate API documentation using a tool like Swagger or Postman to make the API easier to consume.