-- ============================================================
--  Company Internal Reporting System
--  PostgreSQL Database Schema
--  Author : Mugisha Yves
--  Version: 1.0 — May 2026
-- ============================================================
-- Run this entire file once to set up the database from scratch.
-- Recommended command:
--   psql -U postgres -d reporting_db -f schema.sql
-- Or create the DB first:
--   createdb -U postgres reporting_db
--   psql -U postgres -d reporting_db -f schema.sql
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid() if needed later


-- ─────────────────────────────────────────────────────────────
-- 1. ENUM TYPES
-- Drop & recreate cleanly (safe for fresh setup)
-- ─────────────────────────────────────────────────────────────

-- User roles
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM (
    'admin',
    'employee',
    'reviewer',
    'approver'
);

-- Report lifecycle statuses
DROP TYPE IF EXISTS report_status CASCADE;
CREATE TYPE report_status AS ENUM (
    'pending',
    'submitted',
    'under_review',
    'changes_requested',
    'approved',
    'rejected'
);

-- Report schedule frequencies
DROP TYPE IF EXISTS frequency_type CASCADE;
CREATE TYPE frequency_type AS ENUM (
    'weekly',
    'biweekly',
    'monthly',
    'quarterly',
    'custom'
);

-- Review actions available to reviewers and approvers
DROP TYPE IF EXISTS review_action CASCADE;
CREATE TYPE review_action AS ENUM (
    'approved',
    'rejected',
    'changes_requested'
);

-- Which stage of the approval workflow
DROP TYPE IF EXISTS review_stage CASCADE;
CREATE TYPE review_stage AS ENUM (
    'stage_1',
    'stage_2'
);


-- ─────────────────────────────────────────────────────────────
-- 2. TABLES
-- ─────────────────────────────────────────────────────────────

-- ── 2.1 departments ──────────────────────────────────────────
-- Must be created before users (circular FK handled below)
CREATE TABLE IF NOT EXISTS departments (
    dept_id      SERIAL        PRIMARY KEY,
    name         VARCHAR(100)  NOT NULL UNIQUE,
    description  TEXT,
    reviewer_id  INTEGER,      -- FK added after users table is created
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  departments              IS 'All company departments';
COMMENT ON COLUMN departments.reviewer_id  IS 'User assigned as Stage 1 reviewer for this department';


-- ── 2.2 teams ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
    team_id     SERIAL        PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    dept_id     INTEGER       NOT NULL REFERENCES departments(dept_id) ON DELETE CASCADE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    UNIQUE (name, dept_id)   -- team name must be unique within a department
);

COMMENT ON TABLE teams IS 'Teams that belong to departments';


-- ── 2.3 users ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id        SERIAL        PRIMARY KEY,
    full_name      VARCHAR(150)  NOT NULL,
    email          VARCHAR(255)  NOT NULL UNIQUE,
    password_hash  VARCHAR(255)  NOT NULL,
    role           user_role     NOT NULL,
    dept_id        INTEGER       REFERENCES departments(dept_id) ON DELETE SET NULL,
    team_id        INTEGER       REFERENCES teams(team_id)       ON DELETE SET NULL,
    is_active      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users               IS 'All system users — admin, employee, reviewer, approver';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash — never store plain-text passwords';
COMMENT ON COLUMN users.is_active     IS 'Soft delete: FALSE = deactivated, not removed';


-- ── Add FK: departments.reviewer_id → users.user_id ──────────
-- (Added here because users table now exists)
ALTER TABLE departments
    ADD CONSTRAINT fk_dept_reviewer
    FOREIGN KEY (reviewer_id)
    REFERENCES users(user_id)
    ON DELETE SET NULL;


-- ── 2.4 report_schedules ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_schedules (
    schedule_id  SERIAL          PRIMARY KEY,
    title        VARCHAR(200)    NOT NULL,
    report_type  VARCHAR(100)    NOT NULL,
    frequency    frequency_type  NOT NULL,
    start_date   DATE            NOT NULL,
    deadline     DATE            NOT NULL,
    dept_id      INTEGER         REFERENCES departments(dept_id) ON DELETE SET NULL,
    team_id      INTEGER         REFERENCES teams(team_id)       ON DELETE SET NULL,
    created_by   INTEGER         NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    created_at   TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_deadline_after_start CHECK (deadline >= start_date)
);

