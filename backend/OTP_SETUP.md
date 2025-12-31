# OTP Email Verification Setup

## Environment Variables Required

Add these to your `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (for authentication tokens)
JWT_SECRET=your-jwt-secret-key-make-it-very-long-and-complex

# Gmail Email Service (Primary)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Alternative Email Variables (Fallback)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional: SendGrid (if using SendGrid instead)
SENDGRID_FROM_EMAIL=your-email@gmail.com
SENDGRID_API_KEY=your-sendgrid-api-key
```

**Note:** 
- The code uses `GMAIL_USER` and `GMAIL_APP_PASSWORD` as primary variables
- Falls back to `EMAIL_USER` and `EMAIL_PASS` if primary not found
- App passwords with spaces are automatically cleaned

## Gmail App Password Setup

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification if not already enabled
4. Scroll down to "App passwords"
5. Select "Mail" as the app and "Other (Custom name)" as device
6. Enter "AcadMate" as the name
7. Click "Generate"
8. Copy the 16-character password (spaces will be automatically removed by the code)
9. Add it to your `.env` file as `GMAIL_APP_PASSWORD`

## Firebase Configuration

Make sure you have `serviceAccountKey.json` in the `backend/config/` directory with your Firebase service account credentials.

## How It Works

### Registration Flow:
1. User enters email and clicks "Send OTP"
2. Backend generates a 6-digit OTP and stores it (expires in 5 minutes)
3. OTP is sent to user's email via nodemailer
4. User enters OTP and clicks "Verify OTP"
5. Backend verifies the OTP and marks it as verified
6. User completes registration form and submits
7. Backend verifies OTP again before creating account

### Forgot Password Flow:
1. User clicks "Forgot Password?" on login page
2. User enters registered email and clicks "Send OTP"
3. Backend generates OTP and sends to email
4. User enters OTP and clicks "Verify OTP"
5. After verification, user enters new password
6. Password is updated in Firebase after OTP verification

## API Endpoints

### Registration:
- `POST /api/auth/send-otp` - Send OTP to email for registration
- `POST /api/auth/verify-otp` - Verify OTP for registration
- `POST /api/auth/register` - Register user (requires verified OTP)

### Forgot Password:
- `POST /api/auth/forgot-password/send-otp` - Send OTP for password reset
- `POST /api/auth/forgot-password/verify-otp` - Verify OTP for password reset
- `POST /api/auth/forgot-password/reset` - Reset password (requires verified OTP)

### Authentication:
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires authentication)

## Troubleshooting

### Email Not Sending:
1. Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are correct in `.env`
2. Make sure 2-Step Verification is enabled on Gmail account
3. Check that app password was generated for "Mail" app
4. Remove any spaces from the app password (code does this automatically)
5. Check backend console for error messages

### Firebase Errors:
1. Verify `serviceAccountKey.json` exists in `backend/config/`
2. Check that the service account key is valid and not expired
3. Ensure Firebase project is active

### OTP Not Working:
1. Check backend server is running on port 5000
2. Verify OTP routes are not rate-limited (max 5 requests per 15 minutes)
3. Check OTP hasn't expired (5 minute expiry)
4. Verify email normalization (all emails are converted to lowercase)

