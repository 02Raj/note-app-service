# Note App Service Architecture

This document describes the current architecture of the Note App backend as implemented in the codebase.

## 1. Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js (v5)
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (`jsonwebtoken`)
- **File Upload and Storage:** Multer + Cloudinary (`multer-storage-cloudinary`, `cloudinary`)
- **AI Integration:** Google Gemini via `@google/generative-ai` and `@google/genai`
- **Document Parsing:** `pdf-parse` (PDF), `mammoth` (DOCX)
- **HTTP Client:** `axios`
- **Environment Variables:** `dotenv`
- **Dev Tooling:** `nodemon`

## 2. Current Project Structure

```text
note-app-service/
├── ARCHITECTURE.md
├── package.json
└── server/
        ├── app.js
        ├── server.js
        ├── config/
        │   └── env.js
        ├── controllers/
        │   ├── auth.controller.js
        │   ├── contact.controller.js
        │   ├── daily-routine-dashboard.controller.js
        │   ├── dailyRoutine.controller.js
        │   ├── dashboard.controller.js
        │   ├── deadline.controller.js
        │   ├── gemini.controller.js
        │   ├── mockInterview.controller.js
        │   ├── notes.controller.js
        │   ├── plan.controller.js
        │   ├── progress.controller.js
        │   ├── resource.controller.js
        │   ├── resume.controller.js
        │   ├── revision.controller.js
        │   ├── subtopics.controller.js
        │   └── topics.controller.js
        ├── middlewares/
        │   ├── auth.middleware.js
        │   ├── cloudinary.config.js
        │   ├── error.middlewares.js
        │   └── updateLastActivity.js
        ├── models/
        │   ├── contact.model.js
        │   ├── dailytask.model.js
        │   ├── deadline.model.js
        │   ├── deletedNote.model.js
        │   ├── mockInterview.model.js
        │   ├── note.model.js
        │   ├── plan.model.js
        │   ├── progress.model.js
        │   ├── resource.model.js
        │   ├── session.model.js
        │   ├── subtopic.model.js
        │   ├── topic.model.js
        │   └── user.model.js
        ├── routes/
        │   ├── auth.routes.js
        │   ├── contact.routes.js
        │   ├── dailyRoutine.routes.js
        │   ├── dashboard.routes.js
        │   ├── dashboardroutes.addition.js
        │   ├── deadlines.routes.js
        │   ├── gemini.routes.js
        │   ├── mockInterview.routes.js
        │   ├── notes.routes.js
        │   ├── plan.routes.js
        │   ├── progress.routes.js
        │   ├── resource.routes.js
        │   ├── resume.routes.js
        │   ├── revision.routes.js
        │   ├── subtopics.routes.js
        │   └── topics.routes.js
        ├── services/
        │   ├── contact.service.js
        │   ├── daily-routine-dashboard.service.js
        │   ├── dailyRoutine.service.js
        │   ├── dailyRoutineGemini.service.js
        │   ├── dashboard.service.js
        │   ├── deadline.service.js
        │   ├── gemini.service.js
        │   ├── mockInterview.service.js
        │   ├── notes.service.js
        │   ├── plan.service.js
        │   ├── progress.service.js
        │   ├── resource.service.js
        │   ├── resume.service.js
        │   ├── revision.service.js
        │   ├── subtopics.service.js
        │   ├── topic.service.js
        │   └── user.service.js
        └── utils/
                ├── ApiError.js
                ├── cloudinary.helper.js
                ├── db.js
                └── responseHelper.js
```

### Directory Responsibilities

- **`config/`**: Environment and API key configuration.
- **`controllers/`**: HTTP layer, request parsing, status codes, response formatting.
- **`middlewares/`**: Cross-cutting concerns such as auth and global error handling.
- **`models/`**: Mongoose schemas and indexes.
- **`routes/`**: Endpoint declarations and middleware composition.
- **`services/`**: Core business logic and integrations (DB and Gemini).
- **`utils/`**: Shared helpers for DB connection and response formatting.

## 3. Architectural Pattern

The service follows a layered **Route -> Controller -> Service -> Model** architecture:

1. Route maps an endpoint and binds middleware.
2. Controller validates request data and orchestrates the action.
3. Service executes domain logic and external API calls.
4. Model handles persistence in MongoDB.
5. Controller returns standardized response JSON.

This pattern keeps transport concerns separate from business logic and improves maintainability.

## 4. Runtime Composition

`server/app.js` is the composition root for middleware and route registration.

Mounted API groups:

- `/api/auth`
- `/api/topics`
- `/api/subtopics`
- `/api/notes`
- `/api/progress`
- `/api/deadlines`
- `/api/gemini`
- `/api/revisions`
- `/api/mock-interview`
- `/api/resource`
- `/api/dashboard`
- `/api/resume`
- `/api/plans`
- `/api/contact`
- `/api/routine`

Global middlewares in active use:

- `cors()`
- `express.json()`
- `errorHandler` from `error.middlewares.js` (registered after routes)

`server/server.js` starts the HTTP server using `process.env.PORT` with fallback `5000`.

## 5. Request and Data Flow

Typical protected flow:

