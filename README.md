# Todo Frontend

Simple React/Vite frontend for the Kubernetes capstone.

## Local

```bash
npm install
npm run dev
```

By default it calls:

```text
/api
```

For local backend on another URL:

```bash
VITE_API_BASE_URL=http://localhost:3000/api npm run dev
```

## Docker

```bash
docker build -t todo-frontend:local .
docker run --rm -p 8080:8080 todo-frontend:local
```
