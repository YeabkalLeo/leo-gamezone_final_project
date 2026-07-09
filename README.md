# Leo GameZone Management System

A comprehensive game zone management system built with Node.js, Express.js, and vanilla JavaScript. This system helps manage games, game sessions, snack inventory, and payments in a gaming center.

## 📋 Project Description

Leo GameZone Management System is a full-featured web application designed for managing a gaming center. It provides tools for:

* **Game Management**: Add, edit, delete, and track game availability.
* **Session Management**: Create and manage game sessions with customer tracking.
* **Snack Inventory**: Manage snack inventory with low stock alerts.
* **Payment Processing**: Record and track payments with reporting capabilities.
* **User Management**: Role-based access control (Admin, Manager, Staff).
* **Reporting**: Daily and monthly revenue reports.

## 🚀 Technology Stack

### Backend
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MySQL (with `mysql2` driver)
* **Authentication**: JWT (JSON Web Tokens)
* **Password Hashing**: bcryptjs
* **Logging**: Winston
* **Validation**: Joi
* **Security**: Helmet, CORS, Rate Limiting

### Frontend
* **Pure HTML, CSS, JavaScript**: No framework - vanilla implementation.
* **CSS**: Custom responsive design with Flexbox/Grid.
* **Icons**: Font Awesome
* **API**: Fetch API with JWT authentication.

### Database
* **MySQL** with proper relationships and indexes.
* **Tables**: Users, Snacks, Games, Game Sessions, Payments, Snack Sales, Audit Logs.

---

## 📁 Project Structure

