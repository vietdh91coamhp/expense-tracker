# Expense Tracker API

A Next.js 14 API server with PostgreSQL database, built with TypeScript and Docker.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **PostgreSQL** database with relational data
- **Docker** and **Docker Compose** for containerization
- RESTful API endpoints for user and expense management
- Foreign key relationships with cascade delete
- **Analytics endpoints**: Total by category, monthly spending summaries
- Category-based expense tracking (Food, Transport, Entertainment, etc.)
- Health check and database management endpoints
- **Interactive Swagger/OpenAPI Documentation** at `/api-docs`
- **Webhook System** for real-time notifications
- **Comprehensive Test ** 

## Prerequisites

- Node.js 20+ (for local development)
- Docker Desktop

## Getting Started

### Using Docker (Recommended)

1. Clone the repository and navigate to the project directory

2. Start the application with Docker Compose:
```bash
docker-compose up --build
```

3. The application will be available at `http://localhost:3000`

4. (Optional) Load test data:
```bash
docker-compose exec -T postgres psql -U postgres -d expense_tracker < backup.sql
```

5. Check health status:
```bash
curl http://localhost:3000/api/health
```

6. 🆕 View interactive API documentation:
```
http://localhost:3000/api-docs
```

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Make sure PostgreSQL is running locally, then start the development server:
```bash
npm run dev
```

4. Initialize the database:
```bash
curl -X POST http://localhost:3000/api/init
```

5. Open `http://localhost:3000` in your browser

## 📖 Documentation

- **Interactive API Docs**: http://localhost:3000/api-docs (Swagger UI)

## API Endpoints

### Health Check
- `GET /api/health` - Check API and database health

### Database Management
- `POST /api/init` - Initialize database tables
- `POST /api/reset` - Drop database tables

### 🆕 Webhook Endpoints

- `GET /api/webhooks` - List all webhooks
- `POST /api/webhooks` - Register a new webhook
- `GET /api/webhooks/:id` - Get webhook by ID
- `PATCH /api/webhooks/:id` - Update webhook status (active/inactive)
- `DELETE /api/webhooks/:id` - Delete a webhook

### 🆕 Documentation Endpoints

- `GET /api-docs` - Interactive Swagger UI documentation
- `GET /api/openapi` - OpenAPI specification (YAML)

### Users
- `GET /api/users` - Get all users (supports query param: email)
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user by ID
- `DELETE /api/users/[id]` - Delete user by ID (cascade deletes expenses)

### Expenses
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses/[userId]` - Get all expenses for a specific user (supports query params: category, startDate, endDate)
- `GET /api/expenses/[userId]/total` - Get total expenses by category for a user (supports query params: startDate, endDate)
- `GET /api/expenses/[userId]/monthly` - Get monthly spending summary for a user (supports query params: year, month)

## Example API Calls

### Create a User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

### Get All Users
```bash
curl http://localhost:3000/api/users
```

### Get User by Email
```bash
curl "http://localhost:3000/api/users?email=john@example.com"
```

### Update a User
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith"
  }'
```

### Delete a User
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

### Create an Expense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "amount": 125.50,
    "category": "Food",
    "description": "Grocery shopping",
    "date": "2025-10-30"
  }'
```

### Get All Expenses
```bash
curl http://localhost:3000/api/expenses
```

### Get Expenses by User
```bash
curl "http://localhost:3000/api/expenses?userId=1"
```

### Get Expenses by Category
```bash
curl "http://localhost:3000/api/expenses?category=Food"
```

### Update an Expense
```bash
curl -X PUT http://localhost:3000/api/expenses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.00,
    "description": "Updated description"
  }'
```

### Delete an Expense
```bash
curl -X DELETE http://localhost:3000/api/expenses/1
```

### Get All Expenses for a User
```bash
# Get all expenses for user 1
curl http://localhost:3000/api/expenses/1

# With filters
curl "http://localhost:3000/api/expenses/1?category=Food&startDate=2025-10-01"
```

### Get Total Expenses by Category
```bash
# Get total expenses by category for user 1
curl http://localhost:3000/api/expenses/1/total

