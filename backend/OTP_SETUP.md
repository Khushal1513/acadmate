# OTP Email Verification Setup

## Environment Variables Required

Add these to your `.env` file in the `backend` directory:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
JWT_SECRET=your-jwt-secret-key
```

**Note:** The code also supports `EMAIL_USER` and `EMAIL_PASS` as fallback variable names.

## Gmail App Password Setup

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Use this 16-character password as `EMAIL_PASS`

## How It Works

1. User enters email and clicks "Send OTP"
2. Backend generates a 6-digit OTP and stores it (expires in 5 minutes)
3. OTP is sent to user's email via nodemailer
4. User enters OTP and clicks "Verify OTP"
5. Backend verifies the OTP
6. User can now complete registration (OTP is required in registration request)

## API Endpoints

- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/register` - Register user (requires verified OTP)

