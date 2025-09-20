# Go Journy Backend

A comprehensive backend API for the Go Journy ride booking application built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

- **User Management**: Complete user registration, authentication, and profile management
- **Driver Management**: Driver registration, verification, and management system
- **Ride Management**: Create, manage, and track rides with real-time updates
- **Location Tracking**: Real-time driver location tracking, route optimization, and ETA calculations
- **Payment Integration**: Secure payment processing with SSLCommerz and invoice generation
- **Review System**: Rider reviews for drivers with featured reviews and statistics
- **Analytics**: Comprehensive analytics for admins, drivers, and riders
- **Authentication**: JWT-based authentication with access and refresh tokens, Google OAuth
- **Email Service**: SMTP-based email notifications and verification
- **Security**: Password hashing with Argon2, CORS protection, rate limiting, and secure cookie handling
- **Validation**: Request validation using Zod schemas
- **Error Handling**: Comprehensive error handling with custom error classes
- **Database**: MongoDB with Mongoose ODM, Redis for caching
- **Real-time Communication**: Socket.io for real-time updates
- **File Upload**: Cloudinary integration for image uploads
- **Deployment**: Ready for Vercel deployment

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose, Redis for caching
- **Authentication**: JWT (JSON Web Tokens), Passport.js with Google OAuth
- **Password Hashing**: Argon2
- **Validation**: Zod
- **Email**: Nodemailer
- **Real-time**: Socket.io
- **File Upload**: Cloudinary
- **Payment**: SSLCommerz
- **PDF Generation**: PDFKit
- **HTTP Client**: Axios
- **Rate Limiting**: Express-rate-limit
- **Scheduling**: Node-cron
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 📁 Project Structure

```
src/
├── app/
│   ├── config/           # Configuration files (Cloudinary, Passport, Redis)
│   ├── errors/           # Custom error classes
│   ├── interfaces/       # TypeScript interfaces
│   ├── middlewares/      # Express middlewares
│   ├── modules/          # Feature modules
│   │   ├── analytics/    # Analytics and insights
│   │   ├── auth/         # Authentication module
│   │   ├── driver/       # Driver management
│   │   ├── location/     # Location tracking and services
│   │   ├── payment/      # Payment processing
│   │   ├── review/       # Review system
│   │   ├── ride/         # Ride management
│   │   └── user/         # User management
│   ├── routes/           # API routes
│   └── utils/            # Utility functions (templates, email, JWT, etc.)
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
- `DELETE /api/v1/users/:id` - Delete user by id (admin)

### Drivers

- `PATCH /api/v1/drivers/register` - Driver registration
- `PATCH /api/v1/drivers/profile` - Update driver profile
- `GET /api/v1/drivers` - List drivers (admin)
- `PATCH /api/v1/drivers/manage-registration/:id` - Manage Driver registration (admin)
- `GET /api/v1/drivers/earnings` - Get ride earnings
- `PATCH /api/v1/drivers/availability` - Update driver availability
- `DELETE /api/v1/drivers/:id` - Delete driver by id (admin)

### Analytics

- `GET /api/v1/analytics/admin-analytics` - Get comprehensive analytics (admin)
- `GET /api/v1/analytics/rider-analytics` - Get rider analytics (rider)
- `GET /api/v1/analytics/driver-analytics` - Get driver analytics (driver)
- `GET /api/v1/analytics/admin/overview` - Get admin overview (admin)
- `GET /api/v1/analytics/admin/drivers` - Get admin drivers analytics (admin)
- `GET /api/v1/analytics/admin/rides` - Get admin rides analytics (admin)
- `GET /api/v1/analytics/admin/revenue-trend` - Get revenue trend (admin)

### Rides

- `POST /api/v1/rides/request` - Create a new ride (rider)
- `GET /api/v1/rides` - List rides
- `GET /api/v1/rides/:id` - Get ride details
- `PATCH /api/v1/rides/interested/:id` - Show interest in ride (driver)
- `PATCH /api/v1/rides/accept/:id` - Accept driver for ride (rider)
- `PATCH /api/v1/rides/cancel/:id` - Cancel ride (rider)
- `PATCH /api/v1/rides/:id/status` - Update ride status (driver/rider)
- `DELETE /api/v1/rides/:id` - Delete ride

### Admin Rides

- `GET /api/v1/rides/admin/overview` - Get rides overview (admin)
- `GET /api/v1/rides/admin/active` - Get active rides (admin)
- `GET /api/v1/rides/admin/issues` - Get rides with issues (admin)
- `GET /api/v1/rides/admin/driver/:driverId/history` - Get driver ride history (admin)
- `PATCH /api/v1/rides/admin/:id/status` - Override ride status (admin)
- `PATCH /api/v1/rides/admin/:id/assign-driver` - Assign driver to ride (admin)
- `PATCH /api/v1/rides/admin/:id/note` - Add admin note to ride (admin)
- `DELETE /api/v1/rides/admin/:id/force-delete` - Force delete ride (admin)

### Location

- `POST /api/v1/location/drivers/location` - Update driver location
- `GET /api/v1/location/drivers/location/:driverId` - Get driver location
- `GET /api/v1/location/rides/:rideId/location-history` - Get ride location history
- `POST /api/v1/location/rides/:rideId/route` - Calculate route
- `GET /api/v1/location/rides/:rideId/route` - Get stored route
- `POST /api/v1/location/rides/:rideId/eta` - Calculate ETA
- `GET /api/v1/location/geocode` - Geocode address
- `GET /api/v1/location/reverse-geocode` - Reverse geocode

### Payment

- `POST /api/v1/payment/init-payment/:rideId` - Initialize payment (rider)
- `POST /api/v1/payment/success` - Payment success callback
- `POST /api/v1/payment/fail` - Payment failure callback
- `POST /api/v1/payment/cancel` - Payment cancel callback
- `POST /api/v1/payment/validate-payment` - Validate payment (IPN)
- `GET /api/v1/payment/invoice/:paymentId` - Download invoice
- `POST /api/v1/payment/hold/:paymentId` - Hold payment (admin)
- `POST /api/v1/payment/release/:paymentId` - Release payment (admin)

### Reviews

- `GET /api/v1/reviews/featured` - Get featured reviews
- `GET /api/v1/reviews/my-reviews` - Get my reviews (rider)
- `GET /api/v1/reviews/driver/:driverId/stats` - Get driver review stats
- `GET /api/v1/reviews/driver/:driverId` - Get driver reviews
- `POST /api/v1/reviews/` - Create review (rider)
- `GET /api/v1/reviews/:id` - Get review by ID
- `PATCH /api/v1/reviews/:id` - Update review (rider)
- `DELETE /api/v1/reviews/:id` - Delete review (rider/admin)

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

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# SSLCommerz Configuration
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
SSLCOMMERZ_SUCCESS_URL=https://your-domain.com/api/v1/payment/success
SSLCOMMERZ_FAIL_URL=https://your-domain.com/api/v1/payment/fail
SSLCOMMERZ_CANCEL_URL=https://your-domain.com/api/v1/payment/cancel
SSLCOMMERZ_IPN_URL=https://your-domain.com/api/v1/payment/validate-payment

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

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

## 🔒 Security Features

- **Password Security**: Argon2 hashing algorithm
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **OAuth Integration**: Google OAuth for social login
- **Rate Limiting**: Express-rate-limit for API protection
- **CORS Protection**: Configured for specific frontend origins
- **Input Validation**: Zod schema validation for all inputs
- **Error Handling**: No sensitive information exposure
- **Environment Variables**: Secure configuration management
- **File Upload Security**: Cloudinary integration with validation

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