```text
leo-gamezone/
├── backend/
│   ├── src/
│   │   ├── config/       # Database and JWT configuration
│   │   ├── models/       # Database models (MVC)
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, logging, rate limiting
│   │   ├── utils/        # Validation and helpers
│   │   └── app.js        # Main application file
│   ├── package.json
│   ├── .env
│   └── .gitignore
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── css/          # Styles
│   │   ├── js/           # JavaScript files
│   │   │   ├── api.js    # API communication
│   │   │   ├── auth.js   # Authentication logic
│   │   │   ├── dashboard.js
│   │   │   ├── games.js
│   │   │   ├── sessions.js
│   │   │   ├── snacks.js
│   │   │   ├── payments.js
│   │   │   └── app.js    # Main app controller
│   │   └── components/   # Reusable HTML components
│   └── package.json
├── database/
│   ├── schema.sql        # Database schema
│   └── seed.sql          # Seed data
└── README.md


## 🔧 Setup Instructions

### Prerequisites
* Node.js (v14 or higher)
* MySQL (v8 or higher)
* npm or yarn

### 1. Clone the Repository

```bash
git clone [https://github.com/yourusername/leo-gamezone.git](https://github.com/yourusername/leo-gamezone.git)
cd leo-gamezone

### 2. Database Setup

```bash
# Create database and tables
mysql -u root -p < database/schema.sql
# (Optional) Load seed data
mysql -u root -p < database/seed.sql

### 3. Backend Setup

```bash
cd backend
# Install dependencies
npm install
# Create .env file
cp .env.example .env
# Edit .env with your database credentials
# DB_PASSWORD=your_mysql_password
# JWT_SECRET=your_secret_key
# Start the server
npm run dev

### 4. Frontend Setup

```bash
cd ../frontend
# Install dependencies
npm install
# Start the frontend server
npm start

### 5. Access the Application
# Frontend: http://localhost:3000
# API: http://localhost:5000/api
# API Health Check: http://localhost:5000/health
# Default Login Credentials
    Admin: admin@leogamezone.com / admin123
    Staff: staff@leogamezone.com / staff123

### Database Schema

Entity Relationship Diagram (ERD)
users ────┬─── game_sessions ──── payments
          │         │
          └─────────┼─── games
                    │
                    └─── snack_sales ──── snacks

### Tables
# Table          Description
1. users	        System users with roles (admin, manager, staff)
2. snacks	        Snack inventory management
3. games           Game catalog with availability status
4. game_sessions	Game sessions linked to games and users
5. payments	    Payment records for sessions
6. snack_sales	    Snack sales within sessions
7. audit_logs	    Audit trail for system actions

### Security Features

# JWT Authentication: Stateless token-based authentication.
# Password Hashing: bcryptjs for secure password storage.
# Role-Based Access Control: Admin, Manager, and Staff roles.
# Input Validation: Server-side validation using Joi.
# Rate Limiting: Protection against brute force and DDoS attacks.
# Helmet.js: HTTP security headers for app protection.
# CORS: Configurable cross-origin resource sharing.
# Request Logging: Winston for industrial-grade request and error logging.

### API Endpoints
# Authentication
# Method      Endpoint            Description         Access
1. POST	  /api/auth/login	    User login	        Public
2. POST	  /api/auth/register	User registration	Public
3. GET	  /api/auth/profile	    Get user profile	Auth
4. GET	  /api/auth/users	    Get all users	    Admin

### Games
# Method      Endpoint                  Description           Access
1. GET      /api/games	            Get all games	        Staff+
2. GET	    /api/games/available	Get available games	    Staff+
3. POST	    /api/games	            Create game	            Admin
4. PUT	    /api/games/:id	        Update game	            Admin
5. DELETE	/api/games/:id	        Delete game	            Admin
6. PATCH	/api/games/:id/status	Update game status	    Admin

### Snacks
# Method          Endpoint                  Description           Access
1. GET	        /api/snacks	                Get all snacks  	Staff+
2. GET	        /api/snacks/low-stock	    Get low stock items	Staff+
3. POST	        /api/snacks	                Create snack	    Admin
4. PUT	        /api/snacks/:id	            Update snack	    Admin
5. DELETE	    /api/snacks/:id	            Delete snack	    Admin
6. PATCH	    /api/snacks/:id/quantity	Update quantity	    Admin

### Sessions
# Method        Endpoint            Description         Access
1. GET	    /api/sessions	        Get all sessions	Staff+
2. GET	    /api/sessions/active	Get active sessions	Staff+
3. POST	    /api/sessions	        Create session	    Staff+
4. POST	    /api/sessions/:id/end	End session 	    Staff+
5. DELETE	/api/sessions/:id	    Delete session	    Admin

### Payments
# Method          Endpoint                      Description             Access
1. GET	        /api/payments	                Get all payments	    Staff+
2. POST	        /api/payments	                Create payment  	    Staff+
3. GET	        /api/payments/daily-report	    Daily revenue report	Staff+
4. GET	        /api/payments/monthly-report	Monthly revenue report	Staff+

### Extra Features Implemented
# Beyond the standard requirements, this project includes:
# Advanced Reporting: Daily and monthly financial reports with payment method breakdown.
# Real-time Inventory Tracking: Automatic low-stock alerts.
# Session Management: Active session tracking with precise start/end functionality.
# Role-Based Access Control: Granular permissions for different user types.
# Comprehensive Logging: Winston logging with file rotation.
# Rate Limiting: Protection against API abuse.
# Audit Trail: Automated logging of all critical user actions.
# Responsive Design: Mobile-friendly interface optimized for multiple screen breakpoints.
# Keyboard Shortcuts: Quick navigation across interfaces using Ctrl+D, Ctrl+G, and Ctrl+S.
# Input Validation: Strict server-side verification for all incoming data payloads.
# Toast Notifications: User-friendly real-time feedback system.
# Modal Forms: Clean, distraction-free UI interfaces for CRUD operations.

### Testing

To run the full backend test suite, execute the following commands:
```bash
cd backend
npm test

### Performance Considerations
# Database indexes applied on frequently queried columns (user_id, game_id, session_id).
# Connection pooling setup for stable, efficient database access.
# Rate limiting middleware prevents network resource abuse.
# Efficient relational query design with explicit SQL joins.
# Client-side structural caching utilized where appropriate.

### Deployment
# Production Deployment Steps
1. Set up your environment variables inside your host production panel.
2. Use a node process manager like PM2 to maintain continuous runtime uptime:
        ```bash
        npm install -g pm2
        pm2 start backend/src/app.js --name leo-gamezone
3. Configure a reverse proxy server such as Nginx or Apache.
4. Secure your traffic using an SSL certificate for HTTPS.

### Contributing
# Fork the repository.
# Create your feature branch (git checkout -b feature/AmazingFeature).
# Commit your modifications (git commit -m 'Add some AmazingFeature').
# Push your branch upstream (git push origin feature/AmazingFeature).
# Open a Pull Request.

### License

This project is for educational purposes as part of the Web Programming II course.

# Author
Yeabkal

🙏 Acknowledgments
# Web Programming II Course Instructors
# Node.js and Express.js Documentation
# MySQL Documentation
