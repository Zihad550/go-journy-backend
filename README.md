# Go Journy Backend

A comprehensive backend API for the Go Journy ride booking application built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

- **User Management**: Complete user registration, authentication, and profile management
- **Driver Management**: Driver registration, verification, and management system
- **Ride Management**: Create, manage, and track rides with real-time updates
- **Authentication**: JWT-based authentication with access and refresh tokens
- **Email Service**: SMTP-based email notifications and verification
- **Security**: Password hashing with Argon2, CORS protection, and secure cookie handling
- **Validation**: Request validation using Zod schemas
- **Error Handling**: Comprehensive error handling with custom error classes
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Ready for Vercel deployment

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Argon2
- **Validation**: Zod
- **Email**: Nodemailer
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 📁 Project Structure

```
src/
├── app/
│   ├── errors/           # Custom error classes
│   ├── interfaces/       # TypeScript interfaces
│   ├── middlewares/      # Express middlewares
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication module
│   │   ├── driver/       # Driver management
│   │   ├── ride/         # Ride management
│   │   └── user/         # User management
│   ├── routes/           # API routes
│   └── utils/            # Utility functions
├── app.ts                # Express app configuration
├── env.ts                # Environment configuration
└── server.ts             # Server entry point
```

## 🚦 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Request to set a new password.
- `PATCH /api/v1/auth/reset-password` - Reset password using the token from forgot password.
- `PATCH /api/v1/auth/change-password` - Change logged-in user password.

### Users
- `GET /api/v1/users` -> Get all users (admin)
- `GET /api/v1/users/profile` - Get user profile
- `PATCH /api/v1/users/profile` - Update user profile
- `PATCH /api/v1/users/block/:id` - Block user (admin)
- `PATCH /api/v1/users/:id` - Update user by id (admin)

### Drivers
- `POST /api/v1/drivers/register` - Driver registration
- `PATCH /api/v1/drivers/profile` - Update driver profile
- `GET /api/v1/drivers` - List drivers (admin)
- `PATCH /api/v1/drivers/manage-registration/:id` - Manage Driver registration (admin)
- `GET /api/v1/drivers/earings` - Get ride earnings

### Rides
- `POST /api/v1/request` - Create a new ride
- `GET /api/v1/rides` - List rides
- `GET /api/v1/rides/:id` - Get ride details
- `PATCH /api/v1/rides/cancel/:id` - Cancel ride
- `PATCH /api/v1/rides/accept/:id` - Accept ride
- `PATCH /api/v1/rides/:id/status` - Update ride status

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/Zihad550/go-journy-backend
cd go-journy-backend
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:

```env
# Environment
NODE_ENV=development

# Server
PORT=5000

# Database
DEVELOPMENT_DB_URL=mongodb://localhost:27017/go-journy-dev
PRODUCTION_DB_URL=mongodb+srv://your-mongodb-url

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URLs
DEVELOPMENT_FRONTEND_URL=http://localhost:3000
PRODUCTION_FRONTEND_URL=https://your-frontend-url.com

# Backend URLs
DEVELOPMENT_BACKEND_URL=http://localhost:5000
PRODUCTION_BACKEND_URL=https://your-backend-url.com

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Super Admin
SUPER_ADMIN_EMAIL=admin@gojourny.com
SUPER_ADMIN_PASSWORD=your-super-admin-password
```

4. **Start the development server**
```bash
pnpm dev
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 🏗️ Build and Deploy

### Local Build
```bash
pnpm build
pnpm start
```

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

The project is configured for Vercel deployment with the included `vercel.json` configuration.

## 📊 Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build the TypeScript project
- `pnpm start` - Start production server
- `pnpm type-check` - Run TypeScript type checking

## 🔒 Security Features

- **Password Security**: Argon2 hashing algorithm
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for specific frontend origins
- **Input Validation**: Zod schema validation for all inputs
- **Error Handling**: No sensitive information exposure
- **Environment Variables**: Secure configuration management

## 🧪 Development

### Code Structure
- **Modular Architecture**: Features organized in separate modules
- **TypeScript**: Full type safety and modern JavaScript features
- **Middleware Pattern**: Reusable middleware for authentication, validation, etc.
- **Error Handling**: Centralized error handling with custom error classes
- **Validation**: Zod schemas for request/response validation

### Adding New Features
1. Create a new module in `src/app/modules/`
2. Define routes in the module's route file
3. Add the route to `src/app/routes/index.ts`
4. Implement controllers, services, and models as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Go Journy Backend** - Building the future of ride-sharing technology.
