---
title: Todo App Backend API
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

# Todo App Backend API

FastAPI backend for the Todo application with JWT authentication and PostgreSQL database.

## Features

- User authentication with JWT tokens
- Task CRUD operations
- User isolation (users can only access their own tasks)
- PostgreSQL database with SQLModel ORM
- RESTful API design

## API Documentation

Once deployed, visit:
- `/docs` - Swagger UI documentation
- `/redoc` - ReDoc documentation
- `/health` - Health check endpoint

## Environment Variables

Set these in your Hugging Face Space settings:
- `DATABASE_URL` - PostgreSQL connection string (Neon database)
- `JWT_SECRET` - Secret key for JWT token generation
- `JWT_ALGORITHM` - JWT algorithm (default: HS256)
- `JWT_EXPIRATION_MINUTES` - Token expiration time (default: 15)
- `JWT_REFRESH_EXPIRATION_HOURS` - Refresh token expiration (default: 168)
- `BCRYPT_ROUNDS` - Password hashing rounds (default: 12)
- `DEBUG` - Debug mode (default: false)
- `LOG_LEVEL` - Logging level (default: info)
- `API_HOST` - Host address (default: 0.0.0.0)
- `API_PORT` - Port number (default: 7860)
