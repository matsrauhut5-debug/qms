# QMS Project Context

## What we are building
A multi-tenant SaaS quality management system (QMS) for small manufacturing
companies that cannot afford tools like SAP. Companies use it to enter test
results for their products, track batches, analyse trends, and generate
compliance reports.

## Tech stack
- Backend: Python 3.12, FastAPI, SQLAlchemy, Alembic, PostgreSQL 16
- Frontend: React 18, TypeScript, React Router, Axios, Tailwind CSS 3
- Auth: JWT tokens via python-jose, password hashing via passlib/bcrypt
- Database GUI: TablePlus
- Version control: Git + GitHub (https://github.com/matsrauhut5-debug/qms)

## Project location
~/Projects/qms

## How to run
Backend:
  cd ~/Projects/qms/backend
  source venv/bin/activate
  uvicorn app.main:app --reload
  Runs at http://127.0.0.1:8000
  API docs at http://127.0.0.1:8000/docs

Frontend:
  cd ~/Projects/qms/frontend
  npm start
  Runs at http://localhost:3000

Database:
  psql -U yeah -d qms_dev
  Or use TablePlus with host 127.0.0.1, port 5432, user yeah, db qms_dev

## Test login credentials
  Email:    admin@demo.com
  Password: admin1234
  Roles:    admin, analyst, operator
  Tenant:   Demo Company (slug: demo)

## Project folder structure
qms/
├── CONTEXT.md                        ← this file
├── backend/
│   ├── .env                          ← secrets, not in git
│   ├── .gitignore
│   ├── alembic.ini                   ← database migration config
│   ├── requirements.txt
│   ├── alembic/
│   │   ├── env.py                    ← migration environment
│   │   └── versions/
│   │       └── 1b6a9990ac0f_initial_schema.py
│   └── app/
│       ├── main.py                   ← FastAPI app, all routers registered
│       ├── seed.py                   ← creates demo tenant + admin user
│       ├── seed_products.py          ← creates Brake Disc A400 + 4 parameters
│       ├── api/routes/
│       │   ├── auth.py               ← login, change-password, /me
│       │   ├── products.py           ← GET /products/
│       │   ├── test_parameters.py    ← GET /parameters/product/{id}
│       │   ├── test_results.py       ← POST /results/, GET /results/
│       │   └── batches.py            ← GET /batches/, POST /batches/
│       ├── core/
│       │   ├── settings.py           ← pydantic settings from .env
│       │   ├── security.py           ← hash_password, verify, JWT
│       │   └── dependencies.py       ← get_current_user, require_role
│       ├── db/
│       │   └── base.py               ← SQLAlchemy engine, Base, get_db, model imports
│       ├── models/
│       │   ├── tenant.py             ← Tenant, TenantBranding
│       │   ├── user.py               ← User, UserRole, RoleEnum
│       │   ├── product.py            ← Product
│       │   ├── test_parameter.py     ← TestParameter, DataTypeEnum
│       │   ├── batch.py              ← Batch, BatchStatusEnum
│       │   ├── test_result.py        ← TestResult, ResultStatusEnum, EvaluationEnum
│       │   └── activity_log.py       ← ActivityLog
│       └── schemas/
│           ├── auth.py               ← LoginRequest, TokenResponse
│           ├── product.py            ← ProductOut
│           ├── test_parameter.py     ← TestParameterOut
│           ├── test_result.py        ← TestResultCreate, TestResultOut
│           └── batch.py              ← BatchCreate, BatchOut
└── frontend/
    ├── tailwind.config.js
    ├── src/
    │   ├── index.css                 ← CSS variables for Theme 1 + Tailwind
    │   ├── App.tsx                   ← routes: /login, /dashboard, /enter
    │   ├── api/
    │   │   └── client.ts             ← axios instance, JWT interceptor, 401 handler
    │   ├── components/
    │   │   └── TopNav.tsx            ← dark navy top navigation bar
    │   └── pages/
    │       ├── Login.tsx             ← login form, calls POST /api/v1/auth/login
    │       ├── Dashboard.tsx         ← KPI cards + recent results (placeholder data)
    │       └── EnterResults.tsx      ← grid-style test entry form (main operator screen)

## Database schema (9 tables)
tenants            - root table, one row per company
tenant_branding    - logo, colors, address, PDF config (1:1 with tenants)
report_templates   - PDF layout options per tenant (1:many with tenants)
users              - all users, belongs to a tenant
user_roles         - join table: user_id + role enum (operator/analyst/admin)
products           - products a tenant tests
test_parameters    - what gets measured per product + spec limits
batches            - production runs, groups test results
test_results       - every individual measurement entered
activity_log       - append-only audit trail of all actions

## Key design decisions made
- Multi-tenancy: shared database, tenant_id on every table
- UUIDs not integers as primary keys everywhere
- TIMESTAMPTZ (timezone-aware) for all timestamps
- Separate tenant_branding table to keep tenants clean
- report_templates table supports multiple PDF layouts per tenant
- Three user roles: operator (entry only), analyst (dashboard+review), admin (settings)
- User can hold multiple roles via user_roles join table
- must_change_password flag on users for first login flow
- snap_spec_min/max/target on test_results to freeze spec limits at time of entry
- evaluation (pass/warn/fail) computed and stored on save, not calculated at read time
- correction_of self-reference on test_results for correction workflow
- activity_log is append-only, never updated
- updated_at on tables for performance, activity_log for full audit history

## UI design decisions made
- Layout: top navigation bar (Option A)
- Theme: Theme 1 — dark navy nav (#0f172a) + light body (#f8fafc)
- Accent color: #3b82f6 (blue)
- Pass color: #059669 (green)
- Warn color: #d97706 (amber)
- Fail color: #dc2626 (red)
- All colors defined as CSS variables in index.css for easy future theming
- Enter results screen: grid layout, one row per parameter, all visible at once

## What is working right now
- Login screen with JWT authentication
- Protected routes (redirect to login if no token)
- Dashboard page (shell with KPI cards, placeholder data)
- Enter results page (grid layout, live pass/warn/fail feedback, submit to API)
- Backend API endpoints: auth, products, parameters, results, batches
- Evaluation logic computed on save (pass/warn/fail based on spec limits)
- Activity log written on login and result submission
- Seed data: one demo tenant, one admin user, one product, four parameters

## What is NOT built yet (next phases)
Phase 4 remaining:
- Results list page (/results) — table of all submitted results with filters
- Batches page (/batches) — list and manage production batches
- Admin settings pages (/settings) — manage products, parameters, users

Phase 5:
- Analytics dashboard — real KPI data from database
- Control charts (SPC) using Recharts
- Trend analysis
- Alert engine — email notification on fail/drift

Phase 6:
- PDF report generation
- Deployment (Railway or Render)
- Onboarding flow for new tenants

## Immediate next task
Build the Results list page (/results):
- Table showing all submitted test results
- Columns: date/time, product, parameter, value, unit, status badge, operator
- Filter by product, date range, status (pass/warn/fail)
- Click a row to see detail
- Connect to GET /api/v1/results/ endpoint (already built)