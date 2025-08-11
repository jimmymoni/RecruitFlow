# 🔧 API Testing Guide

## Quick Backend Tests

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Login (Get Token)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Test Candidates (Use token from login)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3001/api/candidates
```

### Create New Candidate
```bash
curl -X POST http://localhost:3001/api/candidates \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Jane\",
    \"lastName\": \"Smith\", 
    \"email\": \"jane.smith@email.com\",
    \"phone\": \"+1-555-9999\",
    \"location\": \"Austin, TX\",
    \"status\": \"new\",
    \"summary\": \"Senior React Developer\",
    \"skills\": [\"React\", \"Node.js\", \"GraphQL\"]
  }"
```

### Test Jobs API
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3001/api/jobs
```

### Test Clients API  
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3001/api/clients
```

## Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Backend health check |
| POST | `/api/auth/login` | User authentication |
| GET | `/api/candidates` | List candidates |
| POST | `/api/candidates` | Create candidate |
| PUT | `/api/candidates/:id` | Update candidate |
| DELETE | `/api/candidates/:id` | Delete candidate |
| GET | `/api/jobs` | List jobs |
| POST | `/api/jobs` | Create job |
| GET | `/api/clients` | List clients |
| POST | `/api/clients` | Create client |
| POST | `/api/files/upload` | Upload files |

## Test Accounts

**Default User:**
- Email: `test@example.com`
- Password: `password123`
- Role: `recruiter`