1. Client sends request with `Authorization: Bearer <token>`.
2. Route applies `auth.middleware.js`.
3. Auth middleware verifies JWT and sets both `req.user.id` and `req.userId`.
4. Controller calls a service function.
5. Service interacts with Mongoose models and optional Gemini APIs.
6. Controller returns `successResponse(...)` or `errorResponse(...)`.
7. Unhandled errors are captured by the global `errorHandler` middleware.

Session-related behavior:

- On login, `user.service.js` creates a `Session` document and returns `sessionId` with JWT.
- `updateLastActivity.js` is present for tracking heartbeat-style activity updates using session id headers/body.

## 6. Core Feature Modules

### Authentication and User

- `POST /api/auth/register`
- `POST /api/auth/login`
- Password hashing with `bcryptjs`.
- JWT contains `userId` and `role`.
- User profile fields include `jobProfile`, `bio`, and `avatar` metadata.

### Topic, Subtopic, Notes, Progress, Deadlines, Revision

- Topic and subtopic CRUD-style endpoints.
- Notes endpoints support create/update/get/list by topic/list by subtopic/delete.
- Notes store revision metadata (`lastRevisedAt`, `revisionDueDate`, `revisionStage`, `skippedCount`).
- Progress tracks percentage per topic/subtopic/user with a unique compound index.
- Deadlines support create/list/status update/delete.
- Revision routes support due items, drill, weak notes, and complete actions.

### Daily Routine and Productivity Dashboard

`/api/routine/*` combines task planning and analytics:

- Template management (`/templates`).
- Daily log lifecycle (`/today`, `/log/:date`, task toggle).
- Tracking helpers (`/recent`, `/streak`).
- AI insight generation (`/log/:date/insight`).
- Dashboard views (`/dashboard`, `/dashboard/eod`, `/dashboard/pattern`, `/dashboard/focus`, `/dashboard/job-readiness`).

Data is modeled via `TaskTemplate` and `DailyLog` in `dailytask.model.js` with one-log-per-user-per-date indexing.

### Gemini-Powered Features

Gemini usage is spread across modules:

- `gemini.service.js`
    - Text analysis: preparation analysis.
    - JSON generation helper (`generateJson`) with response cleanup/parsing.
    - Resume analysis prompt generation.
    - Resource content analysis prompt generation.
- `dailyRoutineGemini.service.js`
    - Uses `@google/genai` and model `gemini-2.5-flash-preview-04-17` for daily coaching insights.
- `mockInterview.service.js`
    - AI-generated interview questions.
    - AI-generated detailed feedback and summary.

### Mock Interview

Endpoints under `/api/mock-interview`:

- `POST /start`
- `POST /answer`
- `GET /results/:sessionId`
- `POST /pause`
- `POST /resume`
- `GET /history/:userId`

State transitions are driven by `status` values: `InProgress`, `Paused`, `Completed`.

### Resume and Resource Uploads

- Resume route: `POST /api/resume/analyze`
    - Accepts file upload (`multer` + Cloudinary).
    - Downloads uploaded file from Cloudinary URL.
    - Extracts text from PDF or DOCX.
    - Sends extracted text for Gemini analysis.

- Resource routes under `/api/resource`
    - Upload file or save external link.
    - Fetch by topic.
    - Delete resource and Cloudinary object when applicable.

### Smart Plan and Contact

- Plans (`/api/plans`) generate AI-based study plans, mark status, and expose progress summary.
- Contact (`/api/contact`) supports public submit and list retrieval.

## 7. Database Schema Overview

Current models in active codebase:

- **User**: user identity, role, profile fields.
- **Session**: login sessions (`startTime`, `endTime`, `duration`, `lastActivityTime`).
- **Topic** and **Subtopic**: learning content hierarchy.
- **Note**: notes plus spaced-revision tracking fields.
- **DeletedNote**: soft archive/restore metadata for deleted notes.
- **Progress**: topic/subtopic progress percentages.
- **Deadline**: due-date tracking by user/topic/subtopic.
- **Plan**: generated study plan entries and completion status.
- **TaskTemplate** and **DailyLog** (from `dailytask.model.js`): daily routine planning and execution logs.
- **MockInterview**: interview sessions, answers, feedback, score.
- **Resource**: file/link resources mapped to topics/subtopics.
- **Contact**: contact form submissions.

## 8. Error Handling and Response Strategy

- `responseHelper.js`
    - `successResponse(res, data, message, statusCode)`
    - `errorResponse(res, error, statusCode)`
- `error.middlewares.js`
    - Catch-all global handler logs stack and returns structured JSON error response.

Both patterns are used in the codebase: some modules rely on helper responses, while some controllers return direct `res.status(...).json(...)` responses.

## 9. Notes and Improvement Opportunities

- **Route consistency:** Most routes are mounted under plural nouns, but there are mixed naming patterns (`/api/resource`, `/api/plans`, `/api/routine`).
- **Validation:** Input validation is mostly manual; introducing Joi or Zod would reduce edge-case failures.
- **Testing:** Unit/integration test coverage is not yet implemented.
- **Documentation:** Endpoint-level API docs (OpenAPI/Swagger) would improve consumer onboarding.
- **Cleanup:** `dashboardroutes.addition.js` exists but is not mounted in `app.js`.