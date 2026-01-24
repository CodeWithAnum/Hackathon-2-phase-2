---
title: Todo App Backend API
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
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

Required environment variables (set in Hugging Face Space settings):
- `DATABASE_URL` - PostgreSQL connection string (Neon database)
- `JWT_SECRET_KEY` - Secret key for JWT token generation
- `JWT_ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time (default: 30)
