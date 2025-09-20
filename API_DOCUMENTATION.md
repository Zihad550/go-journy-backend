# Go Journey API Documentation

## Base URL

```
Production: https://your-domain.com/api/v1
Development: http://localhost:8000/api/v1
```

## Authentication

The API uses Passport.js for authentication with support for local credentials and Google OAuth 2.0. JWT-based authentication with access and refresh tokens stored in HTTP-only cookies for security. Includes OTP verification for email verification and enhanced user status management.

### Headers

```
Content-Type: application/json
Cookie: accessToken=<jwt_token>; refreshToken=<refresh_token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {}
}
```

## User Roles

- `SUPER_ADMIN` - Platform super administrator
- `ADMIN` - Platform administrator
- `RIDER` - Regular user who can book rides
- `DRIVER` - Verified driver who can accept rides

## Recent Changes

### v1.1.2 - 2025-09-20
- **DOCUMENTATION UPDATE**: Added complete Location API documentation (/location/* endpoints)
- **DOCUMENTATION UPDATE**: Added complete Review API documentation (/reviews/* endpoints)
- **DOCUMENTATION UPDATE**: Added comprehensive Admin Ride Management documentation (/rides/admin/* endpoints)
- **FIX**: Corrected accept driver validation schema to include optional paymentId parameter
- **ENHANCEMENT**: Improved API documentation completeness and accuracy

### v1.1.1 - 2025-09-16
- **SECURITY IMPROVEMENT**: Added authentication to payment endpoints
- **DOCUMENTATION UPDATE**: Fixed analytics endpoint paths and user profile schema
- **ENHANCEMENT**: Added comprehensive admin analytics endpoints documentation
- **ENHANCEMENT**: Updated authentication requirements for payment operations
- **FIX**: Corrected role references from USER to RIDER throughout documentation

### v1.1.0 - 2025-09-15
- **NEW FEATURE**: Payment Hold/Release Flow Implementation
- Added `HELD` and `RELEASED` payment statuses
- New endpoints: `POST /payment/hold/{paymentId}` and `POST /payment/release/{paymentId}`
- Updated ride acceptance to require payment validation
- Automatic payment release on ride completion
- Added `paymentHeld` and `paymentReleased` flags to ride model
- Enhanced payment security with ownership validation
- Updated SSLCommerz integration for hold/release functionality

### v1.0.0 - 2025-09-14
- **BREAKING CHANGE**: Removed `USER` and `GUIDE` roles, replaced with `RIDER` and `DRIVER`
- Updated all authentication middleware and business logic
- Frontend must update role references from `USER`/`GUIDE` to `RIDER`/`DRIVER`
- Default user role changed from `USER` to `RIDER`

## Account Status

- `ACTIVE` - Account is active and functional
- `INACTIVE` - Account is inactive
- `BLOCKED` - Account is blocked by admin

---

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "address": "123 Main St, City, Country"
}
```

**Password Requirements:**

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 special character (!@#$%^&\*)
- At least 1 number

**Response:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "rider",
    "accountStatus": "active"
  }
}
```

### POST /auth/login

Authenticate user and receive tokens.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
Sets HTTP-only cookies and returns user data.

### POST /auth/logout

Logout user and clear tokens.

**Authentication:** Required

### PATCH /auth/change-password

Change user password.

**Authentication:** Required (All roles)

**Request Body:**

```json
{
  "oldPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

### POST /auth/forgot-password

Request password reset email.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

### PATCH /auth/reset-password

Reset password using reset token.

**Authentication:** Required

**Request Body:**

```json
{
  "newPassword": "NewPass123!"
}
```

### POST /auth/refresh-token

Get new access token using refresh token.

**Request:** Requires refreshToken cookie

### GET /auth/google

Initiate Google OAuth login.

**Response:** Redirects to Google OAuth consent screen

### GET /auth/google/callback

Google OAuth callback endpoint.

**Response:** Redirects to frontend with authentication result

### POST /auth/otp/send

Send OTP for email verification.

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP sent successfully"
}
```

### POST /auth/otp/verify

Verify OTP code for email verification.

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully"
}
```

## OTP Email Verification Flow

The API includes OTP (One-Time Password) verification for email addresses during user registration. This ensures email validity and prevents spam accounts.

### Registration Flow with OTP

1. **User Registration**: User submits registration form with email, password, name, phone, and address
2. **OTP Generation**: System generates a 6-digit OTP and sends it to the user's email
3. **Email Verification**: User receives OTP via email and submits it for verification
4. **Account Activation**: Upon successful OTP verification, the user's account is marked as verified and active

### OTP Expiration

- OTP codes expire after 10 minutes
- Each email can request a maximum of 5 OTP codes per hour
- OTP codes are stored securely using Redis with automatic expiration

### Security Features

- OTP codes are hashed before storage
- Failed verification attempts are rate-limited
- Email addresses must be unique across the system

---

## User Management Endpoints

### GET /users

Get all users (Admin only).

**Authentication:** Required (admin, super_admin)

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name or email

### GET /users/profile

Get current user profile.

**Authentication:** Required (All roles)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "RIDER",
    "isActive": "ACTIVE",
    "isVerified": true,
    "picture": "https://example.com/profile.jpg",
    "address": "123 Main St, City, Country",
    "driver": null,
    "bookings": [],
    "guides": []
  }
}
```

### PATCH /users/profile

Update current user profile.

**Authentication:** Required (All roles)

**Request Body:**

```json
{
  "name": "Updated Name"
}
```

**Note:** Currently only name updates are supported. Phone, address, and picture updates will be added in future versions.

### PATCH /users/block/:id

Block or unblock user account.

**Authentication:** Required (admin, super_admin)

**URL Parameters:**

- `id` - User ID to block/unblock

**Query Parameters:**

- `status` (optional) - Action to perform
  - `blocked` - Block the user account (default if not provided)
  - `active` - Unblock the user account

**Examples:**

```bash
# Block a user
PATCH /api/v1/users/block/64f1a2b3c4d5e6f7g8h9i0j1?status=blocked

# Unblock a user
PATCH /api/v1/users/block/64f1a2b3c4d5e6f7g8h9i0j1?status=active
```

**Business Rules:**

- Only admins and super admins can block/unblock users
- Super admin accounts cannot be blocked or unblocked
- When blocking a user:
  - User status is set to `BLOCKED`
  - If user has a driver account, it is set to `REJECTED` status and `OFFLINE` availability
- When unblocking a user:
  - User status is set to `ACTIVE`
  - If user has an approved driver account, availability is restored to `ONLINE`

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User blocked successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": "BLOCKED",
    "role": "RIDER"
  }
}
```

### PATCH /users/:id

Update user by ID (Admin only).

**Authentication:** Required (admin, super_admin)

**Request Body:**

```json
{
  "name": "Updated Name",
  "isActive": "BLOCKED",
  "role": "ADMIN"
}
```

### DELETE /users/:id

Delete user by ID.

**Authentication:** Required (admin, super_admin)

---

## Analytics Endpoints

### GET /analytics/admin-analytics

Get comprehensive analytics and insights (Admin only).

**Authentication:** Required (admin, super_admin)

**Query Parameters:**

- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)
- `period`: One of 'daily', 'weekly', 'monthly', 'yearly' (optional, default: 'monthly')

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Analytics retrieved successfully",
  "data": {
    "statusDistribution": [
      {
        "_id": "completed",
        "count": 150
      }
    ],
    "revenueAnalytics": {
      "totalRevenue": 2500.50,
      "totalRides": 150,
      "averageRidePrice": 16.67
    },
    "trendData": [
      {
        "_id": {
          "year": 2024,
          "month": 1
        },
        "totalRides": 45,
        "completedRides": 42,
        "cancelledRides": 3,
        "totalRevenue": 750.00
      }
    ],
    "topDrivers": [
      {
        "totalRides": 25,
        "completedRides": 24,
        "totalEarnings": 400.00,
        "completionRate": 96.0,
        "driverName": "Jane Smith",
        "driverEmail": "jane@example.com"
      }
    ]
  }
}
```

**Business Rules:**

- Only admins and super admins can access comprehensive analytics
- Provides system-wide statistics including revenue, ride trends, and driver performance
- Date filtering and period grouping supported

### GET /analytics/rider-analytics

Get rider analytics (Rider only).

**Authentication:** Required (RIDER)

**Query Parameters:**

- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)
- `period`: One of 'daily', 'weekly', 'monthly', 'yearly' (optional, default: 'monthly')

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rider analytics retrieved successfully",
  "data": {
    "overview": {
      "totalRides": 25,
      "completedRides": 23,
      "cancelledRides": 2,
      "totalSpent": 425.50,
      "averageRideCost": 18.50,
      "completionRate": 92.0
    },
    "spendingTrends": [
      {
        "_id": {
          "year": 2024,
          "month": 1
        },
        "totalSpent": 125.50,
        "rideCount": 7,
        "averageCost": 17.93
      }
    ],
    "favoriteLocations": {
      "pickupLocations": [
        {
          "location": {
            "lat": "23.8103",
            "lng": "90.4125"
          },
          "count": 5
        }
      ],
      "destinationLocations": [
        {
          "location": {
            "lat": "23.7515",
            "lng": "90.3753"
          },
          "count": 4
        }
      ]
    },
    "driverRatings": {
      "averageRating": 4.5,
      "totalReviews": 23,
      "ratingDistribution": {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 8,
        "5": 12
      },
      "recentReviews": [
        {
          "driverName": "Jane Smith",
          "rating": 5,
          "comment": "Excellent service!",
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ]
    },
    "rideHistory": [
      {
        "_id": "ride_id",
        "status": "completed",
        "price": 25.50,
        "pickupLocation": {
          "lat": "23.8103",
          "lng": "90.4125"
        },
        "destination": {
          "lat": "23.7515",
          "lng": "90.3753"
        },
        "driverName": "Jane Smith",
        "createdAt": "2024-01-15T09:00:00Z",
        "completedAt": "2024-01-15T09:45:00Z"
      }
    ]
  }
}
```

**Business Rules:**

- Only authenticated riders can access their own analytics
- Provides personal ride statistics, spending patterns, and driver feedback history
- Includes favorite pickup/destination locations based on ride frequency

### GET /analytics/driver-analytics

Get driver analytics (Driver only).

**Authentication:** Required (DRIVER)

**Query Parameters:**

- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)
- `period`: One of 'daily', 'weekly', 'monthly', 'yearly' (optional, default: 'monthly')

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver analytics retrieved successfully",
  "data": {
    "overview": {
      "totalRides": 45,
      "completedRides": 42,
      "cancelledRides": 3,
      "totalEarnings": 750.00,
      "averageRideEarnings": 17.86,
      "completionRate": 93.33
    },
    "earningsTrends": [
      {
        "_id": {
          "year": 2024,
          "month": 1
        },
        "totalEarnings": 750.00,
        "rideCount": 45,
        "averageEarnings": 16.67
      }
    ],
    "riderRatings": {
      "averageRating": 4.7,
      "totalReviews": 42,
      "ratingDistribution": {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 15,
        "5": 24
      },
      "recentReviews": [
        {
          "riderName": "John Doe",
          "rating": 5,
          "comment": "Great driver, very professional!",
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ]
    },
    "rideHistory": [
      {
        "_id": "ride_id",
        "status": "completed",
        "price": 25.50,
        "pickupLocation": {
          "lat": "23.8103",
          "lng": "90.4125"
        },
        "destination": {
          "lat": "23.7515",
          "lng": "90.3753"
        },
        "riderName": "John Doe",
        "createdAt": "2024-01-15T09:00:00Z",
        "completedAt": "2024-01-15T09:45:00Z"
      }
    ]
  }
}
```

**Business Rules:**

- Only authenticated drivers can access their own analytics
- Provides personal driving statistics, earnings patterns, and rider feedback
- Includes ride completion rates and earnings trends over time
- Shows recent rider reviews and ratings received

### GET /analytics/admin/overview

Get overview statistics for the admin dashboard.

**Authentication:** Required (admin, super_admin)

**Description:** Get overview statistics for the admin dashboard

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Overview stats retrieved successfully",
  "data": {
    "totalUsers": 1250,
    "totalDrivers": 85,
    "totalRides": 3200,
    "totalRevenue": 45678.50,
    "activeDrivers": 42,
    "completedRides": 2890,
    "pendingRides": 156,
    "cancelledRides": 154
  }
}
```

**Business Rules:**
- Only admins and super admins can access
- Returns aggregated statistics across the platform
- All numbers should be current/live data

### GET /analytics/admin/drivers

Get driver analytics and statistics.

**Authentication:** Required (admin, super_admin)

**Description:** Get driver analytics and statistics

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver analytics retrieved successfully",
  "data": {
    "driversByStatus": {
      "pending": 12,
      "approved": 65,
      "rejected": 8
    },
    "driversByAvailability": {
      "online": 42,
      "offline": 43
    },
    "topDriversByRides": [
      {
        "driverId": "driver_id_1",
        "driverName": "John Smith",
        "totalRides": 145,
        "earnings": 2890.50
      },
      {
        "driverId": "driver_id_2",
        "driverName": "Jane Doe",
        "totalRides": 132,
        "earnings": 2640.00
      }
    ]
  }
}
```

**Business Rules:**
- Only admins and super admins can access
- `driversByStatus` counts drivers by their approval status
- `driversByAvailability` counts approved drivers by online/offline status
- `topDriversByRides` returns top 10 drivers sorted by total completed rides
- Include only approved drivers in top drivers list

### GET /analytics/admin/rides

Get ride analytics and statistics.

**Authentication:** Required (admin, super_admin)

**Description:** Get ride analytics and statistics

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride analytics retrieved successfully",
  "data": {
    "ridesByStatus": {
      "requested": 45,
      "accepted": 23,
      "in_transit": 12,
      "completed": 2890,
      "cancelled": 154
    },
    "ridesByTimeOfDay": [
      { "hour": 0, "count": 5 },
      { "hour": 1, "count": 2 },
      { "hour": 2, "count": 1 },
      // ... 24 entries for each hour
      { "hour": 23, "count": 8 }
    ],
    "averageRidePrice": 14.25,
    "totalDistance": 45678.5
  }
}
```

**Business Rules:**
- Only admins and super admins can access
- `ridesByStatus` counts rides by their current status
- `ridesByTimeOfDay` aggregates ride requests by hour (0-23)
- `averageRidePrice` is average price of completed rides
- `totalDistance` is sum of distances for completed rides (in km)

### GET /analytics/admin/revenue-trend

Get revenue trend data over time.

**Authentication:** Required (admin, super_admin)

**Query Parameters:**
- `period` (optional): 'daily' | 'weekly' | 'monthly' (default: 'daily')
- `days` (optional): number (default: 30)

**Description:** Get revenue trend data over time

**Request Example:**
```
GET /analytics/admin/revenue-trend?period=daily&days=30
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Revenue trend retrieved successfully",
  "data": {
    "daily": [
      { "date": "2024-01-01", "value": 1250.50 },
      { "date": "2024-01-02", "value": 1340.75 },
      // ... up to 30 entries
    ],
    "weekly": [
      { "date": "2024-01-01", "value": 8750.25 },
      { "date": "2024-01-08", "value": 9200.00 },
      // ... weekly aggregations
    ],
    "monthly": [
      { "date": "2024-01-01", "value": 36500.75 },
      { "date": "2024-02-01", "value": 42100.50 },
      // ... monthly aggregations
    ]
  }
}
```

**Business Rules:**
- Only admins and super admins can access
- Returns data for the specified period type
- `days` parameter controls how far back to look (default 30 days)
- For daily: returns daily revenue totals
- For weekly: returns weekly revenue totals (sum of 7 days)
- For monthly: returns monthly revenue totals
- Date format should be YYYY-MM-DD
- Values are revenue amounts (sum of completed ride prices)

---

## Driver Management Endpoints

### GET /drivers

Get all drivers (Admin only).

**Authentication:** Required (admin, super_admin)

**Business Rules:**

- Only admins and super admins can view all drivers
- Returns all driver records with populated user information
- Includes drivers with all statuses (pending, approved, rejected)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Drivers retrieved successfully",
  "data": [
    {
      "_id": "driver_id_1",
      "user": {
        "_id": "user_id_1",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "+1234567890",
        "accountStatus": "active"
      },
      "vehicle": {
        "name": "Toyota Camry",
        "model": "2020"
      },
      "experience": 5,
      "availability": "online",
      "driverStatus": "approved",
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "_id": "driver_id_2",
      "user": {
        "_id": "user_id_2",
        "name": "Mike Johnson",
        "email": "mike@example.com",
        "phone": "+1234567891",
        "accountStatus": "active"
      },
      "vehicle": {
        "name": "Honda Accord",
        "model": "2021"
      },
      "experience": 3,
      "availability": "offline",
      "driverStatus": "pending",
      "createdAt": "2024-01-15T11:00:00Z",
      "updatedAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

**Business Rules:**

- Only admins and super admins can view all drivers
- Returns all driver records with populated user information
- Includes drivers with all statuses (pending, approved, rejected)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Drivers retrieved successfully",
  "data": [
    {
      "_id": "driver_id_1",
      "user": {
        "_id": "user_id_1",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "+1234567890",
        "accountStatus": "active"
      },
      "vehicle": {
        "name": "Toyota Camry",
        "model": "2020"
      },
      "experience": 5,
      "availability": "online",
      "driverStatus": "approved",
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T12:00:00Z"
    },
    {
      "_id": "driver_id_2",
      "user": {
        "_id": "user_id_2",
        "name": "Mike Johnson",
        "email": "mike@example.com",
        "phone": "+1234567891",
        "accountStatus": "active"
      },
      "vehicle": {
        "name": "Honda Accord",
        "model": "2021"
      },
      "experience": 3,
      "availability": "offline",
      "driverStatus": "pending",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### PATCH /drivers/register

Register as a driver (Rider only).

**Authentication:** Required (RIDER)

**Request Body:**

```json
{
  "vehicle": {
    "name": "Toyota Camry",
    "model": "2020"
  },
  "experience": 5
}
```

**Validation:**

- `vehicle` object is required
  - `vehicle.name` must be a string (required)
  - `vehicle.model` must be a string (required)
- `experience` must be a number (required)

**Business Rules:**

- User must have RIDER role to register as DRIVER
- User cannot have an existing driver registration (pending, approved, or rejected)
- Initial driver status is set to `pending`
- Initial availability is set to `offline`
- User's driver field is updated with the new driver ID

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver request sent successfully",
  "data": {
    "_id": "driver_id",
    "user": {
      "_id": "user_id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "accountStatus": "active"
    },
    "vehicle": {
      "name": "Toyota Camry",
      "model": "2020"
    },
    "experience": 5,
    "availability": "offline",
    "driverStatus": "pending",
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T09:00:00Z"
  }
}
```

### GET /drivers/profile

Get current driver profile.

**Authentication:** Required (driver, rider)

**Business Rules:**

- User must be registered as a driver (have a driver record)
- Returns driver information with populated user data
- Accessible by both drivers and riders (riders can check their driver application status)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver profile retrieved successfully",
  "data": {
    "_id": "driver_id",
    "user": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "accountStatus": "active"
    },
    "vehicle": {
      "name": "Toyota Camry",
      "model": "2020"
    },
    "experience": 5,
    "availability": "online",
    "driverStatus": "approved",
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### PATCH /drivers/profile

Update driver profile.

**Authentication:** Required (DRIVER)

**Request Body:**

```json
{
  "vehicle": {
    "name": "Honda Accord",
    "model": "2021"
  },
  "experience": 6
}
```

**Validation:**

- `vehicle.name` must be a string (optional)
- `vehicle.model` must be a string (optional)
- `experience` must be a number with minimum value of 0 (optional)

**Business Rules:**

- User must be registered as a driver
- All fields are optional (partial update)
- Vehicle information can be updated partially

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver information updated successfully",
  "data": {
    "_id": "driver_id",
    "user": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "accountStatus": "active"
    },
    "vehicle": {
      "name": "Honda Accord",
      "model": "2021"
    },
    "experience": 6,
    "availability": "online",
    "driverStatus": "approved",
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

**Validation:**

- `vehicle.name` must be a string (optional)
- `vehicle.model` must be a string (optional)
- `experience` must be a number with minimum value of 0 (optional)
- All fields are optional for partial updates

**Business Rules:**

- User must have DRIVER role
- User must be registered as a driver
- Only provided fields will be updated

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver information updated successfully",
  "data": {
    "_id": "driver_id",
    "user": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "accountStatus": "active"
    },
    "vehicle": {
      "name": "Honda Accord",
      "model": "2021"
    },
    "experience": 6,
    "availability": "online",
    "driverStatus": "approved"
  }
}
```

### PATCH /drivers/manage-registration/:id

Approve/reject driver registration.

**Authentication:** Required (admin, super_admin)

**URL Parameters:**

- `id` - Driver ID

**Request Body:**

```json
{
  "driverStatus": "approved"
}
```

**Validation:**

- `driverStatus` must be one of: "approved", "pending", "rejected"

**Driver Status Options:**

- `pending` - Registration pending review
- `approved` - Driver approved and can accept rides
- `rejected` - Registration rejected

**Business Rules:**

- When approved: driver status changes to "approved", availability set to "online", user role updated to "driver"
- When rejected: driver status changes to "rejected", availability set to "offline"
- Only pending drivers can be approved/rejected

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver request updated successfully",
  "data": {
    "_id": "driver_id",
    "user": {
      "_id": "user_id",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "driverStatus": "approved",
    "availability": "online",
    "vehicle": {
      "name": "Toyota Camry",
      "model": "2020"
    },
    "experience": 5,
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

### GET /drivers/earnings

Get driver earnings summary from completed rides.

**Authentication:** Required (DRIVER)

**Business Rules:**

- User must be registered as a driver
- Only calculates earnings from rides with status `completed`
- Returns total earnings from all completed rides

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride info retrieved successfully",
  "data": [
    {
      "_id": null,
      "earnings": 125.5
    }
  ]
}
```

**Note:** Returns an array with aggregated earnings data. If no completed rides exist, returns an empty array.

### PATCH /drivers/availability

Update driver availability status.

**Authentication:** Required (DRIVER)

**Request Body:**

```json
{
  "availability": "online"
}
```

**Availability Options:**

- `online` - Driver is available to accept rides
- `offline` - Driver is not available for rides

**Business Rules:**

- Only approved drivers can update their availability
- Driver must be registered and verified
- User must have driver role

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver availability updated successfully",
  "data": {
    "_id": "driver_id",
    "user": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "availability": "online",
    "driverStatus": "approved",
    "vehicle": {
      "name": "Toyota Camry",
      "model": "2020"
    },
    "experience": 5
  }
}
```

### DELETE /drivers/:id

Delete driver by ID.

**Authentication:** Required (admin, super_admin)

**URL Parameters:**

- `id` - Driver ID to delete

**Business Rules:**

- Only admins and super admins can delete drivers
- Permanently removes driver record from database
- Associated user account remains but driver field is cleared

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver deleted successfully",
  "data": {
    "_id": "driver_id",
    "user": "user_id",
    "driverStatus": "approved",
    "availability": "online"
  }
}
```

---

## Ride Management Endpoints

### GET /rides

Get rides based on user role with populated driver and rider information.

**Authentication:** Required (All roles)

**Response varies by role:**

- **Rider:** Returns rides they requested with populated driver and interested drivers information
- **Driver:** Returns rides they can show interest in (status: requested) or have been assigned to, with populated rider information
- **Admin/Super Admin:** Returns all rides with full population including interested drivers

**Response Examples:**

**For Riders:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride info retrieved successfully",
  "data": [
    {
      "_id": "ride_id",
      "rider": "rider_id",
      "driver": {
        "_id": "driver_id",
        "user": {
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "vehicle": {
          "name": "Toyota Camry",
          "model": "2020"
        },
        "experience": 5
      },
      "interestedDrivers": [
        {
          "_id": "interested_driver_id",
          "user": {
            "name": "Mike Johnson",
            "email": "mike@example.com"
          },
          "vehicle": {
            "name": "Honda Accord",
            "model": "2021"
          },
          "experience": 3
        }
      ],
      "status": "requested",
      "pickupLocation": {
        "lat": "40.7128",
        "lng": "-74.0060"
      },
      "destination": {
        "lat": "40.7589",
        "lng": "-73.9851"
      },
      "price": 25.5,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:05:00Z"
    }
  ]
}
```

**For Drivers:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride info retrieved successfully",
  "data": [
    {
      "_id": "ride_id",
      "rider": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "driver": "driver_id",
      "status": "requested",
      "pickupLocation": {
        "lat": "40.7128",
        "lng": "-74.0060"
      },
      "destination": {
        "lat": "40.7589",
        "lng": "-73.9851"
      },
      "price": 25.5,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:05:00Z"
    }
  ]
}
```

### POST /rides/request

Request a new ride (Rider only).

**Authentication:** Required (RIDER)

**Request Body:**

```json
{
  "pickupLocation": {
    "lat": "40.7128",
    "lng": "-74.0060"
  },
  "destination": {
    "lat": "40.7589",
    "lng": "-73.9851"
  },
  "price": 25.5
}
```

**Validation:**

- `pickupLocation.lat` and `pickupLocation.lng` must be strings
- `destination.lat` and `destination.lng` must be strings
- `price` must be a number (minimum 0)

**Business Rules:**

- Checks for available drivers (approved and online)
- Rider cannot request a ride if already on an active ride (requested, accepted, or in_transit)
- Sets initial status to `requested`
- Assigns rider ID from authenticated user

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride requested successfully",
  "data": {
    "_id": "ride_id",
    "rider": "rider_id",
    "status": "requested",
    "pickupLocation": {
      "lat": "40.7128",
      "lng": "-74.0060"
    },
    "destination": {
      "lat": "40.7589",
      "lng": "-73.9851"
    },
    "price": 25.5,
    "interestedDrivers": [],
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### PATCH /rides/interested/:id

Show interest in a ride (Driver only).

**Authentication:** Required (DRIVER)

**URL Parameters:**

- `id` - Ride ID to show interest in

**Business Rules:**

- Driver must be approved and online
- Driver's account must be active
- Ride status must be `requested`
- Driver cannot show interest if already interested in this ride
- Driver cannot show interest if already on another active ride (accepted or in_transit)
- Adds driver to the ride's `interestedDrivers` array

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Interest shown successfully",
  "data": {
    "_id": "ride_id",
    "interestedDrivers": ["driver_id_1", "driver_id_2"],
    "status": "requested"
  }
}
```

### PATCH /rides/accept/:id

Accept a specific driver for a ride (Rider only).

**Authentication:** Required (RIDER)

**URL Parameters:**

- `id` - Ride ID

**Request Body:**

```json
{
  "driverId": "driver_object_id",
  "paymentId": "payment_object_id"
}
```

**Validation:**

- `driverId` must be a valid string representing a driver's ObjectId
- `paymentId` must be a valid string representing a payment ObjectId (optional but required for new flow)

**Business Rules:**

- Driver must have shown interest in the ride
- Driver must be approved and online
- Driver cannot be on another active ride
- Ride status must be `requested`
- **NEW:** Payment must be in status `held` before driver can be accepted
- **NEW:** If `paymentId` is provided, it must match the ride's payment
- Sets ride status to `accepted` and assigns driver
- Removes driver from interested drivers list of other rides
- Sets `pickupTime` to current timestamp

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver accepted successfully",
  "data": {
    "_id": "ride_id",
    "status": "accepted",
    "driver": "driver_id",
    "pickupTime": "2024-01-15T10:30:00Z",
    "paymentHeld": true
  }
}
```

**Business Logic:**

- Driver must have shown interest in the ride (be in `interestedDrivers` array)
- Driver must be approved, online, and available
- Ride status must be "requested"
- When accepted, ride status changes to "accepted" and `pickupTime` is set
- Driver is automatically removed from `interestedDrivers` array of all other rides

**Response:**

````json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver accepted successfully",
  "data": {
    "_id": "ride_id",
    "rider": "rider_id",
    "driver": "accepted_driver_id",
    "status": "accepted",
    "pickupTime": "2024-01-15T10:30:00Z",
    "interestedDrivers": [],
    "pickupLocation": {
      "lat": "40.7128",
      "lng": "-74.0060"
    },
    "destination": {
      "lat": "40.7589",
      "lng": "-73.9851"
    },
    "price": 25.5
  }
}

### PATCH /rides/cancel/:id

Cancel a ride (Rider only).

**Authentication:** Required (RIDER)

**URL Parameters:**

- `id` - Ride ID to cancel

**Business Rules:**

- Only the rider who requested the ride can cancel it
- Ride status must be `requested`
- Ride cannot be cancelled if more than 30 minutes have passed since creation
- Ride cannot be cancelled if a driver has already been assigned
- Sets ride status to `cancelled`

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride cancelled successfully",
  "data": {
    "_id": "ride_id",
    "status": "cancelled"
  }
}
```

### PATCH /rides/:id/status

Update ride status based on user role and current status.

**Authentication:** Required (driver, rider)

**Request Body:**

```json
{
  "status": "in_transit"
}
````

**Ride Status Options:**

- `requested` - Initial status when ride is requested (drivers can show interest)
- `accepted` - Rider has accepted a specific driver (ride assigned)
- `in_transit` - Ride is in progress (driver picked up rider)
- `completed` - Ride completed successfully
- `cancelled` - Ride was cancelled

**Ride Data Model:**

```json
{
  "_id": "ride_id",
  "rider": "ObjectId", // Reference to User
  "driver": "ObjectId", // Reference to Driver (null until accepted)
  "interestedDrivers": ["ObjectId"], // Array of Driver ObjectIds who showed interest
  "status": "requested|accepted|in_transit|completed|cancelled",
  "pickupLocation": {
    "lat": "string",
    "lng": "string"
  },
  "destination": {
    "lat": "string",
    "lng": "string"
  },
  "price": "number",
  "pickupTime": "Date", // Set when driver is accepted
  "dropoffTime": "Date", // Set when ride is completed
  "paymentHeld": "boolean", // Flag indicating if payment is held
  "paymentReleased": "boolean", // Flag indicating if payment is released
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Status Transition Rules:**

- **Drivers can:**
  - Change `requested` → `accepted` (when accepting a ride - assigns driver to ride)
  - Change `accepted` → `in_transit` (when picking up rider)
- **Riders can:**
  - Change `in_transit` → `completed` (when ride is finished)

**Business Rules:**

- Cannot change status of completed rides
- Cannot directly change requested ride status (must use accept/cancel endpoints)
- Drivers can only change status to `accepted` if ride status is not already `accepted`
- Drivers can only change status to `in_transit` if ride status is currently `accepted`
- Only authenticated driver or rider associated with the ride can update status

### GET /rides/:id

Get specific ride information with populated driver and rider details.

**Authentication:** Required (driver, rider)

**Response varies by role:**

- **Riders:** See interested drivers information for their rides
- **Drivers:** See basic ride information for rides they're assigned to

**Response Example (for Rider):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride info retrieved successfully",
  "data": {
    "_id": "ride_id",
    "rider": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "driver": {
      "_id": "driver_id",
      "user": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "vehicle": {
        "name": "Toyota Camry",
        "model": "2020"
      },
      "experience": 5
    },
    "interestedDrivers": [
      {
        "_id": "interested_driver_id",
        "user": {
          "name": "Mike Johnson",
          "email": "mike@example.com"
        },
        "vehicle": {
          "name": "Honda Accord",
          "model": "2021"
        },
        "experience": 3
      }
    ],
    "status": "accepted",
    "pickupLocation": {
      "lat": "40.7128",
      "lng": "-74.0060"
    },
    "destination": {
      "lat": "40.7589",
      "lng": "-73.9851"
    },
    "price": 25.5,
    "pickupTime": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### DELETE /rides/:id

Delete ride by ID.

**Authentication:** Required (driver, rider)

**URL Parameters:**

- `id` - Ride ID to delete

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride deleted successfully",
  "data": null

}
```

### Admin Ride Management Endpoints

The following endpoints are available under the `/rides/admin` path for administrative ride management.

#### GET /rides/admin/overview

Get comprehensive rides overview with filtering, sorting, and pagination.

**Authentication:** Required (admin, super_admin)

**Query Parameters:**

- `status`: Ride status filter (optional)
- `driverId`: Filter by driver ObjectId (optional)
- `riderId`: Filter by rider ObjectId (optional)
- `startDate`: ISO date string for filtering (optional)
- `endDate`: ISO date string for filtering (optional)
- `page`: Page number (optional, default: 1)
- `limit`: Items per page (optional, default: 10)
- `sortBy`: Sort field (optional, default: createdAt)
- `sortOrder`: Sort order 'asc' or 'desc' (optional, default: 'desc')

**Business Rules:**

- Only admins and super admins can access
- Returns rides with populated driver and rider information
- Supports advanced filtering and sorting
- Includes pagination metadata

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride overview retrieved successfully",
  "data": {
    "rides": [
      {
        "_id": "ride_id",
        "rider": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "driver": {
          "user": {
            "name": "Jane Smith",
            "email": "jane@example.com"
          },
          "vehicle": {
            "name": "Toyota Camry",
            "model": "2020"
          }
        },
        "status": "completed",
        "pickupLocation": {
          "lat": 23.8103,
          "lng": 90.4125
        },
        "destination": {
          "lat": 23.7515,
          "lng": 90.3753
        },
        "price": 25.50,
        "createdAt": "2024-01-15T09:00:00Z",
        "completedAt": "2024-01-15T09:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    },
    "filters": {
      "status": "completed",
      "dateRange": {
        "start": "2024-01-01T00:00:00Z",
        "end": "2024-01-31T23:59:59Z"
      }
    }
  }
}
```

#### GET /rides/admin/active

Get all currently active rides (requested, accepted, in_transit).

**Authentication:** Required (admin, super_admin)

**Business Rules:**

- Returns rides that are currently in progress
- Includes real-time status information
- Used for monitoring active ride operations

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Active rides retrieved successfully",
  "data": [
    {
      "_id": "ride_id",
      "rider": {
        "name": "John Doe",
        "phone": "+1234567890"
      },
      "driver": {
        "user": {
          "name": "Jane Smith",
          "phone": "+1234567891"
        }
      },
      "status": "in_transit",
      "pickupLocation": {
        "lat": 23.8103,
        "lng": 90.4125
      },
      "destination": {
        "lat": 23.7515,
        "lng": 90.3753
      },
      "price": 25.50,
      "pickupTime": "2024-01-15T10:30:00Z",
      "currentLocation": {
        "lat": 23.8000,
        "lng": 90.4000
      }
    }
  ]
}
```

#### GET /rides/admin/issues

Get rides with issues (cancelled, long duration, no drivers, disputed).

**Authentication:** Required (admin, super_admin)

**Query Parameters:**

- `issueType`: Filter by issue type (optional)
  - `cancelled` - Cancelled rides
  - `long_duration` - Rides taking longer than expected
  - `no_driver` - Rides with no driver interest
  - `disputed` - Rides with disputes
- `page`: Page number (optional, default: 1)
- `limit`: Items per page (optional, default: 10)

**Business Rules:**

- Identifies problematic rides requiring attention
- Supports filtering by issue type
- Includes detailed information for resolution

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride issues retrieved successfully",
  "data": {
    "issues": [
      {
        "_id": "ride_id",
        "rider": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "issueType": "long_duration",
        "issueDescription": "Ride has been in transit for over 2 hours",
        "status": "in_transit",
        "createdAt": "2024-01-15T08:00:00Z",
        "duration": 7200,
        "expectedDuration": 1800
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

#### GET /rides/admin/driver/:driverId/history

Get comprehensive ride history for a specific driver.

**Authentication:** Required (admin, super_admin)

**URL Parameters:**

- `driverId` - Driver ObjectId

**Query Parameters:**

- `page`: Page number (optional, default: 1)
- `limit`: Items per page (optional, default: 10)
- `status`: Filter by ride status (optional)

**Business Rules:**

- Returns all rides associated with the driver
- Includes performance metrics and statistics
- Used for driver evaluation and support

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver ride history retrieved successfully",
  "data": {
    "driver": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "totalRides": 150,
      "completionRate": 95.5,
      "averageRating": 4.7
    },
    "rides": [
      {
        "_id": "ride_id",
        "rider": {
          "name": "John Doe"
        },
        "status": "completed",
        "price": 25.50,
        "rating": 5,
        "createdAt": "2024-01-15T09:00:00Z",
        "completedAt": "2024-01-15T09:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

#### PATCH /rides/admin/:id/status

Override ride status (admin intervention).

**Authentication:** Required (admin, super_admin)

**URL Parameters:**

- `id` - Ride ObjectId

**Request Body:**

```json
{
  "status": "completed",
  "reason": "Admin override due to system error"
}
```

**Validation:**

- `status`: Valid ride status enum value (required)
- `reason`: Reason for override (required, 1-500 characters)

**Business Rules:**

- Allows admins to manually change ride status
- Requires justification for audit trail
- Triggers appropriate follow-up actions (payment release, notifications)
- Logs admin action for compliance

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride status updated successfully",
  "data": {
    "_id": "ride_id",
    "status": "completed",
    "adminOverride": {
      "adminId": "admin_id",
      "reason": "Admin override due to system error",
      "timestamp": "2024-01-15T12:00:00Z"
    },
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

#### PATCH /rides/admin/:id/assign-driver

Manually assign driver to ride.

**Authentication:** Required (admin, super_admin)

**URL Parameters:**

- `id` - Ride ObjectId

**Request Body:**

```json
{
  "driverId": "driver_object_id",
  "reason": "Original driver unavailable"
}
```

**Validation:**

- `driverId`: Valid driver ObjectId (required)
- `reason`: Reason for manual assignment (required, 1-500 characters)

**Business Rules:**

- Assigns driver to ride bypassing normal interest process
- Validates driver availability and approval status
- Removes ride from other drivers' interested lists
- Logs admin action for audit trail

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver assigned successfully",
  "data": {
    "_id": "ride_id",
    "driver": "driver_id",
    "status": "accepted",
    "adminAssignment": {
      "adminId": "admin_id",
      "reason": "Original driver unavailable",
      "timestamp": "2024-01-15T11:30:00Z"
    },
    "pickupTime": "2024-01-15T11:30:00Z"
  }
}
```

#### PATCH /rides/admin/:id/note

Add internal admin note to ride.

**Authentication:** Required (admin, super_admin)

**URL Parameters:**

- `id` - Ride ObjectId

**Request Body:**

```json
{
  "note": "Customer reported issue with driver behavior. Follow up required."
}
```

**Validation:**

- `note`: Note text (required, 1-1000 characters)

**Business Rules:**

- Adds internal notes visible only to admins
- Used for tracking issues and resolutions
- Maintains audit trail of admin actions

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admin note added successfully",
  "data": {
    "_id": "ride_id",
    "adminNotes": [
      {
        "adminId": "admin_id",
        "note": "Customer reported issue with driver behavior. Follow up required.",
        "timestamp": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

#### DELETE /rides/admin/:id/force-delete

Force delete ride (permanent deletion with audit log).

**Authentication:** Required (admin, super_admin)

**URL Parameters:**

- `id` - Ride ObjectId

**Request Body:**

```json
{
  "reason": "Duplicate ride entry created by system error"
}
```

**Validation:**

- `reason`: Deletion reason (required, 1-500 characters)

**Business Rules:**

- Permanently removes ride from database
- Requires justification for audit trail
- Cleans up related data (payments, reviews, location history)
- Logs admin action for compliance
- Only used in extreme cases

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride force deleted successfully",
  "data": {
    "rideId": "ride_id",
    "deletedBy": "admin_id",
    "reason": "Duplicate ride entry created by system error",
    "timestamp": "2024-01-15T13:00:00Z"
  }
}
```

---

## Payment Management Endpoints

### POST /payment/init-payment/:rideId

Initialize payment for a ride using SSLCommerz gateway (Rider only).

**Authentication:** Required (RIDER)
**Authorization:** Only the rider who requested the ride can initiate payment

**URL Parameters:**

- `rideId` - Ride ObjectId to initiate payment for

**Business Rules:**

- Only the rider who requested the ride can initiate payment
- Ride must be in status `completed`
- Payment record must exist for the ride
- Payment must be in status `unpaid`

**Response:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Payment initiated successfully",
  "data": {
    "paymentUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=PWU..."
  }
}
```

### POST /payment/success

Handle successful payment callback from SSLCommerz.

**Authentication:** Not required (SSLCommerz callback)

**Query Parameters:**

- `transactionId` - Payment transaction ID
- `amount` - Payment amount
- `status` - Payment status (success)

**Business Rules:**

- Updates payment status to `paid`
- Updates ride status to `completed`
- Generates PDF invoice and uploads to Cloudinary
- Sends invoice email to rider
- Redirects to frontend success page

**Response:** Redirect to frontend success URL

### POST /payment/fail

Handle failed payment callback from SSLCommerz.

**Authentication:** Not required (SSLCommerz callback)

**Query Parameters:**

- `transactionId` - Payment transaction ID
- `amount` - Payment amount
- `status` - Payment status (fail)

**Business Rules:**

- Updates payment status to `failed`
- Updates ride status to `cancelled`
- Redirects to frontend failure page

**Response:** Redirect to frontend failure URL

### POST /payment/cancel

Handle cancelled payment callback from SSLCommerz.

**Authentication:** Not required (SSLCommerz callback)

**Query Parameters:**

- `transactionId` - Payment transaction ID
- `amount` - Payment amount
- `status` - Payment status (cancel)

**Business Rules:**

- Updates payment status to `cancelled`
- Updates ride status to `cancelled`
- Redirects to frontend cancellation page

**Response:** Redirect to frontend cancellation URL

### POST /payment/validate-payment

Validate payment via IPN (Instant Payment Notification) from SSLCommerz.

**Authentication:** Not required (SSLCommerz IPN)

**Request Body:** SSLCommerz IPN payload

**Business Rules:**

- Validates payment with SSLCommerz validation API
- Updates payment gateway data
- Used for server-to-server payment confirmation

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment Validated Successfully",
  "data": null
}
```

### GET /payment/invoice/:paymentId

Download payment invoice PDF.

**Authentication:** Required (RIDER, DRIVER, admin, super_admin)
**Authorization:**
- Rider: Can download invoices for their own rides
- Driver: Can download invoices for rides they completed
- Admin/Super Admin: Can download any invoice

**URL Parameters:**

- `paymentId` - Payment ObjectId

**Authorization Rules:**

- Rider: Can download invoices for their own rides
- Driver: Can download invoices for rides they completed
- Admin/Super Admin: Can download any invoice

**Business Rules:**

- Payment must be in status `paid`
- Invoice URL must exist in payment record

**Response:** Returns Cloudinary URL for PDF download

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Invoice download URL retrieved successfully",
  "data": "https://res.cloudinary.com/.../invoice.pdf"
}
```

### POST /payment/hold/:paymentId

Hold payment after successful capture (System/Admin only).

**Authentication:** Required (admin, super_admin)
**Authorization:** Admin users can hold payments for security and escrow purposes

**URL Parameters:**

- `paymentId` - Payment ObjectId to hold

**Request Body:**

```json
{
  "rideId": "string",
  "driverId": "string"
}
```

**Business Rules:**

- Payment must be in status `paid` before it can be held
- Updates payment status to `held`
- Stores driver information for release
- Sets `heldAt` timestamp
- Updates ride with `paymentHeld: true`
- Ensures payment cannot be refunded while held

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment held successfully",
  "data": {
    "paymentId": "string",
    "status": "held",
    "heldAt": "2024-01-01T00:00:00Z"
  }
}
```

### POST /payment/release/:paymentId

Release held payment to driver after ride completion (System/Admin only).

**Authentication:** Required (admin, super_admin)
**Authorization:** Admin users can release held payments to drivers after ride completion

**URL Parameters:**

- `paymentId` - Payment ObjectId to release

**Request Body:**

```json
{
  "rideId": "string"
}
```

**Business Rules:**

- Payment must be in status `held` before it can be released
- Ride must be in status `completed`
- Transfers funds to driver's account/wallet (via payment gateway)
- Updates payment status to `released`
- Sets `releasedAt` timestamp
- Updates ride with `paymentReleased: true`
- Sends notification to driver

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment released to driver successfully",
  "data": {
    "paymentId": "string",
    "status": "released",
    "releasedAt": "2024-01-01T00:00:00Z",
    "driverId": "string",
    "amount": 25.00
  }
}
```

---

## Payment Data Model

**Payment Schema:**

```json
{
  "_id": "ObjectId",
  "ride": "ObjectId", // Reference to Ride
  "driver": "ObjectId", // Reference to Driver (set when payment is held)
  "transactionId": "string", // Unique transaction identifier
  "amount": "number", // Payment amount
  "status": "unpaid|paid|cancelled|failed|refunded|held|released",
  "paymentGatewayData": "object", // SSLCommerz response data
  "invoiceUrl": "string", // Cloudinary URL for PDF invoice
  "heldAt": "Date", // Timestamp when payment was held
  "releasedAt": "Date", // Timestamp when payment was released
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Payment Status Options:**

- `unpaid` - Payment initiated but not completed (default)
- `paid` - Payment successfully completed
- `cancelled` - Payment was cancelled by user
- `failed` - Payment failed due to error
- `refunded` - Payment was refunded
- `held` - Payment captured but held until ride completion
- `released` - Payment released to driver after ride completion

**Payment Flow:**

#### New Payment Hold/Release Flow (v1.1.0)

1. **Ride Request**: Rider requests ride, payment record created with status `unpaid`
2. **Payment Initiation**: Rider calls `/payment/init-payment/:rideId`
3. **SSLCommerz Redirect**: User is redirected to SSLCommerz payment gateway
4. **Payment Processing**: User completes payment on SSLCommerz
5. **Payment Success**: Payment status changes to `paid`
6. **Payment Hold**: System calls `/payment/hold/{paymentId}` to hold payment
7. **Driver Selection**: Rider selects driver and calls `/rides/accept/:id` with `paymentId`
8. **Driver Acceptance**: Driver is accepted only if payment status is `held`
9. **Ride Progress**: Ride progresses through accepted → in_transit → completed
10. **Auto Payment Release**: When ride status changes to `completed`, payment is automatically released to driver
11. **Invoice Generation**: PDF invoice is generated and emailed to rider
12. **Status Updates**: Payment status changes to `released`, ride flags updated

#### Legacy Flow (Pre-v1.1.0)

1. **Ride Completion**: Rider completes ride, payment becomes payable
2. **Payment Initiation**: Rider calls `/payment/init-payment/:rideId`
3. **SSLCommerz Redirect**: User is redirected to SSLCommerz payment gateway
4. **Payment Processing**: User completes payment on SSLCommerz
5. **Callback Handling**: SSLCommerz redirects to success/fail/cancel endpoints
6. **Invoice Generation**: PDF invoice is generated and emailed to rider
7. **Status Updates**: Payment and ride statuses are updated accordingly

**Security Features:**

- SSLCommerz sandbox/production environment support
- Transaction ID validation
- IPN (Instant Payment Notification) for server-side validation
- Secure payment data storage
- Cloudinary secure invoice storage

## Payment Business Rules

1. **Payment Integration:**
   - Payments are automatically created when rides are requested
   - Payment amount equals ride price
   - Payment status starts as `unpaid`

2. **Payment Authorization:**
   - Only the rider who requested the ride can initiate payment
   - Payment can only be initiated for completed rides
   - Payment must be in `unpaid` status to initiate

3. **Payment Hold/Release Flow (v1.1.0):**
   - After successful payment, system automatically holds payment
   - Payment status changes from `paid` to `held`
   - Driver acceptance requires payment to be in `held` status
   - Payment is automatically released when ride status changes to `completed`
   - Funds are transferred to driver's account upon release

4. **SSLCommerz Integration:**
   - Sandbox environment for development/testing
   - Production environment for live payments
   - Secure callback URLs for success/fail/cancel handling
   - IPN validation for server-side payment confirmation
   - Hold/release functionality for escrow-like payments

5. **Invoice Generation:**
   - PDF invoices automatically generated on successful payment
   - Invoices uploaded to Cloudinary for secure storage
   - Invoice emails sent to riders with PDF attachments
   - Invoice URLs accessible for download

6. **Payment Status Management:**
   - Success: Updates payment to `paid`, then automatically to `held`
   - Failure: Updates payment to `failed`, ride to `cancelled`
   - Cancellation: Updates payment to `cancelled`, ride to `cancelled`
   - Held: Payment captured but not released to driver
   - Released: Payment transferred to driver's account

7. **Transaction Security:**
   - Unique transaction IDs generated for each payment
   - Payment gateway data stored for audit trails
   - All payment operations logged for compliance
   - Payment ownership validation before hold/release operations

---

## Payment Hold/Release Flow (v1.1.0)

### Overview

The Payment Hold/Release Flow ensures that payments are securely held until ride completion, providing protection for both riders and drivers. This prevents scenarios where drivers might be paid for incomplete or cancelled rides.

### Complete Workflow

1. **Ride Request** (`POST /rides/request`)
   - Rider requests a ride
   - Payment record created with status `unpaid`
   - Ride status: `requested`

2. **Payment Initiation** (`POST /payment/init-payment/:rideId`)
   - Rider initiates payment
   - Redirected to SSLCommerz payment gateway
   - Ride status remains: `requested`

3. **Payment Success** (SSLCommerz callback)
   - Payment status: `paid`
   - System automatically calls `/payment/hold/{paymentId}`
   - Payment status: `held`
   - Ride `paymentHeld`: `true`

4. **Driver Selection & Acceptance** (`PATCH /rides/accept/:id`)
   - Rider selects driver from interested drivers
   - System validates payment status is `held`
   - Ride status: `accepted`
   - Driver assigned to ride

5. **Ride Progress** (`PATCH /rides/:id/status`)
   - Driver updates status: `accepted` → `in_transit`
   - Rider updates status: `in_transit` → `completed`

6. **Automatic Payment Release**
   - When ride status changes to `completed`
   - System automatically calls `/payment/release/{paymentId}`
   - Payment status: `released`
   - Ride `paymentReleased`: `true`
   - Funds transferred to driver's account

7. **Invoice Generation**
   - PDF invoice generated and emailed to rider
   - Invoice stored securely on Cloudinary

### Error Scenarios

- **Payment Hold Failure**: If payment hold fails, payment is refunded to rider
- **Driver Acceptance without Payment**: Returns error if payment not held
- **Payment Release Failure**: Payment remains in `held` status, flagged for manual intervention
- **Ride Cancellation**: Payment can be refunded if cancelled before driver acceptance

### Security Features

- Payment ownership validation
- Transaction rollback on failures
- Audit trail with timestamps
- Rate limiting on payment operations
- Secure payment gateway integration

---

## Real-Time Location Tracking Endpoints

### Overview

The Real-Time Location Tracking API provides comprehensive location services including driver tracking, route optimization, geocoding, and WebSocket-based real-time updates for the Go-Journy ride-sharing application.

### WebSocket Integration

**Connection URL:** `ws://localhost:8000` (or your server URL)

**Authentication:** Include JWT token in handshake auth:
```javascript
const socket = io('http://localhost:8000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});
```

**Socket Events:**

#### Client Events
- `join-ride` - Join ride-specific room for real-time updates
- `track-driver` - Track specific driver location updates

#### Server Events
- `driver-location-update` - Real-time driver location updates
- `ride-status-update` - Ride status changes
- `eta-update` - Estimated time of arrival updates
- `error` - Error notifications

### POST /location/drivers/location

Update driver current location with real-time broadcasting.

**Authentication:** Required (DRIVER)

**Rate Limit:** 30 updates per minute

**Request Body:**

```json
{
  "lat": 23.8103,
  "lng": 90.4125,
  "accuracy": 10.5,
  "heading": 45.0,
  "speed": 15.2
}
```

**Validation:**

- `lat`: Number between -90 and 90 (required)
- `lng`: Number between -180 and 180 (required)
- `accuracy`: Optional positive number (GPS accuracy in meters)
- `heading`: Optional number 0-360 degrees (direction)
- `speed`: Optional non-negative number (speed in m/s)

**Business Rules:**

- Only approved drivers can update location
- Location updates are broadcast to relevant ride participants
- If driver has active ride, location is stored in ride history
- Updates driver's online status and last updated timestamp

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Location updated successfully",
  "data": {
    "driverId": "driver_id",
    "location": {
      "lat": 23.8103,
      "lng": 90.4125,
      "accuracy": 10.5,
      "heading": 45.0,
      "speed": 15.2,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "broadcasted": true
  }
}
```

### GET /location/drivers/location/:driverId

Get current driver location.

**Authentication:** Required (RIDER, DRIVER, admin, super_admin)

**Authorization Rules:**

- **Rider:** Can only access location of driver assigned to their active ride
- **Driver:** Can only access their own location
- **Admin/Super Admin:** Can access any driver's location

**Query Parameters:**

- `rideId`: Optional, for additional validation

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver location retrieved successfully",
  "data": {
    "driverId": "driver_id",
    "location": {
      "lat": 23.8103,
      "lng": 90.4125,
      "accuracy": 10.5,
      "heading": 45.0,
      "speed": 15.2,
      "timestamp": "2024-01-15T10:30:00Z",
      "address": "Dhaka, Bangladesh"
    },
    "isOnline": true,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### GET /location/rides/:rideId/location-history

Get ride location history with time filtering.

**Authentication:** Required (RIDER, DRIVER, admin, super_admin)

**Authorization Rules:**

- **Rider:** Can only access history for rides they requested
- **Driver:** Can only access history for rides they're assigned to
- **Admin/Super Admin:** Can access any ride's history

**Query Parameters:**

- `startTime`: ISO date string (optional, default: 24 hours ago)
- `endTime`: ISO date string (optional, default: now)
- `limit`: Number (optional, default: 100, max: 1000)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Location history retrieved successfully",
  "data": {
    "rideId": "ride_id",
    "driverId": "driver_id",
    "locations": [
      {
        "lat": 23.8103,
        "lng": 90.4125,
        "timestamp": "2024-01-15T10:30:00Z",
        "speed": 15.2,
        "heading": 45.0
      }
    ],
    "total": 150,
    "timeRange": {
      "start": "2024-01-15T09:00:00Z",
      "end": "2024-01-15T10:30:00Z"
    }
  }
}
```

### POST /location/rides/:rideId/route

Calculate optimal route for a ride using Mapbox Directions API.

**Authentication:** Required (RIDER, DRIVER, admin, super_admin)

**Authorization Rules:**

- **Rider:** Can only calculate routes for their own rides
- **Driver:** Can only calculate routes for assigned rides
- **Admin/Super Admin:** Can calculate routes for any ride

**Request Body:**

```json
{
  "profile": "driving-traffic",
  "alternatives": false,
  "steps": true
}
```

**Route Profile Options:**

- `driving` - Standard driving directions
- `driving-traffic` - Driving with live traffic data
- `walking` - Walking directions
- `cycling` - Cycling directions

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Route calculated successfully",
  "data": {
    "rideId": "ride_id",
    "route": {
      "geometry": {
        "type": "LineString",
        "coordinates": [[90.4125, 23.8103], [90.3753, 23.7515]]
      },
      "duration": 1800,
      "distance": 8500,
      "instructions": [
        {
          "text": "Head southeast on Road 1",
          "distance": 1200,
          "duration": 180,
          "type": "turn"
        }
      ]
    },
    "waypoints": [
      { "lat": 23.8103, "lng": 90.4125, "name": "Pickup Location" },
      { "lat": 23.7515, "lng": 90.3753, "name": "Destination" }
    ]
  }
}
```

### GET /location/rides/:rideId/route

Get stored route for a ride.

**Authentication:** Required (RIDER, DRIVER, admin, super_admin)

**Response:** Same format as route calculation endpoint

### POST /location/rides/:rideId/eta

Calculate estimated time of arrival from current location.

**Authentication:** Required (RIDER, DRIVER, admin, super_admin)

**Request Body:**

```json
{
  "currentLocation": {
    "lat": 23.8000,
    "lng": 90.4000
  }
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "ETA calculated successfully",
  "data": {
    "rideId": "ride_id",
    "eta": "2024-01-15T11:15:00Z",
    "duration": 2700,
    "distance": 5200,
    "trafficDelay": 600,
    "route": {
      "geometry": {
        "type": "LineString",
        "coordinates": [[90.4000, 23.8000], [90.3753, 23.7515]]
      },
      "duration": 2700,
      "distance": 5200
    }
  }
}
```

### GET /location/geocode

Forward geocoding - convert address to coordinates.

**Authentication:** Required (all roles)

**Rate Limit:** 10 requests per minute

**Query Parameters:**

- `query`: Search term (required)
- `limit`: Number of results (optional, default: 5, max: 10)
- `country`: Country code filter (optional)
- `bbox`: Bounding box for search area (optional)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Geocoding results retrieved successfully",
  "data": {
    "query": "dhaka university",
    "results": [
      {
        "placeName": "University of Dhaka, Dhaka, Bangladesh",
        "coordinates": {
          "lat": 23.7337,
          "lng": 90.3929
        },
        "address": {
          "street": "Nilkhet Road",
          "city": "Dhaka",
          "country": "Bangladesh",
          "postcode": "1000"
        },
        "relevance": 0.95
      }
    ]
  }
}
```

### GET /location/reverse-geocode

Reverse geocoding - convert coordinates to address.

**Authentication:** Required (all roles)

**Rate Limit:** 10 requests per minute

**Query Parameters:**

- `lat`: Latitude (required)
- `lng`: Longitude (required)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Address retrieved successfully",
  "data": {
    "coordinates": {
      "lat": 23.8103,
      "lng": 90.4125
    },
    "address": {
      "placeName": "Motijheel, Dhaka, Bangladesh",
      "street": "Dilkusha Commercial Area",
      "city": "Dhaka",
      "district": "Dhaka",
      "country": "Bangladesh",
      "postcode": "1222"
    }
  }
}
```

### GET /location/places

Search for points of interest near a location.

**Authentication:** Required (all roles)

**Rate Limit:** 20 requests per minute

**Query Parameters:**

- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `type`: POI type (gas_station, restaurant, hospital, etc.)
- `radius`: Search radius in meters (optional, default: 1000, max: 5000)
- `limit`: Number of results (optional, default: 10, max: 50)

**POI Types:**

- `gas_station` - Gas stations
- `restaurant` - Restaurants
- `hospital` - Hospitals and medical facilities
- `pharmacy` - Pharmacies
- `atm` - ATMs
- `bank` - Banks
- `hotel` - Hotels
- `parking` - Parking facilities

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Places retrieved successfully",
  "data": {
    "center": {
      "lat": 23.8103,
      "lng": 90.4125
    },
    "places": [
      {
        "id": "poi_123",
        "name": "Shell Gas Station",
        "type": "gas_station",
        "coordinates": {
          "lat": 23.8150,
          "lng": 90.4100
        },
        "address": "123 Motijheel Road, Dhaka",
        "distance": 550,
        "rating": 4.2
      }
    ]
  }
}
```

### WebSocket Event Examples

**Join Ride Room:**
```javascript
socket.emit('join-ride', { rideId: 'ride_id' });

// Server response
socket.on('joined-ride', (data) => {
  console.log('Joined ride:', data.rideId);
});
```

**Track Driver:**
```javascript
socket.emit('track-driver', { driverId: 'driver_id' });

// Server response
socket.on('tracking-driver', (data) => {
  console.log('Tracking driver:', data.driverId);
});
```

**Receive Location Updates:**
```javascript
socket.on('driver-location-update', (data) => {
  console.log('Driver location:', data.location);
  // Update map marker
  updateMapMarker(data.location);
});
```

**Receive Ride Status Updates:**
```javascript
socket.on('ride-status-update', (data) => {
  console.log('Ride status:', data.status);
  // Update UI
  updateRideStatus(data.status);
});
```

**Receive ETA Updates:**
```javascript
socket.on('eta-update', (data) => {
  console.log('ETA:', data.eta);
  // Update ETA display
  updateETADisplay(data.eta);
});
```

**Error Handling:**
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // Handle error appropriately
});
```

### Location Data Models

**Location Schema:**
```json
{
  "lat": "number", // Latitude (-90 to 90)
  "lng": "number", // Longitude (-180 to 180)
  "accuracy": "number", // GPS accuracy in meters (optional)
  "heading": "number", // Direction in degrees (0-360, optional)
  "speed": "number", // Speed in m/s (optional)
  "timestamp": "Date", // Location timestamp
  "address": "string", // Human-readable address (optional)
  "geohash": "string" // Geospatial hash for queries (optional)
}
```

**Driver Location Schema:**
```json
{
  "_id": "ObjectId",
  "driverId": "ObjectId", // Reference to Driver
  "location": "Location", // Current location
  "isOnline": "boolean", // Online status
  "lastUpdated": "Date", // Last location update
  "rideId": "ObjectId" // Current active ride (optional)
}
```

**Location History Schema:**
```json
{
  "_id": "ObjectId",
  "rideId": "ObjectId", // Reference to Ride
  "driverId": "ObjectId", // Reference to Driver
  "location": "Location", // Location data
  "createdAt": "Date" // Auto-expired after 24 hours
}
```

**Route Schema:**
```json
{
  "_id": "ObjectId",
  "rideId": "ObjectId", // Reference to Ride (unique)
  "geometry": {
    "type": "LineString",
    "coordinates": "number[][]" // GeoJSON coordinates
  },
  "duration": "number", // Duration in seconds
  "distance": "number", // Distance in meters
  "instructions": [
    {
      "text": "string", // Turn instruction
      "distance": "number", // Distance to instruction
      "duration": "number", // Time to instruction
      "type": "turn|straight|arrive" // Instruction type
    }
  ],
  "waypoints": "Location[]", // Route waypoints
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Business Rules

1. **Location Updates:**
   - Only approved drivers can update their location
   - Location updates are rate-limited to prevent abuse
   - Updates are broadcast in real-time to relevant clients
   - Location history is automatically maintained for active rides

2. **Authorization:**
   - Riders can only track drivers assigned to their active rides
   - Drivers can only access their own location data
   - Admins have full access to all location data

3. **WebSocket Security:**
   - JWT authentication required for all socket connections
   - Room-based access control for ride and driver tracking
   - Automatic cleanup of inactive connections

4. **Geospatial Features:**
   - MongoDB geospatial indexes for efficient location queries
   - Support for GeoJSON geometry in route storage
   - Automatic geohash generation for location data

5. **Rate Limiting:**
   - Location updates: 30 per minute per driver
   - Geocoding requests: 10 per minute per user
   - Places search: 20 per minute per user

6. **Data Retention:**
   - Location history automatically expires after 24 hours
   - Route data persists until ride completion
   - Driver locations updated in real-time

7. **Error Handling:**
   - Comprehensive error types for different failure scenarios
   - Standardized error responses across all endpoints
   - WebSocket error broadcasting for real-time error notification

---

## Review Management Endpoints

### Overview

The Review API provides comprehensive review and rating functionality for the Go-Journy ride-sharing platform. Users can rate and review their ride experiences, while drivers receive feedback to improve their service.

### GET /reviews/featured

Get featured 5-star reviews for homepage display.

**Authentication:** Not required (Public access)

**Query Parameters:**

- `limit`: Number of reviews to return (optional, default: 6, max: 20)

**Business Rules:**

- Returns only reviews with 5-star ratings
- Reviews are sorted by creation date (newest first)
- Includes rider and driver information
- Used for homepage testimonials and marketing

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Featured reviews retrieved successfully",
  "data": [
    {
      "_id": "review_id",
      "ride": "ride_id",
      "rider": {
        "name": "John Doe",
        "picture": "https://example.com/profile.jpg"
      },
      "driver": {
        "name": "Jane Smith",
        "vehicle": {
          "name": "Toyota Camry",
          "model": "2020"
        }
      },
      "rating": 5,
      "comment": "Excellent service! Driver was very professional and the ride was smooth.",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### GET /reviews/my-reviews

Get reviews created by the authenticated rider.

**Authentication:** Required (RIDER)

**Query Parameters:**

- `page`: Page number (optional, default: 1)
- `limit`: Items per page (optional, default: 10, max: 50)

**Business Rules:**

- Only returns reviews created by the authenticated rider
- Includes driver information for each review
- Supports pagination for large result sets

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rider reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "_id": "review_id",
        "ride": "ride_id",
        "driver": {
          "name": "Jane Smith",
          "vehicle": {
            "name": "Toyota Camry",
            "model": "2020"
          }
        },
        "rating": 5,
        "comment": "Great driver, very safe driving!",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### GET /reviews/driver/:driverId/stats

Get review statistics for a specific driver.

**Authentication:** Not required (Public access)

**URL Parameters:**

- `driverId` - Driver ObjectId

**Business Rules:**

- Returns aggregated statistics for the driver's reviews
- Includes average rating, total reviews, and rating distribution
- Used for driver profile pages and search results

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver review stats retrieved successfully",
  "data": {
    "driverId": "driver_id",
    "totalReviews": 42,
    "averageRating": 4.7,
    "ratingDistribution": {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 15,
      "5": 24
    },
    "recentReviews": [
      {
        "riderName": "John Doe",
        "rating": 5,
        "comment": "Excellent service!",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### GET /reviews/driver/:driverId

Get all reviews for a specific driver with pagination.

**Authentication:** Not required (Public access)

**URL Parameters:**

- `driverId` - Driver ObjectId

**Query Parameters:**

- `page`: Page number (optional, default: 1)
- `limit`: Items per page (optional, default: 10, max: 50)

**Business Rules:**

- Returns all reviews for the specified driver
- Includes rider information (anonymized for privacy)
- Sorted by creation date (newest first)
- Supports pagination

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver reviews retrieved successfully",
  "data": {
    "driverId": "driver_id",
    "reviews": [
      {
        "_id": "review_id",
        "ride": "ride_id",
        "rider": {
          "name": "Anonymous Rider"
        },
        "rating": 5,
        "comment": "Very professional driver, highly recommended!",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "pages": 5
    }
  }
}
```

### POST /reviews

Create a new review for a completed ride.

**Authentication:** Required (RIDER)

**Request Body:**

```json
{
  "ride": "ride_object_id",
  "rating": 5,
  "comment": "Excellent service! Driver was very professional."
}
```

**Validation:**

- `ride`: Valid ObjectId of a completed ride (required)
- `rating`: Integer between 1-5 (required)
- `comment`: String up to 500 characters (optional)

**Business Rules:**

- Only the rider who requested the ride can create a review
- Ride must be in "completed" status
- Rider can only review each ride once
- Reviews are created immediately after ride completion
- Driver ratings are updated in real-time

**Response:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Review created successfully",
  "data": {
    "_id": "review_id",
    "ride": "ride_id",
    "rider": "rider_id",
    "driver": "driver_id",
    "rating": 5,
    "comment": "Excellent service! Driver was very professional.",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### GET /reviews/:id

Get a specific review by ID.

**Authentication:** Required (RIDER, DRIVER, admin, super_admin)

**URL Parameters:**

- `id` - Review ObjectId

**Authorization Rules:**

- **Rider:** Can only access their own reviews
- **Driver:** Can only access reviews for their rides
- **Admin/Super Admin:** Can access any review

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review retrieved successfully",
  "data": {
    "_id": "review_id",
    "ride": "ride_id",
    "rider": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "driver": {
      "name": "Jane Smith",
      "vehicle": {
        "name": "Toyota Camry",
        "model": "2020"
      }
    },
    "rating": 5,
    "comment": "Excellent service!",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### PATCH /reviews/:id

Update an existing review.

**Authentication:** Required (RIDER)

**URL Parameters:**

- `id` - Review ObjectId

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Updated review comment"
}
```

**Validation:**

- `rating`: Integer between 1-5 (optional)
- `comment`: String up to 500 characters (optional)

**Business Rules:**

- Only the rider who created the review can update it
- Reviews can only be updated within 24 hours of creation
- At least one field (rating or comment) must be provided
- Driver ratings are recalculated after update

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review updated successfully",
  "data": {
    "_id": "review_id",
    "rating": 4,
    "comment": "Updated review comment",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### DELETE /reviews/:id

Delete a review.

**Authentication:** Required (RIDER, admin, super_admin)

**URL Parameters:**

- `id` - Review ObjectId

**Authorization Rules:**

- **Rider:** Can only delete their own reviews
- **Admin/Super Admin:** Can delete any review

**Business Rules:**

- Reviews can only be deleted within 24 hours of creation (by rider)
- Admins can delete reviews at any time
- Driver ratings are recalculated after deletion
- Deletion is permanent and cannot be undone

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review deleted successfully",
  "data": null
}
```

### Review Data Model

**Review Schema:**

```json
{
  "_id": "ObjectId",
  "ride": "ObjectId", // Reference to Ride
  "rider": "ObjectId", // Reference to User (rider)
  "driver": "ObjectId", // Reference to Driver
  "rating": "number", // 1-5 star rating
  "comment": "string", // Optional review text (max 500 chars)
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Business Rules

1. **Review Creation:**
   - Reviews can only be created for completed rides
   - One review per ride per rider
   - Reviews must be created within 24 hours of ride completion
   - Rating is required, comment is optional

2. **Review Updates:**
   - Only the original rider can update their review
   - Updates allowed within 24 hours of creation
   - Driver ratings are recalculated after updates

3. **Review Deletion:**
   - Riders can delete their own reviews within 24 hours
   - Admins can delete any review at any time
   - Driver ratings are updated after deletion

4. **Rating Calculations:**
   - Driver average rating is recalculated after each review change
   - Rating distribution is maintained for analytics
   - Featured reviews only include 5-star ratings

5. **Privacy & Security:**
   - Rider information is anonymized in public driver reviews
   - Reviews are validated for authenticity
   - Rate limiting prevents spam reviews

---

## Common Driver Errors

### Driver Registration Errors

**Already Registered (400)**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "You already have a pending request"
}
```

**User Not Driver (400)**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "User is not registered as a driver"
}
```

**Driver Must Be Approved (400)**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Driver must be approved to update availability"
}
```

**Driver Not Found (404)**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Driver not found"
}
```

---

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error",
  "errorSources": [
    {
      "path": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "statusCode": 401,
  "message": "You are not authorized"
}
```

### Forbidden (403)

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Forbidden access"
}
```

### Not Found (404)

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Driver Availability

Drivers have availability status that can be updated using the `/drivers/availability` endpoint:

- `online` - Available to accept rides and show interest in ride requests
- `offline` - Not available for rides, cannot show interest in new rides

**Availability Management:**

- Drivers can toggle their availability between online/offline
- Only approved drivers can update availability
- When a driver is approved by admin, they are automatically set to `online`
- When a driver is rejected by admin, they are automatically set to `offline`
- Offline drivers cannot show interest in new ride requests

---

## Driver Data Model

**Driver Schema:**

```json
{
  "_id": "ObjectId",
  "user": "ObjectId", // Reference to User
  "availability": "online|offline",
  "driverStatus": "pending|approved|rejected",
  "vehicle": {
    "name": "string", // Vehicle name (e.g., "Toyota Camry")
    "model": "string" // Vehicle model year (e.g., "2020")
  },
  "experience": "number", // Years of driving experience
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Driver Status Options:**

- `pending` - Driver registration is pending admin review (default)
- `approved` - Driver has been approved and can accept rides
- `rejected` - Driver registration has been rejected

**Availability Options:**

- `online` - Driver is available to accept rides and show interest in ride requests
- `offline` - Driver is not available for rides (default)

**Vehicle Information:**

- `name` - The make and model of the vehicle (required)
- `model` - The year or specific model variant (required)

---

## Business Rules

1. **User Registration:** Users register as USER by default
2. **Guide Registration:**
   - Only USER can apply to become GUIDE
   - Users cannot have multiple guide registrations
   - New guide registrations start with `pending` status and `offline` availability
3. **Guide Approval:**
   - Admin must approve guide applications
   - When approved: status becomes `approved`, availability becomes `online`, user role becomes `GUIDE`
   - When rejected: status becomes `rejected`, availability becomes `offline`
4. **Driver Availability:**
   - Only approved drivers can update their availability
   - Drivers can toggle between `online` and `offline` status
   - Only online drivers can show interest in rides
5. **New Ride Booking Flow:**
   - Step 1: Rider requests ride (status: "requested")
   - Step 2: Drivers show interest using `/rides/interested/:id`
   - Step 3: Rider views interested drivers and accepts one using `/rides/accept/:id`
   - Step 4: Accepted driver is assigned, status changes to "accepted"
   - Step 5: Driver is automatically removed from all other rides they showed interest in
6. **Driver Interest Rules:**
   - Drivers can only show interest in rides with "requested" status
   - Drivers must be online (available) to show interest in rides
   - Drivers cannot show interest if already on another ride
   - Drivers cannot show duplicate interest in the same ride
7. **Driver Selection Rules:**
   - Riders can only accept drivers who showed interest
   - Driver must be approved, online, and available when accepted
   - Only one driver can be accepted per ride
8. **Automatic Cleanup:** When a driver is accepted, they're removed from interested drivers list of all other rides
9. **Cancellation:** Only riders can cancel rides (within 30 minutes and before driver assignment)
10. **Account Management:** Admins can block/unblock accounts
11. **Role Hierarchy:** SUPER_ADMIN > ADMIN > GUIDE/USER

---

## Review Endpoints

Base path: /reviews

### POST /reviews
Create a review for a completed ride (USER only).

Authentication: Required (USER)

Request Body:

```json
{
  "ride": "ride_object_id",
  "rating": 5,
  "comment": "Great ride! Very professional."
}
```

Validation:
- ride: required string (ride ID)
- rating: integer between 1 and 5
- comment: optional string, max 500 chars

Business Rules:
- Only the rider who owns the ride can review it
- Ride must be in status completed
- Ride must have an assigned driver
- Only one review per ride

Response:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Review created successfully",
  "data": {
    "_id": "review_id",
    "rider": { "name": "John Doe", "email": "john@example.com" },
    "driver": {
      "_id": "driver_id",
      "user": { "name": "Jane Smith", "email": "jane@example.com" },
      "vehicle": { "name": "Toyota Camry", "model": "2020" }
    },
    "ride": "ride_object_id",
    "rating": 5,
    "comment": "Great ride! Very professional.",
    "createdAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

### GET /reviews/featured
Get recent featured five-star reviews (Public access).

Authentication: Not required

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Featured reviews retrieved successfully",
  "data": [
    {
      "_id": "review_id",
      "rating": 5,
      "comment": "Fantastic ride!",
      "createdAt": "2024-01-15T12:00:00Z",
      "rider": { "name": "John Doe" },
      "driver": {
        "_id": "driver_id",
        "user": { "name": "Jane Smith" },
        "vehicle": { "name": "Toyota Camry", "model": "2020" }
      }
    }
  ]
}
```

### GET /reviews/driver/:driverId
List reviews for a specific driver with pagination (Public access).

Authentication: Not required

Query Parameters:
- page: optional, default 1
- limit: optional, default 10

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver reviews retrieved successfully",
  "data": [
    {
      "_id": "review_id",
      "rider": { "name": "John Doe", "email": "john@example.com" },
      "ride": {
        "_id": "ride_id",
        "pickupLocation": { "lat": "40.7128", "lng": "-74.0060" },
        "destination": { "lat": "40.7589", "lng": "-73.9851" },
        "createdAt": "2024-01-15T10:00:00Z"
      },
      "rating": 4,
      "comment": "Smooth and safe ride.",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 25, "totalPage": 3 }
}
```

### GET /reviews/driver/:driverId/stats
Get aggregated review statistics for a driver (Public access).

Authentication: Not required

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver review statistics retrieved successfully",
  "data": {
    "averageRating": 4.7,
    "totalReviews": 53,
    "ratingDistribution": { "5": 40, "4": 10, "3": 2, "2": 1, "1": 0 }
  }
}
```

### GET /reviews/my-reviews
Get reviews created by the authenticated USER (paginated).

Authentication: Required (rider)

Query Parameters:
- page: optional, default 1
- limit: optional, default 10

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Your reviews retrieved successfully",
  "data": [
    {
      "_id": "review_id",
      "driver": {
        "_id": "driver_id",
        "user": { "name": "Jane Smith", "email": "jane@example.com" },
        "vehicle": { "name": "Toyota Camry", "model": "2020" }
      },
      "ride": {
        "_id": "ride_id",
        "pickupLocation": { "lat": "40.7128", "lng": "-74.0060" },
        "destination": { "lat": "40.7589", "lng": "-73.9851" },
        "createdAt": "2024-01-15T10:00:00Z"
      },
      "rating": 5,
      "comment": "Great ride!",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 7, "totalPage": 1 }
}
```

### GET /reviews/:id
Get a specific review by ID.

Authentication: Required (rider, driver, admin, super_admin)

Authorization rules:
- USER: can view their own reviews
- GUIDE: can view reviews where they are the reviewed guide
- ADMIN/SUPER_ADMIN: can view any review

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review retrieved successfully",
  "data": {
    "_id": "review_id",
    "rider": { "name": "John Doe", "email": "john@example.com" },
    "driver": {
      "_id": "driver_id",
      "user": { "name": "Jane Smith", "email": "jane@example.com" },
      "vehicle": { "name": "Toyota Camry", "model": "2020" }
    },
    "ride": "ride_object_id",
    "rating": 5,
    "comment": "Excellent.",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

### PATCH /reviews/:id
Update a review (Rider only; can only update own reviews).

Authentication: Required (rider)

Request Body:

```json
{
  "rating": 4,
  "comment": "Updating feedback after another ride."
}
```

Validation:
- rating: optional integer between 1 and 5
- comment: optional string, max 500 chars

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review updated successfully",
  "data": {
    "_id": "review_id",
    "rating": 4,
    "comment": "Updating feedback after another ride.",
    "updatedAt": "2024-01-16T08:00:00Z"
  }
}
```

### DELETE /reviews/:id
Delete a review.

Authentication: Required (rider, admin, super_admin)

Authorization rules:
- USER: can delete only their own review
- ADMIN/SUPER_ADMIN: can delete any review

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review deleted successfully",
  "data": null
}
```

---

## Admin Ride Oversight Endpoints

Base path: /rides/admin

### GET /rides/admin/overview
Get comprehensive rides overview with filtering, sorting, and pagination (Admin only).

Authentication: Required (admin, super_admin)

Query Parameters:
- status: optional, filter by ride status (requested|accepted|in_transit|completed|cancelled)
- driverId: optional, filter by specific driver ObjectId
- riderId: optional, filter by specific rider ObjectId
- startDate: optional, filter rides created after this date (ISO string)
- endDate: optional, filter rides created before this date (ISO string)
- page: optional, page number (default: 1)
- limit: optional, items per page (default: 10)
- sortBy: optional, sort field (createdAt|updatedAt|status|price, default: createdAt)
- sortOrder: optional, sort order (asc|desc, default: desc)

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rides overview retrieved successfully",
  "data": {
    "rides": [
      {
        "_id": "ride_id",
        "status": "completed",
        "rider": {
          "_id": "rider_id",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890",
          "accountStatus": "active"
        },
        "driver": {
          "_id": "driver_id",
          "user": {
            "name": "Jane Smith",
            "email": "jane@example.com",
            "phone": "+0987654321",
            "accountStatus": "active"
          },
          "vehicle": { "name": "Toyota Camry", "model": "2020" },
          "experience": 5,
          "availability": "online",
          "driverStatus": "approved"
        },
        "pickupLocation": { "lat": "40.7128", "lng": "-74.0060" },
        "destination": { "lat": "40.7589", "lng": "-73.9851" },
        "price": 25.50,
        "pickupTime": "2024-01-15T10:00:00Z",
        "dropoffTime": "2024-01-15T10:30:00Z",
        "adminNotes": [
          {
            "note": "Manually reviewed by admin",
            "createdBy": { "name": "Admin User", "email": "admin@gojourny.com" },
            "createdAt": "2024-01-15T11:00:00Z"
          }
        ],
        "statusHistory": [
          {
            "status": "completed",
            "changedBy": { "name": "John Doe", "email": "john@example.com" },
            "changedAt": "2024-01-15T10:30:00Z",
            "reason": "Ride completed successfully"
          }
        ],
        "createdAt": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
}
```

### GET /analytics/admin/analytics
Get comprehensive ride analytics and insights (Admin only).

Authentication: Required (admin, super_admin)

Query Parameters:
- startDate: optional, analyze data from this date (ISO string)
- endDate: optional, analyze data until this date (ISO string)
- period: optional, grouping period (daily|weekly|monthly|yearly, default: monthly)

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride analytics retrieved successfully",
  "data": {
    "statusDistribution": [
      { "_id": "completed", "count": 120 },
      { "_id": "cancelled", "count": 15 },
      { "_id": "requested", "count": 8 },
      { "_id": "accepted", "count": 5 },
      { "_id": "in_transit", "count": 2 }
    ],
    "revenueAnalytics": {
      "totalRevenue": 3250.75,
      "totalRides": 120,
      "averageRidePrice": 27.09
    },
    "trendData": [
      {
        "_id": { "year": 2024, "month": 1 },
        "totalRides": 150,
        "completedRides": 120,
        "cancelledRides": 15,
        "totalRevenue": 3250.75
      }
    ],
    "topDrivers": [
      {
        "_id": "driver_id",
        "totalRides": 25,
        "completedRides": 24,
        "totalEarnings": 650.00,
        "completionRate": 96.0,
        "driverName": "Jane Smith",
        "driverEmail": "jane@example.com"
      }
    ]
  }
}
```

### GET /rides/admin/active
Get all currently active rides (requested, accepted, in_transit) (Admin only).

Authentication: Required (admin, super_admin)

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Active rides retrieved successfully",
  "data": [
    {
      "_id": "ride_id",
      "status": "in_transit",
      "rider": { "name": "John Doe", "email": "john@example.com", "phone": "+1234567890" },
      "driver": {
        "user": { "name": "Jane Smith", "email": "jane@example.com", "phone": "+0987654321" },
        "vehicle": { "name": "Toyota Camry", "model": "2020" },
        "experience": 5,
        "availability": "online"
      },
      "pickupLocation": { "lat": "40.7128", "lng": "-74.0060" },
      "destination": { "lat": "40.7589", "lng": "-73.9851" },
      "price": 25.50,
      "pickupTime": "2024-01-15T10:00:00Z",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ]
}
```

### GET /rides/admin/issues
Get rides with potential issues for admin review (Admin only).

Authentication: Required (admin, super_admin)

Query Parameters:
- issueType: optional, filter by issue type (cancelled|long_duration|no_driver|disputed)
- page: optional, page number (default: 1)
- limit: optional, items per page (default: 10)

Issue Types:
- cancelled: rides that were cancelled
- long_duration: rides in requested status for >30 minutes
- no_driver: rides with no interested drivers after 15 minutes
- disputed: rides with multiple admin notes (≥3)

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride issues retrieved successfully",
  "data": {
    "issues": [
      {
        "_id": "ride_id",
        "status": "requested",
        "rider": { "name": "John Doe", "email": "john@example.com", "phone": "+1234567890" },
        "driver": null,
        "interestedDrivers": [],
        "pickupLocation": { "lat": "40.7128", "lng": "-74.0060" },
        "destination": { "lat": "40.7589", "lng": "-73.9851" },
        "price": 25.50,
        "createdAt": "2024-01-15T08:30:00Z",
        "adminNotes": [
          {
            "note": "No drivers available in area",
            "createdBy": { "name": "Admin User", "email": "admin@gojourny.com" },
            "createdAt": "2024-01-15T09:00:00Z"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### GET /rides/admin/driver/:driverId/history
Get comprehensive ride history for a specific driver (Admin only).

Authentication: Required (admin, super_admin)

URL Parameters:
- driverId: Driver ObjectId

Query Parameters:
- page: optional, page number (default: 1)
- limit: optional, items per page (default: 10)
- status: optional, filter by ride status

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver ride history retrieved successfully",
  "data": {
    "rides": [
      {
        "_id": "ride_id",
        "status": "completed",
        "rider": { "name": "John Doe", "email": "john@example.com", "phone": "+1234567890" },
        "pickupLocation": { "lat": "40.7128", "lng": "-74.0060" },
        "destination": { "lat": "40.7589", "lng": "-73.9851" },
        "price": 25.50,
        "pickupTime": "2024-01-15T10:00:00Z",
        "dropoffTime": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-15T09:00:00Z"
      }
    ],
    "stats": {
      "totalRides": 45,
      "completedRides": 42,
      "cancelledRides": 2,
      "totalEarnings": 1150.25
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

### PATCH /rides/admin/:id/status
Override ride status with admin intervention (Admin only).

Authentication: Required (admin, super_admin)

URL Parameters:
- id: Ride ObjectId

Request Body:

```json
{
  "status": "completed",
  "reason": "Manual completion due to payment issue resolution"
}
```

Validation:
- status: required, must be valid RideStatusEnum
- reason: required, 1-500 characters explaining the intervention

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride status updated successfully",
  "data": {
    "_id": "ride_id",
    "status": "completed",
    "rider": { "name": "John Doe", "email": "john@example.com" },
    "driver": {
      "user": { "name": "Jane Smith", "email": "jane@example.com" },
      "vehicle": { "name": "Toyota Camry", "model": "2020" },
      "experience": 5
    },
    "pickupLocation": { "lat": "40.7128", "lng": "-74.0060" },
    "destination": { "lat": "40.7589", "lng": "-73.9851" },
    "price": 25.50,
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### PATCH /rides/admin/:id/assign-driver
Manually assign driver to ride (Admin only).

Authentication: Required (admin, super_admin)

URL Parameters:
- id: Ride ObjectId

Request Body:

```json
{
  "driverId": "driver_object_id",
  "reason": "Assigned due to system malfunction in driver matching"
}
```

Validation:
- driverId: required, valid ObjectId of approved driver
- reason: required, 1-500 characters explaining the manual assignment

Business Rules:
- Driver must be approved and have active account status
- Driver cannot be assigned to another active ride
- Ride status will be automatically changed to 'accepted'
- pickupTime will be set to current timestamp

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver assigned successfully",
  "data": {
    "_id": "ride_id",
    "status": "accepted",
    "rider": { "name": "John Doe", "email": "john@example.com" },
    "driver": {
      "user": { "name": "Jane Smith", "email": "jane@example.com" },
      "vehicle": { "name": "Toyota Camry", "model": "2020" },
      "experience": 5
    },
    "pickupTime": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### PATCH /rides/admin/:id/note
Add internal admin note to ride (Admin only).

Authentication: Required (admin, super_admin)

URL Parameters:
- id: Ride ObjectId

Request Body:

```json
{
  "note": "Customer called regarding pickup location clarification. Issue resolved."
}
```

Validation:
- note: required, 1-1000 characters

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admin note added successfully",
  "data": {
    "_id": "ride_id",
    "status": "accepted",
    "rider": { "name": "John Doe", "email": "john@example.com" },
    "driver": {
      "user": { "name": "Jane Smith", "email": "jane@example.com" },
      "vehicle": { "name": "Toyota Camry", "model": "2020" },
      "experience": 5
    },
    "adminNotes": [
      {
        "note": "Customer called regarding pickup location clarification. Issue resolved.",
        "createdBy": { "name": "Admin User", "email": "admin@gojourny.com" },
        "createdAt": "2024-01-15T11:30:00Z"
      }
    ],
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

### DELETE /rides/admin/:id/force-delete
Permanently delete ride with audit logging (Admin only).

Authentication: Required (admin, super_admin)

URL Parameters:
- id: Ride ObjectId

Request Body:

```json
{
  "reason": "Data privacy request - customer account deletion"
}
```

Validation:
- reason: required, 1-500 characters explaining why permanent deletion is necessary

Warning: This operation is irreversible and should be used with extreme caution.

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride permanently deleted",
  "data": {
    "message": "Ride permanently deleted",
    "deletedRide": {
      "id": "ride_id",
      "status": "completed",
      "rider": "rider_id",
      "driver": "driver_id",
      "deletedBy": "admin_user_id",
      "deletedAt": "2024-01-15T12:00:00Z",
      "reason": "Data privacy request - customer account deletion"
    }
  }
}
```

## Admin Ride Management Business Rules

1. **Admin Access Control:**
   - All admin ride endpoints require admin or super_admin role
   - All operations are logged with admin user information
   - Status changes and assignments include audit trails

2. **Status Override Rules:**
   - Admins can change any ride status to any valid status
   - Reason is required for all status changes
   - Status history is maintained for audit purposes

3. **Driver Assignment Rules:**
   - Only approved, active drivers can be manually assigned
   - Driver cannot be assigned to multiple active rides
   - Assignment automatically changes ride status to 'accepted'

4. **Issue Detection:**
   - Long duration: rides in requested status >30 minutes
   - No driver: no interested drivers after 15 minutes
   - Disputed: rides with ≥3 admin notes
   - Cancelled: all cancelled rides for review

5. **Analytics Aggregation:**
   - Revenue calculations only include completed rides
   - Trend data grouped by configurable time periods
   - Driver performance includes completion rates

6. **Force Deletion:**
   - Irreversible operation requiring strong justification
   - All deletions logged to console for audit trails
   - Should only be used for legal/privacy compliance

---

## Location & Real-time Tracking APIs

### Overview

The location APIs provide real-time tracking, route optimization, geocoding services, and WebSocket integration for live ride updates. All location data uses Mapbox APIs for accurate mapping and routing.

### Authentication

Location endpoints require authentication. Driver location updates require driver role, while other endpoints accept rider, driver, admin, and super_admin roles.

### Rate Limits

- Location updates: 30 per minute
- Geocoding requests: 10 per minute
- Places search: 20 per minute

---

### POST /location/drivers/location

Update driver location in real-time.

**Authentication:** Required (driver only)
**Rate Limit:** 30 updates per minute

**Request Body:**
```json
{
  "lat": 23.8103,
  "lng": 90.4125,
  "accuracy": 10.5,
  "heading": 45.0,
  "speed": 15.2
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Location updated successfully",
  "data": {
    "driverId": "driver_id",
    "location": {
      "lat": 23.8103,
      "lng": 90.4125,
      "accuracy": 10.5,
      "heading": 45.0,
      "speed": 15.2,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "broadcasted": true
  }
}
```

---

### GET /location/drivers/location/:driverId

Get current driver location.

**Authentication:** Required (RIDER, DRIVER, admin, super_admin)
**Query Parameters:**
- `rideId` (optional): Required for rider access

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver location retrieved successfully",
  "data": {
    "driverId": "driver_id",
    "location": {
      "lat": 23.8103,
      "lng": 90.4125,
      "accuracy": 10.5,
      "heading": 45.0,
      "speed": 15.2,
      "timestamp": "2024-01-15T10:30:00Z",
      "address": "Dhaka, Bangladesh"
    },
    "isOnline": true,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET /location/rides/:rideId/location-history

Get ride location history for replay functionality.

**Authentication:** Required (RIDER, DRIVER, admin, super_admin)
**Query Parameters:**
- `startTime` (optional): ISO date string, default: 24 hours ago
- `endTime` (optional): ISO date string, default: now
- `limit` (optional): Number, default: 100, max: 1000

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Location history retrieved successfully",
  "data": {
    "rideId": "ride_id",
    "driverId": "driver_id",
    "locations": [
      {
        "lat": 23.8103,
        "lng": 90.4125,
        "timestamp": "2024-01-15T10:30:00Z",
        "speed": 15.2,
        "heading": 45.0
      }
    ],
    "total": 150,
    "timeRange": {
      "start": "2024-01-15T09:00:00Z",
      "end": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### POST /location/rides/:rideId/route

Calculate optimal route for a ride.

**Authentication:** Required (RIDER, DRIVER, admin, super_admin)

**Request Body:**
```json
{
  "profile": "driving-traffic",
  "alternatives": false,
  "steps": true
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Route calculated successfully",
  "data": {
    "rideId": "ride_id",
    "route": {
      "geometry": {
        "type": "LineString",
        "coordinates": [[90.4125, 23.8103], [90.3753, 23.7515]]
      },
      "duration": 1800,
      "distance": 8500,
      "instructions": [
        {
          "text": "Head southeast on Road 1",
          "distance": 1200,
          "duration": 180,
          "type": "turn"
        }
      ]
    },
    "waypoints": [
      { "lat": 23.8103, "lng": 90.4125, "name": "Pickup Location" },
      { "lat": 23.7515, "lng": 90.3753, "name": "Destination" }
    ]
  }
}
```

---

### GET /location/rides/:rideId/route

Get stored route for a ride.

**Authentication:** Required (RIDER, DRIVER, admin, super_admin)

---

### POST /location/rides/:rideId/eta

Calculate estimated time of arrival.

**Authentication:** Required (RIDER, DRIVER, admin, super_admin)

**Request Body:**
```json
{
  "currentLocation": {
    "lat": 23.8000,
    "lng": 90.4000
  }
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "ETA calculated successfully",
  "data": {
    "rideId": "ride_id",
    "eta": "2024-01-15T11:15:00Z",
    "duration": 2700,
    "distance": 5200,
    "trafficDelay": 600,
    "route": {
      "geometry": {
        "type": "LineString",
        "coordinates": [[90.4000, 23.8000], [90.3753, 23.7515]]
      },
      "duration": 2700,
      "distance": 5200
    }
  }
}
```

---

### GET /location/geocode

Forward geocoding - convert address to coordinates.

**Authentication:** Required (all roles)
**Rate Limit:** 10 requests per minute
**Query Parameters:**
- `query`: Search term (required)
- `limit`: Number of results (optional, default: 5, max: 10)
- `country`: Country code filter (optional)
- `bbox`: Bounding box for search area (optional)

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Geocoding results retrieved successfully",
  "data": {
    "query": "dhaka university",
    "results": [
      {
        "placeName": "University of Dhaka, Dhaka, Bangladesh",
        "coordinates": {
          "lat": 23.7337,
          "lng": 90.3929
        },
        "address": {
          "street": "Nilkhet Road",
          "city": "Dhaka",
          "country": "Bangladesh",
          "postcode": "1000"
        },
        "relevance": 0.95
      }
    ]
  }
}
```

---

### GET /location/reverse-geocode

Reverse geocoding - convert coordinates to address.

**Authentication:** Required (all roles)
**Rate Limit:** 10 requests per minute
**Query Parameters:**
- `lat`: Latitude (required)
- `lng`: Longitude (required)

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Address retrieved successfully",
  "data": {
    "coordinates": {
      "lat": 23.8103,
      "lng": 90.4125
    },
    "address": {
      "placeName": "Motijheel, Dhaka, Bangladesh",
      "street": "Dilkusha Commercial Area",
      "city": "Dhaka",
      "district": "Dhaka",
      "country": "Bangladesh",
      "postcode": "1222"
    }
  }
}
```

---

### GET /location/places

Search for points of interest nearby.

**Authentication:** Required (all roles)
**Rate Limit:** 20 requests per minute
**Query Parameters:**
- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `type`: POI type (gas_station, restaurant, hospital, pharmacy, atm, bank, hotel, parking)
- `radius`: Search radius in meters (optional, default: 1000, max: 5000)
- `limit`: Number of results (optional, default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Places retrieved successfully",
  "data": {
    "center": {
      "lat": 23.8103,
      "lng": 90.4125
    },
    "places": [
      {
        "id": "poi_123",
        "name": "Shell Gas Station",
        "type": "gas_station",
        "coordinates": {
          "lat": 23.8150,
          "lng": 90.4100
        },
        "address": "123 Motijheel Road, Dhaka",
        "distance": 550,
        "rating": 4.2
      }
    ]
  }
}
```

---

### WebSocket Integration

**Connection URL:** `ws://your-server-url/socket.io`

**Authentication:** Include JWT token in handshake
```javascript
const socket = io('http://localhost:8000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});
```

**Client Events:**
- `join-ride` - Join ride-specific room
- `track-driver` - Track specific driver location updates

**Server Events:**
- `driver-location-update` - Real-time driver location updates
- `ride-status-update` - Ride status changes
- `eta-update` - Estimated time of arrival updates
- `error` - Error notifications

**Example Usage:**
```javascript
// Join ride room
socket.emit('join-ride', { rideId: 'ride_id' });

// Receive location updates
socket.on('driver-location-update', (data) => {
  console.log('Driver location:', data.location);
  updateMapMarker(data.location);
});
```

---

## Rider Analytics Endpoints

### Overview

The Rider Analytics API provides comprehensive insights into rider behavior, spending patterns, and ride history. These endpoints help riders track their usage, analyze spending trends, and view their interaction with the platform.

### Authentication

All rider analytics endpoints require authentication with USER role.

---

### GET /analytics/rider-analytics

Get comprehensive analytics for the authenticated rider.

**Authentication:** Required (RIDER)

**Query Parameters:**
- `startDate` (optional): ISO date string for filtering data from this date
- `endDate` (optional): ISO date string for filtering data until this date
- `period` (optional): Grouping period for trends (daily|weekly|monthly|yearly, default: monthly)

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rider analytics retrieved successfully",
  "data": {
    "overview": {
      "totalRides": 45,
      "completedRides": 42,
      "cancelledRides": 3,
      "totalSpent": 1250.75,
      "averageRideCost": 29.78,
      "completionRate": 93.33
    },
    "spendingTrends": [
      {
        "_id": { "year": 2024, "month": 1 },
        "totalSpent": 1250.75,
        "rideCount": 45,
        "averageCost": 27.79
      }
    ],
    "favoriteLocations": {
      "pickupLocations": [
        {
          "location": { "lat": "40.7128", "lng": "-74.0060" },
          "count": 12
        }
      ],
      "destinationLocations": [
        {
          "location": { "lat": "40.7589", "lng": "-73.9851" },
          "count": 8
        }
      ]
    },
    "driverRatings": {
      "averageRating": 4.7,
      "totalReviews": 42,
      "ratingDistribution": { "5": 30, "4": 8, "3": 3, "2": 1, "1": 0 },
      "recentReviews": [
        {
          "driverName": "Jane Smith",
          "rating": 5,
          "comment": "Excellent service!",
          "createdAt": "2024-01-15T12:00:00Z"
        }
      ]
    },
    "rideHistory": [
      {
        "_id": "ride_id",
        "status": "completed",
        "price": 25.50,
        "pickupLocation": { "lat": "40.7128", "lng": "-74.0060" },
        "destination": { "lat": "40.7589", "lng": "-73.9851" },
        "driverName": "Jane Smith",
        "createdAt": "2024-01-15T10:00:00Z",
        "completedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

**Business Rules:**
- Only returns data for rides requested by the authenticated user
- Spending calculations only include completed rides
- Favorite locations are determined by frequency of use
- Recent reviews are limited to the last 10 reviews
- Ride history is limited to the last 20 rides

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User does not have RIDER role

---

## Admin Analytics Endpoints

### GET /analytics/admin/overview

Get overview statistics for the admin dashboard.

**Authentication:** Required (admin, super_admin)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Overview stats retrieved successfully",
  "data": {
    "totalUsers": 1250,
    "totalDrivers": 85,
    "totalRides": 3200,
    "totalRevenue": 45678.50,
    "activeDrivers": 42,
    "completedRides": 2890,
    "pendingRides": 156,
    "cancelledRides": 154
  }
}
```

### GET /analytics/admin/drivers

Get driver analytics and statistics.

**Authentication:** Required (admin, super_admin)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver analytics retrieved successfully",
  "data": {
    "driversByStatus": {
      "pending": 12,
      "approved": 65,
      "rejected": 8
    },
    "driversByAvailability": {
      "online": 42,
      "offline": 43
    },
    "topDriversByRides": [
      {
        "driverId": "driver_id_1",
        "driverName": "John Smith",
        "totalRides": 145,
        "earnings": 2890.50
      }
    ]
  }
}
```

### GET /analytics/admin/rides

Get ride analytics and statistics.

**Authentication:** Required (admin, super_admin)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ride analytics retrieved successfully",
  "data": {
    "ridesByStatus": {
      "requested": 45,
      "accepted": 23,
      "in_transit": 12,
      "completed": 2890,
      "cancelled": 154
    },
    "ridesByTimeOfDay": [
      { "hour": 0, "count": 5 },
      { "hour": 1, "count": 2 }
    ],
    "averageRidePrice": 14.25,
    "totalDistance": 45678.5
  }
}
```

### GET /analytics/admin/revenue-trend

Get revenue trend data over time.

**Authentication:** Required (admin, super_admin)

**Query Parameters:**
- `period` (optional): 'daily' | 'weekly' | 'monthly' (default: 'daily')
- `days` (optional): number (default: 30)

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Revenue trend retrieved successfully",
  "data": {
    "daily": [
      { "date": "2024-01-01", "value": 1250.50 },
      { "date": "2024-01-02", "value": 1340.75 }
    ],
    "weekly": [
      { "date": "2024-01-01", "value": 8750.25 }
    ],
    "monthly": [
      { "date": "2024-01-01", "value": 36500.75 }
    ]
  }
}
```

---

## Driver Analytics Endpoints

### GET /analytics/driver-analytics

Get comprehensive analytics for the authenticated driver.

**Authentication:** Required (DRIVER)

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `period` (optional): 'daily' | 'weekly' | 'monthly' | 'yearly' (default: 'monthly')

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Driver analytics retrieved successfully",
  "data": {
    "overview": {
      "totalRides": 45,
      "completedRides": 42,
      "cancelledRides": 3,
      "totalEarnings": 750.00,
      "averageRideEarnings": 17.86,
      "completionRate": 93.33
    },
    "earningsTrends": [
      {
        "_id": { "year": 2024, "month": 1 },
        "totalEarnings": 750.00,
        "rideCount": 45,
        "averageEarnings": 16.67
      }
    ],
    "riderRatings": {
      "averageRating": 4.7,
      "totalReviews": 42,
      "ratingDistribution": { "5": 24, "4": 15, "3": 2, "2": 1, "1": 0 },
      "recentReviews": [
        {
          "riderName": "John Doe",
          "rating": 5,
          "comment": "Great driver, very professional!",
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ]
    },
    "rideHistory": [
      {
        "_id": "ride_id",
        "status": "completed",
        "price": 25.50,
        "pickupLocation": { "lat": "40.7128", "lng": "-74.0060" },
        "destination": { "lat": "40.7589", "lng": "-73.9851" },
        "riderName": "John Doe",
        "createdAt": "2024-01-15T09:00:00Z",
        "completedAt": "2024-01-15T09:45:00Z"
      }
    ]
  }
}
```

---

## Comprehensive Admin Analytics

### GET /analytics/admin/analytics

Get comprehensive ride analytics and insights (Admin only).

**Authentication:** Required (admin, super_admin)

**Query Parameters:**
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)
- `period`: 'daily' | 'weekly' | 'monthly' | 'yearly' (optional, default: 'monthly')

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Analytics retrieved successfully",
  "data": {
    "statusDistribution": [
      { "_id": "completed", "count": 150 }
    ],
    "revenueAnalytics": {
      "totalRevenue": 2500.50,
      "totalRides": 150,
      "averageRidePrice": 16.67
    },
    "trendData": [
      {
        "_id": { "year": 2024, "month": 1 },
        "totalRides": 45,
        "completedRides": 42,
        "cancelledRides": 3,
        "totalRevenue": 750.00
      }
    ],
    "topDrivers": [
      {
        "totalRides": 25,
        "completedRides": 24,
        "totalEarnings": 400.00,
        "completionRate": 96.0,
        "driverName": "Jane Smith",
        "driverEmail": "jane@example.com"
      }
    ]
  }
}
```

---

## Rate Limiting & Security

- CORS enabled for specified frontend domains
- HTTP-only cookies for token storage
- Request validation using Zod schemas
- Password hashing with Argon2
- Global error handling middleware
- Authentication middleware for protected routes

---

## Testing Scenarios & Common Use Cases

### Complete Ride Booking Flow

#### 1. User Registration & Authentication
```bash
# Register new user
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "address": "123 Main St, City, Country"
}

# Verify email with OTP
POST /api/v1/auth/otp/verify
{
  "email": "john@example.com",
  "otp": "123456"
}

# Login
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### 2. Driver Registration Flow
```bash
# Register as driver (after login)
PATCH /api/v1/drivers/register
{
  "vehicle": {
    "name": "Toyota Camry",
    "model": "2020"
  },
  "experience": 5
}

# Check driver status
GET /api/v1/drivers/profile
```

#### 3. Ride Request & Matching
```bash
# Request a ride
POST /api/v1/rides/request
{
  "pickupLocation": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "destination": {
    "lat": 40.7589,
    "lng": -73.9851
  },
  "price": 25.50
}

# Check ride status
GET /api/v1/rides
```

#### 4. Driver Interest & Acceptance
```bash
# Driver shows interest (as driver)
PATCH /api/v1/rides/interested/{rideId}

# Rider accepts driver
PATCH /api/v1/rides/accept/{rideId}
{
  "driverId": "driver_object_id"
}
```

#### 5. Payment Processing
```bash
# Initiate payment (after ride completion)
POST /api/v1/payment/init-payment/{rideId}

# Download invoice
GET /api/v1/payment/invoice/{paymentId}
```

### Admin Management Scenarios

#### Managing Drivers
```bash
# Get all drivers
GET /api/v1/drivers

# Approve driver registration
PATCH /api/v1/drivers/manage-registration/{driverId}
{
  "driverStatus": "approved"
}

# Update driver availability
PATCH /api/v1/drivers/availability
{
  "availability": "online"
}
```

#### System Analytics
```bash
# Get admin overview
GET /api/v1/analytics/admin/overview

# Get detailed analytics
GET /api/v1/analytics/admin/analytics?startDate=2024-01-01&endDate=2024-01-31

# Get revenue trends
GET /api/v1/analytics/admin/revenue-trend?period=monthly&days=90
```

### Location Services Usage

#### Real-time Tracking
```bash
# Update driver location
POST /api/v1/location/drivers/location
{
  "lat": 23.8103,
  "lng": 90.4125,
  "accuracy": 10.5,
  "heading": 45.0,
  "speed": 15.2
}

# Get driver location
GET /api/v1/location/drivers/location/{driverId}
```

#### Route Planning
```bash
# Calculate route
POST /api/v1/location/rides/{rideId}/route
{
  "profile": "driving-traffic",
  "alternatives": false,
  "steps": true
}

# Get ETA
POST /api/v1/location/rides/{rideId}/eta
{
  "currentLocation": {
    "lat": 23.8000,
    "lng": 90.4000
  }
}
```

### Review System

#### Creating Reviews
```bash
# Create review after ride completion
POST /api/v1/reviews
{
  "ride": "ride_object_id",
  "rating": 5,
  "comment": "Excellent service! Very professional driver."
}

# Get user's reviews
GET /api/v1/reviews/my-reviews
```

### Error Handling Examples

#### Authentication Errors
```json
// 401 Unauthorized
{
  "success": false,
  "statusCode": 401,
  "message": "You are not authorized"
}

// 403 Forbidden
{
  "success": false,
  "statusCode": 403,
  "message": "Forbidden access"
}
```

#### Validation Errors
```json
// 400 Bad Request
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error",
  "errorSources": [
    {
      "path": "email",
      "message": "Invalid email format"
    },
    {
      "path": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

#### Business Logic Errors
```json
// Ride already has driver
{
  "success": false,
  "statusCode": 400,
  "message": "Ride already has an assigned driver"
}

// Insufficient driver approval
{
  "success": false,
  "statusCode": 400,
  "message": "Driver must be approved to accept rides"
}
```

---

## API Development Guidelines

### Request/Response Patterns

1. **Consistent Response Format**: All endpoints return data in the standard format:
   ```json
   {
     "success": boolean,
     "statusCode": number,
     "message": string,
     "data": object | array | null
   }
   ```

2. **Error Handling**: Use appropriate HTTP status codes and provide descriptive error messages

3. **Authentication**: Include JWT tokens in cookies for authenticated requests

4. **Validation**: All input data is validated using Zod schemas

### Best Practices

1. **Rate Limiting**: Respect API rate limits to avoid being blocked
2. **Error Handling**: Always check response status and handle errors gracefully
3. **Authentication**: Keep tokens secure and refresh when needed
4. **Data Validation**: Validate all input data before sending requests
5. **WebSocket Usage**: Use WebSockets for real-time features like location tracking

### Development Environment

- **Base URL**: `http://localhost:8000/api/v1` (development)
- **WebSocket URL**: `ws://localhost:8000`
- **SSLCommerz**: Use sandbox environment for testing
- **File Upload**: Use Cloudinary for image storage

---

## Rate Limiting & Security

- CORS enabled for specified frontend domains
- HTTP-only cookies for token storage
- Request validation using Zod schemas
- Password hashing with Argon2
- Global error handling middleware
- Authentication middleware for protected routes
