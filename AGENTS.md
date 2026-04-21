# AI Agent Instruction Guide - Complejo Deportivo

This document serves as the primary technical reference and behavior guide for AI models (OpenAI/Claude/Gemini) working on this repository.

## 1. Project Description

### Overview
A comprehensive management system for a Sports Complex ("Complejo Deportivo"), designed to handle reservations, memberships, facility management, and user accounts.

### Tech Stack
- **Backend**: FastAPI (Python 3.12+)
  - **ORM**: SQLAlchemy
  - **Security**: JWT Authentication (PyJWT)
  - **Database**: PostgreSQL
  - **Validation**: Pydantic v2
- **Frontend**: Next.js 15+ (React 19)
  - **Pattern**: App Router
  - **Styling**: Tailwind CSS
  - **Icons**: Lucide React / Heroicons
  - **Language**: TypeScript
- **Infrastructure**: Docker & Docker Compose

---

## 2. Frontend Development Guidelines (Next.js)

### Architecture
- Use the **App Router** (`app/` directory).
- Separate UI components into a clear hierarchy.
- Use `use client` only when necessary for interactivity.

### Coding Standards
- **TypeScript**: Define interfaces/types for all props and API responses. Avoid `any`.
- **Styling**: Use utility-first classes with Tailwind CSS. Maintain consistent spacing and color palettes.
- **Icons**: Prefer `lucide-react` for general icons.
- **State Management**: Use React Context for global state (e.g., Auth) and local state for components.

---

## 3. Backend Development Guidelines (FastAPI)

### Architecture
- **Tables**: SQLAlchemy models in `app/tables`.
- **Schemas**: Pydantic models (v2) for request/validation in `app/schemas`.
- **Services**: Business logic must reside in `app/services`. Do not put logic in routes.
- **Routes**: API endpoints in `app/routes`, utilizing routers and proper status codes.
- **Database**: Use `app/database.py` for session and engine management.

### Coding Standards
- **Dependency Injection**: Use `Depends` for database sessions and authentication.
- **Error Handling**: Raise `HTTPException` with clear detail messages.
- **Type Hinting**: Use Python type hints everywhere.
- **Migrations**: (If applicable) Use Alembic for database changes.

---

## 4. Quality Control & Checklist

### General Checklist
- [ ] **Linting**: Ensure code passes ESLint (frontend) and Ruff/Flake8 (backend).
- [ ] **Type Safety**: No TypeScript errors; all Python functions have type hints.
- [ ] **Security**: No hardcoded secrets. Use environment variables via `.env`.
- [ ] **Responsiveness**: UI must be mobile-friendly.
- [ ] **Documentation**: Docstrings for complex Python logic; JSDoc for complex React components.

### Quality Gates for AI Agents
1. **Context Awareness**: Always check existing `app/tables` or `app/schemas` before creating new ones.
2. **Consistency**: Follow naming conventions: `camelCase` for JS/TS, `snake_case` for Python.
3. **Architecture Adherence**: 
   - **Frontend**: Keep components small and use `lucide-react`.
   - **Backend**: Always use the Service layer; never write business logic inside routes.
4. **No Placeholders**: Provide working implementations, never "TODO" or "Implement here".
5. **Error Handling**: 
   - **Python**: Use `try/except` with logging and raise specific `HTTPException`.
   - **JS/TS**: Use `try/catch` and provide user-friendly error feedback.

---

## 5. Deployment & Environment

- **Docker**: All services (web, api, db) are containerized.
- **Environment**: Use `.env` for:
  - `DATABASE_URL`
  - `SECRET_KEY`
  - `ALGORITHM`
  - `ACCESS_TOKEN_EXPIRE_MINUTES`

---

## 6. Interaction Rules for Agents
- **Primary Goal**: Maintain a clean, scalable, and secure codebase.
- **Feedback Loop**: If a requirement is ambiguous, ask for clarification before implementing.
- **Rich UI**: When building frontend features, prioritize premium aesthetics as per the system instructions.
