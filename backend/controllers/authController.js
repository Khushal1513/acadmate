const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
const { generateOTP, storeOTP, verifyOTP, isOTPVerified, deleteOTP } = require('../utils/otpService');
const { sendOTPEmail } = require('../utils/emailService');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// SEND OTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', normalizedEmail).get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(normalizedEmail, otp);

    // Send OTP email
    try {
      await sendOTPEmail(normalizedEmail, otp);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails - log it for debugging
      // In production, you might want to handle this differently
      throw new Error('Failed to send email. Please check email configuration.');
    }

    res.json({ 
      message: 'OTP sent successfully to your email',
      email: normalizedEmail 
    });
  } catch (err) {
    console.error('Send OTP failed:', err);
    const errorMessage = err.message || 'Failed to send OTP. Please try again.';
    res.status(500).json({ message: errorMessage });
  }
};

// VERIFY OTP
const verifyOTPCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
   const result = verifyOTP(normalizedEmail, otp);

if (!result.valid) {
  return res.status(400).json({ message: result.message });
}

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Verify OTP failed:', err);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};

// REGISTER
const register = async (req, res) => {
  try {
    const { username, usn, password, branch, section, email, phone, otp } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if OTP was verified
    const alreadyVerified = isOTPVerified(normalizedEmail);
    console.log('Registration check:', { 
      normalizedEmail, 
      alreadyVerified, 
      hasOTP: !!otp,
      otpLength: otp?.length 
    });
    
    if (!alreadyVerified) {
      // If not verified, try to verify now with provided OTP
      if (!otp || !otp.trim()) {
        console.log('OTP missing in registration request');
        return res.status(400).json({ 
          message: 'OTP verification is required. Please verify your email first or provide OTP.' 
        });
      }
      
      // Try to verify the OTP
      const otpResult = verifyOTP(normalizedEmail, otp.trim());
      console.log('OTP verification result:', otpResult);
      
      if (!otpResult.valid) {
        console.log('OTP verification failed:', otpResult.message);
        return res.status(400).json({ 
          message: otpResult.message || 'OTP not found or expired. Please verify your email again.' 
        });
      }
    }

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', normalizedEmail).get();

    if (!snapshot.empty) return res.status(400).json({ message: 'User already exists' });

    // Normalize phone number (remove non-digits, take last 10 digits)
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserRef = usersRef.doc(); // Generate new document
    await newUserRef.set({
      username,
      usn,
      branch,
      section,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      emailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    // Delete OTP after successful registration
    deleteOTP(normalizedEmail);

    res.status(201).json({
      user: { id: newUserRef.id, username, usn, branch, section, email: normalizedEmail, phone },
      token: generateToken(newUserRef.id),
    });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', normalizedEmail).get();

    if (snapshot.empty) return res.status(400).json({ message: 'Invalid credentials' });

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const valid = await bcrypt.compare(password, userData.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      user: {
        id: userDoc.id,
        username: userData.username,
        usn: userData.usn,
        branch: userData.branch,
        section: userData.section,
        email: userData.email,
        phone: userData.phone,
      },
      token: generateToken(userDoc.id),
    });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

module.exports = { register, login, sendOTP, verifyOTPCode };