COMMENT ON TABLE  report_schedules            IS 'Admin-defined report schedules with deadlines';
COMMENT ON COLUMN report_schedules.created_by IS 'Admin user who defined this schedule';


-- ── 2.5 reports ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
    report_id    SERIAL         PRIMARY KEY,
    schedule_id  INTEGER        NOT NULL REFERENCES report_schedules(schedule_id) ON DELETE RESTRICT,
    employee_id  INTEGER        NOT NULL REFERENCES users(user_id)                ON DELETE RESTRICT,
    title        VARCHAR(255)   NOT NULL,
    content      TEXT,          -- nullable if employee uploads a file instead
    file_path    VARCHAR(500),  -- path or cloud URL to uploaded file
    file_name    VARCHAR(255),  -- original filename shown in UI
    status       report_status  NOT NULL DEFAULT 'pending',
    is_late      BOOLEAN        NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMP,     -- set when status changes to 'submitted'
    created_at   TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP      NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_content_or_file CHECK (content IS NOT NULL OR file_path IS NOT NULL)
);

COMMENT ON TABLE  reports             IS 'All employee report submissions';
COMMENT ON COLUMN reports.is_late     IS 'TRUE if submitted_at > schedule deadline';
COMMENT ON COLUMN reports.file_path   IS 'Relative path or cloud storage URL';


-- ── 2.6 review_logs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review_logs (
    log_id       SERIAL         PRIMARY KEY,
    report_id    INTEGER        NOT NULL REFERENCES reports(report_id)  ON DELETE CASCADE,
    reviewer_id  INTEGER        NOT NULL REFERENCES users(user_id)      ON DELETE RESTRICT,
    stage        review_stage   NOT NULL,
    action       review_action  NOT NULL,
    comment      TEXT,          -- required when action = 'rejected' (enforced at app layer)
    created_at   TIMESTAMP      NOT NULL DEFAULT NOW()  -- immutable audit timestamp
);

COMMENT ON TABLE  review_logs IS 'Immutable audit trail of every review/approval action on a report';
COMMENT ON COLUMN review_logs.created_at IS 'Do NOT update this — it is an audit timestamp';


-- ── 2.7 notifications ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    notif_id    SERIAL        PRIMARY KEY,
    user_id     INTEGER       NOT NULL REFERENCES users(user_id)    ON DELETE CASCADE,
    report_id   INTEGER                REFERENCES reports(report_id) ON DELETE SET NULL,
    event_type  VARCHAR(50)   NOT NULL,  -- 'report_due', 'submitted', 'approved', 'rejected', etc.
    message     TEXT          NOT NULL,
    is_read     BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  notifications            IS 'In-app notification records for all users';
COMMENT ON COLUMN notifications.event_type IS 'Short event key: report_due | submitted | reviewed | approved | rejected';


-- ─────────────────────────────────────────────────────────────
-- 3. INDEXES
-- ─────────────────────────────────────────────────────────────

-- users
CREATE INDEX IF NOT EXISTS idx_users_email   ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_dept    ON users(dept_id);
CREATE INDEX IF NOT EXISTS idx_users_team    ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_role    ON users(role);

-- reports
CREATE INDEX IF NOT EXISTS idx_reports_employee  ON reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_reports_status    ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_schedule  ON reports(schedule_id);
CREATE INDEX IF NOT EXISTS idx_reports_submitted ON reports(submitted_at DESC);

