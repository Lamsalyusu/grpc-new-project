
users              --->            id, name, email, password_hash, role
tasks              --->            id, owner_id, title, description, status, priority,
                                   due_date, reminder_at, reminder_status
task_collaborators --->            task_id, user_id  (composite PK)
messages           --->            id, task_id, sender_id, body, created_at (indexed)
notifications      --->            id, user_id, type, payload(JSON), read_at

---
Core features to implement
---
1. Auth
Register / login / me endpoint
JWT + bcrypt (cost ≥ 10)
Bearer token middleware protecting routes
---
2. Tasks (CRUD)
Owner-only edit/delete checks
Filtering (status, priority, due date), pagination, sorting
Fields: title, description, status, priority, due_date, reminder_at, owner_id
---
3. Collaborators
Owner can add other users to a task
Collaborators can read the task + join its chat room
---
4. Real-time chat (this is the new part for you)
Socket.IO namespace /chat
One room per task: task:{id}
JWT verified during the socket handshake, not just REST
Events: join, leave, send, receive
Messages saved to DB before broadcasting (never broadcast-then-persist)
Paginated chat history available via REST too
---
5. Reminders
node-cron scans every minute for due reminders
Must be idempotent — if the server restarts mid-run, it must not double-send. Use a reminder_status column (pending/sent) as a guard.
Emits a Socket.IO event to the task owner when triggered
---
6. Notifications
Persisted so users see them even if offline
Endpoints: list, mark-read, unread-count
---
7. Non-negotiable technical rules
i.  API base: /api/v1
ii. Success responses: { data, meta? } — error responses: { error: { code, message, details? } }
iii.Security: helmet, explicit CORS (no wildcard * in prod), express-rate-limit on auth routes specifically, never log passwords/tokens
iv. Socket auth: server must verify room membership on join_task — never trust the client's claim that they own/collaborate on a task
v. All timestamps UTC, ISO 8601 format
.env.example shipped, .env never committed (relevant given your recent git history incident — same rule applies here from day one)
/health endpoint required
Structured JSON logs with request IDs
---
8. Tech stack you need to know
Layer	           Tool
Language	   TypeScript (strict mode)	
Framework	   Express 4	
ORM	           Sequelize 6	
DB	           MySQL 8 or Postgres 14+	
Real-time      Socket.IO 4	
Scheduling	   node-cron (or BullMQ+Redis for bonus)	
Auth	       jsonwebtoken, bcrypt	
Validation	   Zod or Joi	
Docs	       swagger-ui-express	
Testing	       Jest + Supertest	
Tooling	       ESLint, Prettier
