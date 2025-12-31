const otpStore = new Map();

const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.storeOTP = (email, otp) => {
  otpStore.set(email, {
    otp: String(otp),
    createdAt: Date.now(),
    attempts: 0,
    verified: false,
  });
};

exports.verifyOTP = (email, otp) => {
  const record = otpStore.get(email);
  
  console.log('verifyOTP called:', { 
    email, 
    hasRecord: !!record, 
    providedOTP: otp,
    storedOTP: record?.otp,
    verified: record?.verified,
    attempts: record?.attempts,
    age: record ? Date.now() - record.createdAt : null
  });

  if (!record) {
    console.log('OTP record not found for email:', email);
    return { valid: false, message: "OTP not found or expired" };
  }

  if (Date.now() - record.createdAt > OTP_EXPIRY) {
    console.log('OTP expired for email:', email);
    otpStore.delete(email);
    return { valid: false, message: "OTP expired" };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    console.log('Too many attempts for email:', email);
    otpStore.delete(email);
    return { valid: false, message: "Too many attempts" };
  }

  if (String(record.otp) !== String(otp)) {
    console.log('OTP mismatch:', { stored: record.otp, provided: otp });
    record.attempts++;
    return { valid: false, message: "Invalid OTP" };
  }

  record.verified = true;
  console.log('OTP verified successfully for email:', email);
  return { valid: true, message: "OTP verified" };
};

exports.isOTPVerified = (email) => {
  const record = otpStore.get(email);
  console.log('isOTPVerified check:', { 
    email, 
    hasRecord: !!record, 
    verified: record?.verified,
    age: record ? Date.now() - record.createdAt : null,
    expired: record ? (Date.now() - record.createdAt > OTP_EXPIRY) : null
  });
  if (!record) {
    return false;
  }
  // Check if OTP has expired
  if (Date.now() - record.createdAt > OTP_EXPIRY) {
    otpStore.delete(email);
    return false;
  }
  return record.verified === true;
};

exports.deleteOTP = (email) => {
  otpStore.delete(email);
};
