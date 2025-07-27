# VendorBridge Backend API

A Node.js backend API for VendorBridge - connecting street vendors with suppliers.

## Features

- User registration (vendors and suppliers)
- User authentication with JWT tokens
- Password hashing with bcrypt
- MongoDB database integration
- Input validation and error handling
- Role-based access control

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vendorbridge-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory and add the following:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/vendorbridge
   
   # JWT Secret Key (change this to a secure random string)
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   
   If using local MongoDB:
   ```bash
   mongod
   ```
   
   Or use MongoDB Atlas (cloud) by updating the `MONGODB_URI` in `.env`

5. **Run the application**
   
   Development mode (with nodemon):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes

#### 1. User Registration
- **POST** `/api/auth/signup`
- **Description**: Register a new user (vendor or supplier)
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "role": "vendor"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "role": "vendor",
        "isActive": true,
        "createdAt": "2023-01-01T00:00:00.000Z"
      },
      "token": "jwt_token_here"
    }
  }
  ```

#### 2. User Login
- **POST** `/api/auth/signin`
- **Description**: Authenticate user and get JWT token
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "role": "vendor",
        "isActive": true
      },
      "token": "jwt_token_here"
    }
  }
  ```

#### 3. Get User Profile
- **GET** `/api/auth/me`
- **Description**: Get current user profile (requires authentication)
- **Headers**: 
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "role": "vendor",
        "isActive": true
      }
    }
  }
  ```

### Health Check
- **GET** `/api/health`
- **Description**: Check if the API is running
- **Response**:
  ```json
  {
    "status": "OK",
    "message": "VendorBridge API is running",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
  ```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors array
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## Database Schema

### User Model
```javascript
{
  name: String (required, 2-50 characters),
  email: String (required, unique, valid email),
  phone: String (required, valid phone number),
  password: String (required, min 6 characters, hashed),
  role: String (required, enum: ['vendor', 'supplier']),
  isActive: Boolean (default: true),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with salt rounds of 12
- **JWT Authentication**: Secure token-based authentication with 7-day expiration
- **Input Validation**: All inputs are validated using express-validator
- **CORS Protection**: Configured to allow requests only from specified origins
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes

## Testing the API

You can test the API using tools like:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [curl](https://curl.se/)

### Example curl commands:

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "role": "vendor"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get user profile:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Project Structure

```
├── models/
│   └── User.js          # User database model
├── routes/
│   └── auth.js          # Authentication routes
├── middleware/
│   └── auth.js          # Authentication middleware
├── .env                 # Environment variables
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/vendorbridge` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
