const swaggerUi = require("swagger-ui-express");

const port = process.env.PORT || 5000;
const serverUrl = process.env.SWAGGER_SERVER_URL || `http://localhost:${port}`;

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Note App Service API",
    version: "1.0.0",
    description:
      "Comprehensive API documentation for Note App Service. Most routes require JWT auth using the Authorization header as Bearer token.",
  },
  servers: [
    {
      url: serverUrl,
      description: "Primary API server",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Topics" },
    { name: "Subtopics" },
    { name: "Notes" },
    { name: "Progress" },
    { name: "Deadlines" },
    { name: "Gemini" },
    { name: "Revision" },
    { name: "Mock Interview" },
    { name: "Resources" },
    { name: "Dashboard" },
    { name: "Resume" },
    { name: "Plans" },
    { name: "Contact" },
    { name: "Daily Routine" },
    { name: "Expenses" },
    { name: "Food Log" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      SuccessEnvelope: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          message: { type: "string", example: "Operation successful" },
          data: { type: "object", additionalProperties: true },
        },
      },
      ErrorEnvelope: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string", example: "Something went wrong" },
        },
      },
      AuthRegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Divyansh" },
          email: { type: "string", format: "email", example: "divyansh@example.com" },
          password: { type: "string", minLength: 6, example: "StrongPass123" },
        },
      },
      AuthLoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "divyansh@example.com" },
          password: { type: "string", example: "StrongPass123" },
        },
      },
      TopicRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Node.js" },
        },
      },
      SubtopicRequest: {
        type: "object",
        required: ["name", "topicId"],
        properties: {
          name: { type: "string", example: "Express Middleware" },
          topicId: { type: "string", example: "67f0b07ef80a62f38de3f821" },
        },
      },
      NoteCreateRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Auth flow notes" },
          content: { type: "string", example: "JWT middleware validates bearer token" },
          topicId: { type: "string", nullable: true, example: "67f0b07ef80a62f38de3f821" },
          subtopicId: { type: "string", nullable: true, example: "67f0b07ef80a62f38de3f9f0" },
        },
      },
      NoteUpdateRequest: {
        type: "object",
        properties: {
          title: { type: "string", example: "Updated note title" },
          content: { type: "string", example: "Updated content" },
          topicId: { type: "string", nullable: true, example: "67f0b07ef80a62f38de3f821" },
          subtopicId: { type: "string", nullable: true, example: "" },
        },
      },
      ProgressUpdateRequest: {
        type: "object",
        properties: {
          topicId: { type: "string", example: "67f0b07ef80a62f38de3f821" },
          subtopicId: { type: "string", example: "67f0b07ef80a62f38de3f9f0" },
          score: { type: "number", minimum: 0, maximum: 100, example: 70 },
          status: { type: "string", example: "in-progress" },
        },
      },
      DeadlineCreateRequest: {
        type: "object",
        required: ["title", "dueDate"],
        properties: {
          title: { type: "string", example: "Finish backend revision" },
          dueDate: { type: "string", format: "date", example: "2026-04-25" },
          priority: { type: "string", example: "high" },
          notes: { type: "string", example: "Cover auth and revision modules" },
        },
      },
      DeadlineStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", example: "completed" },
        },
      },
      PlanGenerateRequest: {
        type: "object",
        properties: {
          goals: {
            type: "array",
            items: { type: "string" },
            example: ["Learn system design", "Build project"],
          },
          days: { type: "number", example: 14 },
          focusHoursPerDay: { type: "number", example: 3 },
        },
      },
      PlanMarkRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", example: "done" },
        },
      },
      ContactRequest: {
        type: "object",
        required: ["name", "email", "message"],
        properties: {
          name: { type: "string", example: "Aman" },
          email: { type: "string", format: "email", example: "aman@example.com" },
          message: { type: "string", example: "Need help with app onboarding" },
        },
      },
      DailyTemplateRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Morning routine" },
          tasks: {
            type: "array",
            items: { type: "string" },
            example: ["DSA practice", "Read notes", "Apply jobs"],
          },
        },
      },
      DailyTaskRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Practice 2 interview questions" },
        },
      },
      ExpenseRequest: {
        type: "object",
        required: ["amount", "category"],
        properties: {
          amount: { type: "number", example: 250 },
          category: { type: "string", example: "Food" },
          note: { type: "string", example: "Lunch" },
          spentAt: { type: "string", format: "date", example: "2026-04-18" },
        },
      },
      FoodEntryRequest: {
        type: "object",
        required: ["mealType", "items"],
        properties: {
          mealType: { type: "string", example: "breakfast" },
          items: {
            type: "array",
            items: { type: "string" },
            example: ["oats", "banana", "milk"],
          },
          calories: { type: "number", example: 420 },
          loggedAt: { type: "string", format: "date", example: "2026-04-18" },
        },
      },
      MockInterviewStartRequest: {
        type: "object",
        required: ["userId", "role"],
        properties: {
          userId: { type: "string", example: "67f0b07ef80a62f38de3f821" },
          role: { type: "string", example: "Backend Developer" },
          level: { type: "string", example: "intermediate" },
        },
      },
      MockInterviewAnswerRequest: {
        type: "object",
        required: ["sessionId", "answer"],
        properties: {
          sessionId: { type: "string", example: "67f0b07ef80a62f38de3f8ff" },
          answer: { type: "string", example: "I would use indexing to optimize queries." },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns API running message.",
        operationId: "getHealth",
        responses: {
          200: {
            description: "Service healthy",
            content: {
              "text/plain": {
                schema: { type: "string", example: "API is running" },
              },
            },
          },
        },
      },
    },

    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        operationId: "registerUser",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRegisterRequest" },
            },
          },
        },
        responses: {
          201: { description: "Registered", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessEnvelope" } } } },
          400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        operationId: "loginUser",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthLoginRequest" },
            },
          },
        },
        responses: {
          200: { description: "Login successful", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessEnvelope" } } } },
          401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } } },
        },
      },
    },

    "/api/topics": {
      post: {
        tags: ["Topics"],
        summary: "Create topic",
        security: [{ bearerAuth: [] }],
        operationId: "createTopic",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TopicRequest" },
            },
          },
        },
        responses: {
          201: { description: "Topic created" },
          401: { description: "Unauthorized" },
        },
      },
      get: {
        tags: ["Topics"],
        summary: "List user topics",
        security: [{ bearerAuth: [] }],
        operationId: "listTopics",
        responses: {
          200: { description: "Topics fetched" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/topics/{id}": {
      delete: {
        tags: ["Topics"],
        summary: "Delete topic",
        security: [{ bearerAuth: [] }],
        operationId: "deleteTopic",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Topic deleted" },
          404: { description: "Not found" },
        },
      },
    },

    "/api/subtopics": {
      post: {
        tags: ["Subtopics"],
        summary: "Create subtopic",
        security: [{ bearerAuth: [] }],
        operationId: "createSubtopic",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SubtopicRequest" },
            },
          },
        },
        responses: { 201: { description: "Subtopic created" } },
      },
      get: {
        tags: ["Subtopics"],
        summary: "List subtopics",
        security: [{ bearerAuth: [] }],
        operationId: "listSubtopics",
        responses: { 200: { description: "Subtopics fetched" } },
      },
    },
    "/api/subtopics/topic/{topicId}": {
      get: {
        tags: ["Subtopics"],
        summary: "Get subtopics by topic",
        security: [{ bearerAuth: [] }],
        operationId: "listSubtopicsByTopic",
        parameters: [
          { name: "topicId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Subtopics fetched by topic" } },
      },
    },
    "/api/subtopics/{id}": {
      delete: {
        tags: ["Subtopics"],
        summary: "Delete subtopic",
        security: [{ bearerAuth: [] }],
        operationId: "deleteSubtopic",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Subtopic deleted" } },
      },
    },

    "/api/notes": {
      post: {
        tags: ["Notes"],
        summary: "Create note",
        security: [{ bearerAuth: [] }],
        operationId: "createNote",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NoteCreateRequest" },
            },
          },
        },
        responses: { 201: { description: "Note created" } },
      },
      get: {
        tags: ["Notes"],
        summary: "List notes",
        security: [{ bearerAuth: [] }],
        operationId: "listNotes",
        responses: { 200: { description: "Notes fetched" } },
      },
    },
    "/api/notes/{id}": {
      put: {
        tags: ["Notes"],
        summary: "Update note",
        security: [{ bearerAuth: [] }],
        operationId: "updateNote",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NoteUpdateRequest" },
            },
          },
        },
        responses: { 200: { description: "Note updated" } },
      },
      delete: {
        tags: ["Notes"],
        summary: "Delete note",
        security: [{ bearerAuth: [] }],
        operationId: "deleteNote",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Note deleted" } },
      },
    },
    "/api/notes/topic/{topicId}": {
      get: {
        tags: ["Notes"],
        summary: "Get notes by topic",
        security: [{ bearerAuth: [] }],
        operationId: "listNotesByTopic",
        parameters: [
          { name: "topicId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Topic notes fetched" } },
      },
    },
    "/api/notes/subtopic/{subtopicId}": {
      get: {
        tags: ["Notes"],
        summary: "Get notes by subtopic",
        security: [{ bearerAuth: [] }],
        operationId: "listNotesBySubtopic",
        parameters: [
          { name: "subtopicId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Subtopic notes fetched" } },
      },
    },

    "/api/progress": {
      post: {
        tags: ["Progress"],
        summary: "Update progress",
        security: [{ bearerAuth: [] }],
        operationId: "updateProgress",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProgressUpdateRequest" },
            },
          },
        },
        responses: { 200: { description: "Progress updated" } },
      },
      get: {
        tags: ["Progress"],
        summary: "Get user progress",
        security: [{ bearerAuth: [] }],
        operationId: "getProgress",
        responses: { 200: { description: "Progress fetched" } },
      },
    },

    "/api/deadlines": {
      post: {
        tags: ["Deadlines"],
        summary: "Create deadline",
        security: [{ bearerAuth: [] }],
        operationId: "createDeadline",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DeadlineCreateRequest" },
            },
          },
        },
        responses: { 201: { description: "Deadline created" } },
      },
      get: {
        tags: ["Deadlines"],
        summary: "List deadlines",
        security: [{ bearerAuth: [] }],
        operationId: "listDeadlines",
        responses: { 200: { description: "Deadlines fetched" } },
      },
    },
    "/api/deadlines/{id}/status": {
      patch: {
        tags: ["Deadlines"],
        summary: "Update deadline status",
        security: [{ bearerAuth: [] }],
        operationId: "updateDeadlineStatus",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DeadlineStatusRequest" },
            },
          },
        },
        responses: { 200: { description: "Status updated" } },
      },
    },
    "/api/deadlines/{id}": {
      delete: {
        tags: ["Deadlines"],
        summary: "Delete deadline",
        security: [{ bearerAuth: [] }],
        operationId: "deleteDeadline",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Deadline deleted" } },
      },
    },

    "/api/gemini/track-preparation": {
      get: {
        tags: ["Gemini"],
        summary: "Track preparation insights",
        security: [{ bearerAuth: [] }],
        operationId: "trackPreparation",
        responses: { 200: { description: "Preparation analytics" } },
      },
    },

    "/api/revisions/due": {
      get: {
        tags: ["Revision"],
        summary: "Get due revision notes",
        security: [{ bearerAuth: [] }],
        operationId: "getDueRevisions",
        responses: { 200: { description: "Due notes fetched" } },
      },
    },
    "/api/revisions/drill": {
      get: {
        tags: ["Revision"],
        summary: "Get revision drill set",
        security: [{ bearerAuth: [] }],
        operationId: "getRevisionDrill",
        responses: { 200: { description: "Drill fetched" } },
      },
    },
    "/api/revisions/weak": {
      get: {
        tags: ["Revision"],
        summary: "Get weak revision notes",
        security: [{ bearerAuth: [] }],
        operationId: "getWeakRevisions",
        responses: { 200: { description: "Weak notes fetched" } },
      },
    },
    "/api/revisions/{id}/complete": {
      post: {
        tags: ["Revision"],
        summary: "Mark note as revised",
        security: [{ bearerAuth: [] }],
        operationId: "markRevisionComplete",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Marked complete" } },
      },
    },

    "/api/mock-interview/start": {
      post: {
        tags: ["Mock Interview"],
        summary: "Start mock interview",
        operationId: "startMockInterview",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MockInterviewStartRequest" },
            },
          },
        },
        responses: { 200: { description: "Interview started" } },
      },
    },
    "/api/mock-interview/answer": {
      post: {
        tags: ["Mock Interview"],
        summary: "Submit interview answer",
        operationId: "submitInterviewAnswer",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MockInterviewAnswerRequest" },
            },
          },
        },
        responses: { 200: { description: "Answer accepted" } },
      },
    },
    "/api/mock-interview/results/{sessionId}": {
      get: {
        tags: ["Mock Interview"],
        summary: "Get interview results",
        operationId: "getInterviewResults",
        parameters: [
          { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Results fetched" } },
      },
    },
    "/api/mock-interview/pause": {
      post: {
        tags: ["Mock Interview"],
        summary: "Pause interview",
        operationId: "pauseInterview",
        responses: { 200: { description: "Interview paused" } },
      },
    },
    "/api/mock-interview/resume": {
      post: {
        tags: ["Mock Interview"],
        summary: "Resume interview",
        operationId: "resumeInterview",
        responses: { 200: { description: "Interview resumed" } },
      },
    },
    "/api/mock-interview/history/{userId}": {
      get: {
        tags: ["Mock Interview"],
        summary: "Interview history by user",
        operationId: "getInterviewHistory",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "History fetched" } },
      },
    },

    "/api/resource/upload": {
      post: {
        tags: ["Resources"],
        summary: "Upload resource file",
        security: [{ bearerAuth: [] }],
        operationId: "uploadResource",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  topicId: { type: "string", example: "67f0b07ef80a62f38de3f821" },
                  resource: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Resource uploaded" } },
      },
    },
    "/api/resource/topic/{topicId}": {
      get: {
        tags: ["Resources"],
        summary: "Get resources by topic",
        security: [{ bearerAuth: [] }],
        operationId: "getResourcesByTopic",
        parameters: [
          { name: "topicId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Resources fetched" } },
      },
    },
    "/api/resource/{id}": {
      delete: {
        tags: ["Resources"],
        summary: "Delete resource",
        security: [{ bearerAuth: [] }],
        operationId: "deleteResource",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Resource deleted" } },
      },
    },

    "/api/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "User dashboard statistics",
        security: [{ bearerAuth: [] }],
        operationId: "getDashboardStats",
        responses: { 200: { description: "Stats fetched" } },
      },
    },

    "/api/resume/analyze": {
      post: {
        tags: ["Resume"],
        summary: "Upload and analyze resume",
        security: [{ bearerAuth: [] }],
        operationId: "analyzeResume",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  resume: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Resume analyzed" } },
      },
    },

    "/api/plans/generate": {
      post: {
        tags: ["Plans"],
        summary: "Generate smart plan",
        security: [{ bearerAuth: [] }],
        operationId: "generatePlan",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PlanGenerateRequest" },
            },
          },
        },
        responses: { 200: { description: "Plan generated" } },
      },
    },
    "/api/plans/{id}/mark": {
      patch: {
        tags: ["Plans"],
        summary: "Mark plan status",
        security: [{ bearerAuth: [] }],
        operationId: "markPlanStatus",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PlanMarkRequest" },
            },
          },
        },
        responses: { 200: { description: "Plan status updated" } },
      },
    },
    "/api/plans": {
      get: {
        tags: ["Plans"],
        summary: "Get plans",
        security: [{ bearerAuth: [] }],
        operationId: "getPlans",
        responses: { 200: { description: "Plans fetched" } },
      },
    },
    "/api/plans/progress": {
      get: {
        tags: ["Plans"],
        summary: "Get plan progress",
        security: [{ bearerAuth: [] }],
        operationId: "getPlanProgress",
        responses: { 200: { description: "Plan progress fetched" } },
      },
    },

    "/api/contact": {
      post: {
        tags: ["Contact"],
        summary: "Submit contact message",
        operationId: "submitContact",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContactRequest" },
            },
          },
        },
        responses: { 201: { description: "Message submitted" } },
      },
      get: {
        tags: ["Contact"],
        summary: "Get all contact messages",
        operationId: "listContactMessages",
        responses: { 200: { description: "Messages fetched" } },
      },
    },

    "/api/routine/templates": {
      post: {
        tags: ["Daily Routine"],
        summary: "Create routine template",
        security: [{ bearerAuth: [] }],
        operationId: "createRoutineTemplate",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DailyTemplateRequest" },
            },
          },
        },
        responses: { 201: { description: "Template created" } },
      },
      get: {
        tags: ["Daily Routine"],
        summary: "Get routine templates",
        security: [{ bearerAuth: [] }],
        operationId: "getRoutineTemplates",
        responses: { 200: { description: "Templates fetched" } },
      },
    },
    "/api/routine/templates/{templateId}": {
      patch: {
        tags: ["Daily Routine"],
        summary: "Update routine template",
        security: [{ bearerAuth: [] }],
        operationId: "updateRoutineTemplate",
        parameters: [
          { name: "templateId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Template updated" } },
      },
      delete: {
        tags: ["Daily Routine"],
        summary: "Deactivate routine template",
        security: [{ bearerAuth: [] }],
        operationId: "deactivateRoutineTemplate",
        parameters: [
          { name: "templateId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Template deactivated" } },
      },
    },
    "/api/routine/dashboard": {
      get: {
        tags: ["Daily Routine"],
        summary: "Routine dashboard",
        security: [{ bearerAuth: [] }],
        operationId: "getRoutineDashboard",
        responses: { 200: { description: "Dashboard fetched" } },
      },
    },
    "/api/routine/dashboard/eod": {
      get: {
        tags: ["Daily Routine"],
        summary: "End-of-day summary",
        security: [{ bearerAuth: [] }],
        operationId: "getRoutineEod",
        responses: { 200: { description: "EOD summary" } },
      },
    },
    "/api/routine/dashboard/pattern": {
      get: {
        tags: ["Daily Routine"],
        summary: "Weekly routine pattern",
        security: [{ bearerAuth: [] }],
        operationId: "getRoutinePattern",
        responses: { 200: { description: "Pattern analysis" } },
      },
    },
    "/api/routine/dashboard/focus": {
      get: {
        tags: ["Daily Routine"],
        summary: "Current focus task",
        security: [{ bearerAuth: [] }],
        operationId: "getRoutineFocusTask",
        responses: { 200: { description: "Focus task returned" } },
      },
    },
    "/api/routine/dashboard/job-readiness": {
      get: {
        tags: ["Daily Routine"],
        summary: "Job-readiness score",
        security: [{ bearerAuth: [] }],
        operationId: "getRoutineJobReadiness",
        responses: { 200: { description: "Readiness score" } },
      },
    },
    "/api/routine/today": {
      get: {
        tags: ["Daily Routine"],
        summary: "Get today's routine log",
        security: [{ bearerAuth: [] }],
        operationId: "getTodayRoutine",
        responses: { 200: { description: "Today log" } },
      },
    },
    "/api/routine/today/task": {
      post: {
        tags: ["Daily Routine"],
        summary: "Add custom task to today",
        security: [{ bearerAuth: [] }],
        operationId: "addTodayTask",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DailyTaskRequest" },
            },
          },
        },
        responses: { 201: { description: "Task added" } },
      },
    },
    "/api/routine/log/{date}": {
      get: {
        tags: ["Daily Routine"],
        summary: "Get routine log by date",
        security: [{ bearerAuth: [] }],
        operationId: "getRoutineLogByDate",
        parameters: [
          { name: "date", in: "path", required: true, schema: { type: "string", format: "date" } },
        ],
        responses: { 200: { description: "Log fetched" } },
      },
    },
    "/api/routine/log/{date}/task/{taskIndex}/toggle": {
      patch: {
        tags: ["Daily Routine"],
        summary: "Toggle task completion",
        security: [{ bearerAuth: [] }],
        operationId: "toggleRoutineTask",
        parameters: [
          { name: "date", in: "path", required: true, schema: { type: "string", format: "date" } },
          { name: "taskIndex", in: "path", required: true, schema: { type: "integer", minimum: 0 } },
        ],
        responses: { 200: { description: "Task toggled" } },
      },
    },
    "/api/routine/recent": {
      get: {
        tags: ["Daily Routine"],
        summary: "Get recent routine logs",
        security: [{ bearerAuth: [] }],
        operationId: "getRecentRoutineLogs",
        responses: { 200: { description: "Recent logs fetched" } },
      },
    },
    "/api/routine/streak": {
      get: {
        tags: ["Daily Routine"],
        summary: "Get consistency streak",
        security: [{ bearerAuth: [] }],
        operationId: "getRoutineStreak",
        responses: { 200: { description: "Streak fetched" } },
      },
    },
    "/api/routine/log/{date}/insight": {
      post: {
        tags: ["Daily Routine"],
        summary: "Generate AI routine insight for date",
        security: [{ bearerAuth: [] }],
        operationId: "generateRoutineInsight",
        parameters: [
          { name: "date", in: "path", required: true, schema: { type: "string", format: "date" } },
        ],
        responses: { 200: { description: "Insight generated" } },
      },
    },

    "/api/expenses": {
      post: {
        tags: ["Expenses"],
        summary: "Create expense entry",
        security: [{ bearerAuth: [] }],
        operationId: "createExpense",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ExpenseRequest" },
            },
          },
        },
        responses: { 201: { description: "Expense created" } },
      },
      get: {
        tags: ["Expenses"],
        summary: "List expenses",
        security: [{ bearerAuth: [] }],
        operationId: "listExpenses",
        responses: { 200: { description: "Expenses fetched" } },
      },
    },
    "/api/expenses/summary": {
      get: {
        tags: ["Expenses"],
        summary: "Expense summary",
        security: [{ bearerAuth: [] }],
        operationId: "getExpenseSummary",
        responses: { 200: { description: "Summary fetched" } },
      },
    },
    "/api/expenses/report": {
      get: {
        tags: ["Expenses"],
        summary: "Expense report",
        security: [{ bearerAuth: [] }],
        operationId: "getExpenseReport",
        parameters: [
          { name: "from", in: "query", required: false, schema: { type: "string", format: "date" } },
          { name: "to", in: "query", required: false, schema: { type: "string", format: "date" } },
        ],
        responses: { 200: { description: "Report fetched" } },
      },
    },
    "/api/expenses/insight": {
      get: {
        tags: ["Expenses"],
        summary: "AI expense insights",
        security: [{ bearerAuth: [] }],
        operationId: "getExpenseInsight",
        responses: { 200: { description: "Insight generated" } },
      },
    },

    "/api/food-log": {
      post: {
        tags: ["Food Log"],
        summary: "Create food log entry",
        security: [{ bearerAuth: [] }],
        operationId: "createFoodEntry",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FoodEntryRequest" },
            },
          },
        },
        responses: { 201: { description: "Food entry created" } },
      },
      get: {
        tags: ["Food Log"],
        summary: "List food entries",
        security: [{ bearerAuth: [] }],
        operationId: "listFoodEntries",
        responses: { 200: { description: "Food entries fetched" } },
      },
    },
    "/api/food-log/summary": {
      get: {
        tags: ["Food Log"],
        summary: "Nutrition summary",
        security: [{ bearerAuth: [] }],
        operationId: "getNutritionSummary",
        responses: { 200: { description: "Summary fetched" } },
      },
    },
    "/api/food-log/report": {
      get: {
        tags: ["Food Log"],
        summary: "Nutrition report",
        security: [{ bearerAuth: [] }],
        operationId: "getNutritionReport",
        parameters: [
          { name: "from", in: "query", required: false, schema: { type: "string", format: "date" } },
          { name: "to", in: "query", required: false, schema: { type: "string", format: "date" } },
        ],
        responses: { 200: { description: "Report fetched" } },
      },
    },
    "/api/food-log/insight": {
      get: {
        tags: ["Food Log"],
        summary: "AI nutrition insight",
        security: [{ bearerAuth: [] }],
        operationId: "getNutritionInsight",
        responses: { 200: { description: "Insight generated" } },
      },
    },
  },
};

const swaggerOptions = {
  explorer: true,
  customSiteTitle: "Note App Service API Docs",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
};

module.exports = {
  swaggerUi,
  openApiSpec,
  swaggerOptions,
};
