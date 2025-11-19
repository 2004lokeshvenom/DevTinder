# DevTinder Backend

A comprehensive backend API for DevTinder - a developer networking platform that helps developers connect, chat, and build professional relationships. This backend provides authentication, user management, connection requests, real-time chat, and premium membership features.

## 🚀 Features

- **User Authentication**: Secure signup, login, and logout with JWT tokens
- **User Profiles**: Create, view, and edit user profiles with photo uploads
- **Connection System**: Send interest requests, accept/reject connections
- **Real-time Chat**: Socket.io powered instant messaging between connected users
- **Premium Memberships**: Silver and Gold membership plans with Razorpay integration
- **Email Notifications**: AWS SES powered email notifications for connection requests
- **Scheduled Tasks**: Automated email reminders for pending connection requests
- **Feed System**: Discover new developers with pagination support

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt
- **Real-time Communication**: Socket.io
- **Payment Gateway**: Razorpay
- **Email Service**: AWS SES (Simple Email Service)
- **Task Scheduling**: node-cron
- **Validation**: validator.js

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/2004lokeshvenom/DevTinder.git
   cd DevTinder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   # Server Configuration
   PORT=3000

   # Database
   DB_SECRET_LINK=your_mongodb_connection_string

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key

   # Razorpay Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

   # AWS SES Configuration
   AWS_ACCESS_KEY=your_aws_access_key
   AWS_ACCESS_SECRET_KEY=your_aws_secret_access_key
   FROM_EMAIL=your_verified_ses_email@example.com

   # Application URL (for email links)
   APP_URL=http://localhost:5173
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

## 📚 API Endpoints

### Authentication Routes (`/`)

- `POST /signup` - Register a new user
  - Body: `{ firstName, lastName, email, password, age, gender, photoUrl, about }`
  
- `POST /login` - Login user
  - Body: `{ email, password }`
  - Returns: User data and sets HTTP-only cookie with JWT token

- `POST /logout` - Logout user
  - Clears authentication cookie

### Profile Routes (`/`)

- `GET /profile/view` - Get current user's profile (Protected)
- `PATCH /profile/edit` - Update user profile (Protected)
  - Body: `{ firstName, lastName, age, email, gender, photoUrl, about }`
- `PATCH /profile/password` - Change password (Protected)
  - Body: `{ currentPassword, newPassword }`

### User Routes (`/`)

- `GET /feed` - Get user feed with pagination (Protected)
  - Query params: `?page=1&limit=10`
- `GET /user/connections` - Get all accepted connections (Protected)
- `GET /user/requests` - Get pending connection requests (Protected)

### Connection Request Routes (`/`)

- `POST /request/send/:status/:toUserId` - Send connection request (Protected)
  - Params: `status` (interested/ignored), `toUserId` (MongoDB ObjectId)
- `POST /request/review/:status/:requestId` - Review connection request (Protected)
  - Params: `status` (accepted/rejected), `requestId` (MongoDB ObjectId)

### Chat Routes (`/`)

- `GET /chat/:targetUserId` - Get chat history with a user (Protected)
  - Returns: Messages array with sender details

### Payment Routes (`/payments`)

- `POST /payments/create` - Create Razorpay order (Protected)
  - Body: `{ plan: "silver" | "gold" }`
  - Returns: Order details with Razorpay key ID
  
- `POST /payments/webhook` - Razorpay webhook endpoint (Public)
  - Handles payment verification and updates user premium status
  
- `GET /ispremium/verify` - Check if user has premium membership (Protected)

## 🗄️ Database Models

### User Model
- `firstName`, `lastName`, `email`, `password` (hashed)
- `age`, `gender` (Male/male/Female/female)
- `photoUrl`, `about`
- `isPremium` (Boolean), `membershipType` (silver/gold)
- Methods: `getJWT()`, `validatePassword()`

### ConnectionRequest Model
- `fromUserId`, `toUserId` (references to User)
- `status` (ignored/rejected/interested/accepted)
- `createdAt`, `updatedAt` (timestamps)

