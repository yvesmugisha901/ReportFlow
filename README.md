Internal Reporting System

A full-stack enterprise-style Internal Reporting System developed for organizational report management, workflow approvals, compliance tracking, and operational monitoring.

The system enables employees to submit scheduled reports, reviewers to evaluate submissions, and administrators to monitor organizational reporting performance through centralized dashboards and analytics.

Project Overview

This platform was designed to simulate a real-world enterprise workflow system used in organizations for:

Internal operational reporting
Department workflow management
Multi-stage approvals
Employee reporting compliance
Submission tracking
Organizational analytics
Notifications and monitoring

The system follows structured software engineering practices including:

SRS-based planning
ERD and DFD modeling
RESTful API architecture
Role-Based Access Control (RBAC)
Secure authentication using JWT
Modular frontend and backend architecture
Technologies Used:
Frontend:
Next.js
React.js
Tailwind CSS
Axios
Backend:
Node.js
Express.js
JWT Authentication
Helmet.js
bcrypt.js
Database
PostgreSQL
Development Tools
Git & GitHub
Postman
VS Code
System Architecture

The application follows a modern client-server architecture:

Frontend (Next.js)
↓
REST API (Express.js)
↓
PostgreSQL Database

The frontend communicates with backend APIs through secure JWT-based authentication.

Core Features
Authentication & Authorization
Secure login system
JWT-based authentication
Protected routes
Role-based access control
Session validation
User & Organization Management
Department creation
Team management
Employee registration
Role assignment
Department/team mapping
Report Management
Scheduled report submissions
File uploads
Dynamic report forms
Submission tracking
Report history
Approval Workflow
Multi-stage approval process
Department reviewer validation
Final approver workflow
Status transitions
Rejection and revision requests
Notifications
In-app notifications
Workflow alerts
Submission reminders
Approval/rejection updates
Dashboards & Analytics
Admin dashboard
Reviewer dashboard
Employee dashboard
Submission analytics
Compliance tracking
Search & Filtering
Filter by department
Filter by team
Filter by report type
Filter by status
Date-based filtering
Audit & Tracking
Timestamp tracking
Submission history
Status monitoring
Approval logs
Project Structure
Frontend Structure
/app
 ├── auth
 ├── components
 ├── context
 ├── dashboard
 ├── hooks
 ├── lib
 ├── page.jsx
 ├── layout.jsx
 └── globals.css
Folder Explanation
Folder	Purpose
auth	Authentication pages and login handling
components	Reusable UI components
context	Global state management and authentication context
dashboard	Role-based dashboard pages
hooks	Custom React hooks
lib	API utilities and helper functions
page.jsx	Main application entry page
layout.jsx	Shared application layout
globals.css	Global styling
Backend Features

The backend exposes RESTful APIs for:

Authentication
User management
Department management
Team management
Report submission
Approval workflow
Notifications
Dashboard analytics

Security measures include:

JWT verification middleware
Password hashing
Helmet.js security headers
Request validation
Error handling middleware
User Roles
Admin
Manage departments
Manage teams
Register employees
Configure report schedules
View organization analytics
Monitor compliance
Employee
Submit reports
Track report status
Receive notifications
View submission history
Department Reviewer
Review department reports
Approve/reject reports
Request changes
Final Approver
Final approval workflow
Organization-wide review access
Approval Workflow
Stage 1

Employee submits report

↓

Department Reviewer reviews report

Approve
Reject
Request Changes
Stage 2

Final Approver reviews approved reports

Final Approval
Reject
Request Revisions
Security Features
JWT Authentication
Password hashing using bcrypt
Protected API routes
Role-based authorization
Secure HTTP headers with Helmet.js
Input validation
Error handling middleware
Installation & Setup
Clone Repository
git clone <repository-url>
Frontend Setup
cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:3000
Backend Setup
cd backend
npm install
npm run dev

Backend runs on:

http://localhost:5000
Environment Variables

Create a .env file inside the backend folder:

PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
API Features

The system provides RESTful APIs for:

Module	Description
Auth API	Login & authentication
Users API	Employee management
Departments API	Department management
Teams API	Team management
Reports API	Report submission & tracking
Workflow API	Approval process
Notifications API	Alerts & updates
Database Design

Main entities include:

Users
Departments
Teams
Reports
Report Reviews
Notifications
Approval Logs

Relationships are managed using foreign keys to maintain data integrity.

Development Practices

This project follows:

Modular architecture
RESTful API design
Git version control
Component reusability
Clean folder structure
Role-based design principles
Secure authentication standards
Future Improvements
Email notification integration
Real-time notifications using WebSockets
Advanced analytics dashboards
PDF export functionality
Mobile responsiveness improvements
Activity audit logs
Report templates
Author
Mugisha Yves

Full-Stack Developer Intern

Technologies:

Next.js
React.js
Node.js
Express.js
PostgreSQL
TypeScript
Project Status

Current Progress: 70% Complete

Main modules completed:

Authentication
User management
Department & team management
Report workflow
Dashboards
API integration

Remaining work:

Final system polishing
Additional analytics
Notification enhancements
Final testing & optimization
License

This project was developed for internship and educational purposes
