# Mini Jira Frontend

A project and task management web app. This is the React frontend for the MiniJiraBE Spring Boot API.

## Features

- Register and log in with JWT authentication and automatic token refresh
- Roles: ADMIN, PROJECT_MANAGER and DEVELOPER
- Project list, with project creation for managers
- Kanban board with To Do, In Progress and Done columns
- Create tasks with priority, due date and assignee
- Drag and drop to change a task's status
- Search by title and filter by assignee
- Add members to a project (managers)
- Task details panel with comments and task deletion (managers)
- Manager dashboard: tasks per developer, overdue tasks per project, completion rate

## Tech stack

React 19, Vite 5, React Router 6, Axios

## Requirements

- Node.js 18 or newer
- The MiniJiraBE backend running on http://localhost:8080

## Run

```bash
npm install
npm run dev
```

The app opens at http://localhost:5173. Requests to `/api` are proxied to http://localhost:8080 by Vite, so no CORS setup is needed.

On Windows, port 5173 can be reserved by the system. If the server fails to start, use another port:

```bash
npx vite --host 127.0.0.1 --port 3000
```

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  api/axios.js              Axios instance, token handling, error messages
  context/AuthContext.jsx   Login state and actions
  hooks/useAuth.js          Hook for reading the auth context
  components/               Layout, ProtectedRoute, Loading and ErrorBox
  pages/                    Login, Register, Projects, Board, Dashboard
  App.jsx                   Routes
  main.jsx                  App entry
  index.css                 Global styles
```