### Chat Model
- `participants` (array of User references)
- `messages` (array of message objects)
  - `senderId`, `text`, `createdAt`, `updatedAt`

### Payment Model
- `userId`, `orderId`, `paymentId`, `status`
- `amount`, `receipt`, `notes` (firstName, lastName, email, membershipType)
- `createdAt`, `updatedAt` (timestamps)

## 🔐 Authentication

The API uses JWT-based authentication with HTTP-only cookies. Protected routes require the `userAuth` middleware which:
1. Extracts token from cookies
2. Verifies JWT signature
3. Fetches user from database
4. Attaches user object to `req.user`

## 💬 Real-time Chat

Socket.io is used for real-time messaging:
- **Events**:
  - `joinRoom` - Join a chat room between two users
  - `sendMessages` - Send a message
  - `receiveMessages` - Receive a message (emitted by server)

- **Room ID**: Generated using SHA-256 hash of sorted user IDs

## 💳 Payment Integration

The backend integrates with Razorpay for premium memberships:
- **Plans**: Silver (₹500) and Gold (₹700)
- **Webhook**: Handles payment verification automatically
- **Premium Status**: Automatically updated on successful payment

## 📧 Email Notifications

AWS SES is configured for sending emails:
- Connection request notifications
- Request review notifications
- Scheduled daily reminders for pending requests (runs at 2:48 AM)

## ⚙️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | Yes |
| `FRONTEND_URL` | Frontend application URL for CORS | Yes |
| `DB_SECRET_LINK` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | Yes (for payments) |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | Yes (for payments) |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret | Yes (for payments) |
| `AWS_ACCESS_KEY` | AWS access key ID | Yes (for emails) |
| `AWS_ACCESS_SECRET_KEY` | AWS secret access key | Yes (for emails) |
| `FROM_EMAIL` | Verified SES email address | Yes (for emails) |
| `APP_URL` | Application URL for email links | Yes |

## 🚀 Deployment

### Recommended Platforms
- **Backend**: Railway, Render, Heroku, AWS EC2, DigitalOcean
- **Database**: MongoDB Atlas (recommended for production)
- **Email**: AWS SES (already configured)

### Deployment Steps

1. **Set up MongoDB Atlas** (if not using local MongoDB)
   - Create a cluster
   - Get connection string
   - Update `DB_SECRET_LINK` in environment variables

2. **Configure AWS SES**
   - Verify sender email address
   - Update IAM credentials
   - Set `FROM_EMAIL` to verified address

3. **Set up Razorpay** (for payments)
   - Create Razorpay account
   - Get API keys and webhook secret
   - Configure webhook URL

4. **Deploy Application**
   - Set all environment variables in your hosting platform
   - Ensure `FRONTEND_URL` points to your frontend domain
   - Set `PORT` (most platforms auto-assign, check documentation)
   - Deploy and verify all endpoints

5. **Verify Deployment**
   - Test authentication endpoints
   - Verify database connection
   - Test Socket.io connection
   - Verify webhook endpoint (use Razorpay dashboard)

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (placeholder)

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- HTTP-only cookies for token storage
- Input validation using validator.js
- CORS configuration
- Webhook signature verification for Razorpay

## 📦 Dependencies

Key dependencies include:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `socket.io` - Real-time communication
- `razorpay` - Payment gateway
- `@aws-sdk/client-ses` - AWS SES client
- `node-cron` - Task scheduling
- `validator` - Input validation
- `cookie-parser` - Cookie parsing middleware
- `cors` - CORS middleware
- `dotenv` - Environment variable management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License

## 👤 Author

**Surisetti Lokesh Vanamayya**

## 🐛 Known Issues

- None currently reported

## 📞 Support

For support, please open an issue in the repository or contact me at lokeshvanamayya@gmail.com.

---

**Note**: Make sure to keep your `.env` file secure and never commit it to version control. Add `.env` to your `.gitignore` file.

---

**Made with ❤️ for the Developer Community**

