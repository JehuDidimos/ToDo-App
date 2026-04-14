# todo-springboot-backend

Spring Boot backend for a TODO app. Stores tasks **in memory** in a Java `ArrayList` so the frontend can refresh without losing tasks (as long as the backend stays running).

## Run

From this folder:

```bash
mvn spring-boot:run
```

Backend defaults to port `8080`.

## API

- `GET /api/tasks` — list tasks
- `POST /api/tasks` — create task
- `PUT /api/tasks/{id}` — update task
- `DELETE /api/tasks/{id}` — delete task

## Notes

- Tasks are not persisted to disk/database.
- CORS is enabled for common local frontend dev servers (and also allows any origin pattern for convenience during development).