-- review_logs
CREATE INDEX IF NOT EXISTS idx_review_logs_report   ON review_logs(report_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_reviewer ON review_logs(reviewer_id);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user     ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_report   ON notifications(report_id);

-- report_schedules
CREATE INDEX IF NOT EXISTS idx_schedules_dept ON report_schedules(dept_id);
CREATE INDEX IF NOT EXISTS idx_schedules_team ON report_schedules(team_id);


-- ─────────────────────────────────────────────────────────────
-- 4. TRIGGER: auto-update updated_at on departments and users
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to departments
DROP TRIGGER IF EXISTS set_updated_at_departments ON departments;
CREATE TRIGGER set_updated_at_departments
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Attach to users
DROP TRIGGER IF EXISTS set_updated_at_users ON users;
CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Attach to reports
DROP TRIGGER IF EXISTS set_updated_at_reports ON reports;
CREATE TRIGGER set_updated_at_reports
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 5. SEED DATA (optional — for development and testing)
-- ─────────────────────────────────────────────────────────────

-- ── 5.1 Insert a default Admin user ──────────────────────────
-- Password: Admin@1234 (replace hash with actual bcrypt hash in production)
INSERT INTO users (full_name, email, password_hash, role)
VALUES (
    'System Admin',
    'admin@company.com',
    '$2b$12$placeholder_replace_with_real_bcrypt_hash',
    'admin'
) ON CONFLICT (email) DO NOTHING;


-- ── 5.2 Insert sample departments ────────────────────────────
INSERT INTO departments (name, description) VALUES
    ('Finance',    'Handles financial reporting and budgeting'),
    ('Operations', 'Manages day-to-day operations and logistics'),
    ('HR',         'Human resources and employee management'),
    ('ICT',        'Information and communication technology')
ON CONFLICT (name) DO NOTHING;


-- ── 5.3 Insert sample teams ──────────────────────────────────
INSERT INTO teams (name, dept_id) VALUES
    ('Accounts',      (SELECT dept_id FROM departments WHERE name = 'Finance')),
    ('Budgeting',     (SELECT dept_id FROM departments WHERE name = 'Finance')),
    ('Procurement',   (SELECT dept_id FROM departments WHERE name = 'Operations')),
    ('Logistics',     (SELECT dept_id FROM departments WHERE name = 'Operations')),
    ('Recruitment',   (SELECT dept_id FROM departments WHERE name = 'HR')),
    ('Payroll',       (SELECT dept_id FROM departments WHERE name = 'HR')),
    ('Dev Team',      (SELECT dept_id FROM departments WHERE name = 'ICT')),
    ('Support Team',  (SELECT dept_id FROM departments WHERE name = 'ICT'))
ON CONFLICT (name, dept_id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 6. USEFUL QUERIES FOR DEVELOPMENT
-- ─────────────────────────────────────────────────────────────

-- View all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- View all reports with employee name and status
-- SELECT r.report_id, u.full_name AS employee, r.title, r.status, r.submitted_at
-- FROM reports r
-- JOIN users u ON u.user_id = r.employee_id
-- ORDER BY r.submitted_at DESC;

-- View pending reports for a specific department reviewer
-- SELECT r.report_id, r.title, u.full_name AS employee, r.submitted_at
-- FROM reports r
-- JOIN users u ON u.user_id = r.employee_id
-- JOIN departments d ON d.dept_id = u.dept_id
-- WHERE d.reviewer_id = $1
--   AND r.status = 'submitted';

-- View full audit trail for a report
-- SELECT rl.log_id, u.full_name AS reviewer, rl.stage, rl.action, rl.comment, rl.created_at
-- FROM review_logs rl
-- JOIN users u ON u.user_id = rl.reviewer_id
-- WHERE rl.report_id = $1
-- ORDER BY rl.created_at ASC;

-- View unread notifications for a user
-- SELECT notif_id, event_type, message, created_at
-- FROM notifications
-- WHERE user_id = $1 AND is_read = FALSE
-- ORDER BY created_at DESC;

-- Dashboard: report count by status
-- SELECT status, COUNT(*) AS total
-- FROM reports
-- GROUP BY status
-- ORDER BY status;

-- Dashboard: compliance rate per department
-- SELECT d.name AS department,
--        COUNT(r.report_id)                                          AS total_reports,
--        COUNT(CASE WHEN r.status = 'approved' THEN 1 END)           AS approved,
--        ROUND(
--            COUNT(CASE WHEN r.status = 'approved' THEN 1 END)::NUMERIC
--            / NULLIF(COUNT(r.report_id), 0) * 100, 1
--        )                                                           AS compliance_pct
-- FROM departments d
-- LEFT JOIN users u   ON u.dept_id  = d.dept_id
-- LEFT JOIN reports r ON r.employee_id = u.user_id
-- GROUP BY d.dept_id, d.name
-- ORDER BY d.name;


-- ─────────────────────────────────────────────────────────────
-- END OF SCHEMA
-- ─────────────────────────────────────────────────────────────