# With date range filter
curl "http://localhost:3000/api/expenses/1/total?startDate=2025-10-01&endDate=2025-10-31"
```

Response example:
```json
{
  "userId": 1,
  "totalExpenses": 450.50,
  "totalTransactions": 5,
  "byCategory": [
    {
      "category": "Food",
      "count": 3,
      "total": 275.50,
      "average": 91.83,
      "minAmount": 50.00,
      "maxAmount": 125.50,
      "percentage": "61.15"
    },
    {
      "category": "Transport",
      "count": 2,
      "total": 175.00,
      "average": 87.50,
      "minAmount": 75.00,
      "maxAmount": 100.00,
      "percentage": "38.85"
    }
  ]
}
```

### Get Monthly Spending Summary
```bash
# Get all monthly spending for user 1
curl http://localhost:3000/api/expenses/1/monthly

# Filter by year
curl "http://localhost:3000/api/expenses/1/monthly?year=2025"

# Filter by specific month
curl "http://localhost:3000/api/expenses/1/monthly?year=2025&month=10"
```

Response example:
```json
{
  "userId": 1,
  "totalExpenses": 450.50,
  "totalTransactions": 5,
  "filters": {
    "year": "2025",
    "month": "10"
  },
  "monthlyBreakdown": [
    {
      "month": "2025-10",
      "year": "2025",
      "monthNumber": "10",
      "total": 450.50,
      "count": 5,
      "categories": [
        {
          "category": "Food",
          "total": 275.50,
          "count": 3
        },
        {
          "category": "Transport",
          "total": 175.00,
          "count": 2
        }
      ]
    }
  ]
}
```

## Database Schema

The application uses PostgreSQL with three main tables: `users`, `expenses`, and `webhooks`. The schema is designed with referential integrity, cascade deletes, and optimized indexes.

### Overview

```
┌─────────────┐         ┌──────────────┐
│    users    │◄────────│   expenses   │
│             │  1:N    │              │
└─────────────┘         └──────────────┘
                              │
                              │ triggers
                              ▼
                        ┌──────────────┐
                        │   webhooks   │
                        │              │
                        └──────────────┘
```

### 1. Users Table

Stores user information for the expense tracking system.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
---
### 2. Expenses Table

Stores individual expense records linked to users.

```sql
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
---

### 3. Webhooks Table

Stores webhook registrations for real-time event notifications.

```sql
CREATE TABLE webhooks (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  event VARCHAR(50) NOT NULL,
  secret TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
---

### Indexes

Optimized indexes for common query patterns:

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);

-- Expenses
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- Webhooks
CREATE INDEX idx_webhooks_event ON webhooks(event) WHERE active = true;
```

**Index Purposes:**
- `idx_users_email` - Fast user lookup by email (login, authentication)
- `idx_expenses_user_id` - Fast retrieval of all expenses for a user
- `idx_expenses_date` - Efficient date range queries for reports
- `idx_expenses_category` - Quick category-based filtering and aggregation
- `idx_webhooks_event` - Fast webhook lookup by event type (partial index on active only)

---

### Relationships

#### One-to-Many: Users → Expenses

```
users (1) ──< (N) expenses
```

- One user can have many expenses
- Each expense belongs to exactly one user
- Cascade delete: Deleting a user removes all their expenses

**Benefits:**
- Data integrity maintained automatically
- No orphaned expense records
- Simplified user account deletion

#### Independent: Webhooks

```
webhooks (independent)
```

- Webhooks are not directly linked to users or expenses
- It will be triggered when expense is created

---


### Sample Data Relationships

```sql
-- User
users: { id: 1, name: "John Doe", email: "john@example.com" }

-- Their Expenses
expenses: [
  { id: 1, user_id: 1, amount: 50.00, category: "Food", date: "2025-11-01" },
  { id: 2, user_id: 1, amount: 25.50, category: "Transport", date: "2025-11-01" },
  { id: 3, user_id: 1, amount: 100.00, category: "Entertainment", date: "2025-11-02" }
]

-- Webhook is created when has new expense
webhooks: { id: 1, url: "https://api.example.com/notify", event: "expense.created", active: true }
```

**Flow:**
1. John creates an expense → Saved to `expenses` table
2. System looks up active webhooks for `expense.created` event
3. Sends POST request to webhook URL with expense + user data

---

### Database Operations

#### Initialization
```bash
curl -X POST http://localhost:3000/api/init
```

Creates all tables and indexes if they don't exist.

#### Reset
```bash
curl -X POST http://localhost:3000/api/reset
```

Drops all tables in correct order (webhooks → expenses → users) to handle foreign key constraints.

---

## Environment Variables

See `.env.example` for all available environment variables:

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: expense_tracker)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `NODE_ENV` - Node environment (development/production)

## How to run tests

### Run Tests
```bash
npm test
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run in Watch Mode
```bash
npm run test:watch
```
