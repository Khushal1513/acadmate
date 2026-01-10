import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import "./Register.css";
import { authAPI as ApiService } from "../services/api";

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    usn: "",
    branch: "",
    section: "",
    email: "",
    phone: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [error, setError] = useState({ message: "", field: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const branches = [
    "Biotechnology",
    "Civil Engineering",
    "Construction Technology and Management",
    "Computer Science and Engineering",
    "Computer Science and Engineering(AI & ML)",
    "Computer Science and Business System",
    "Electronics and Communication Engineering",
    "Information Science and Engineering",
    "Mechanical Engineering",
    "Bachelor of Computer Applications",
    "Bachelor of Business Administration",
    "other",
  ];

  // Password Validation
  const validatePassword = (password) => {
    if (!password || password.trim() === "") {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number (0-9)";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter (a-z)";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter (A-Z)";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)";
    }
    return null;
  };

  // Email Validation
  const validateEmail = (email) => {
    if (!email || !email.trim()) {
      return "Email address is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      return "Please provide a valid @gmail.com email address";
    }
    return null;
  };

  // Phone Validation
  const validatePhone = (phone) => {
    if (!phone || !phone.trim()) {
      return "Phone number is required";
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10 && phoneDigits.length !== 12) {
      return "Please enter a valid 10-digit phone number (or 12 digits with country code)";
    }
    return null;
  };

  // USN Validation
  const validateUSN = (usn) => {
    if (!usn || !usn.trim()) {
      return "USN is required";
    }
    if (!usn.toUpperCase().includes("JST")) {
      return 'Invalid USN format. USN must contain "JST" (e.g., 1JST21CS001)';
    }
    return null;
  };

  // Send OTP (for registration or forgot password)
  const handleSendOTP = async () => {
    // Validate email first
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError({ message: emailError, field: "email" });
      return;
    }

    setSendingOTP(true);
    setError({ message: "", field: "" });

    try {
      // If this is forgot-password flow, require valid new password before sending OTP
      if (isForgotPassword) {
        const passwordError = validatePassword(formData.newPassword);
        if (passwordError) {
          setError({ message: passwordError, field: "newPassword" });
          setSendingOTP(false);
          return;
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
          setError({ message: "New passwords do not match. Please re-enter your password.", field: "confirmNewPassword" });
          setSendingOTP(false);
          return;
        }
        await ApiService.sendForgotPasswordOTP(formData.email);
      } else {
        await ApiService.sendOTP(formData.email);
      }
      setOtpSent(true);
      setOtpVerified(false);
      setResendTimer(60); // 60 seconds countdown
      setError({
        message: "✅ OTP sent successfully! Please check your email inbox (and spam folder).",
        field: "",
      });
    } catch (err) {
      console.error("Send OTP error:", err);
      
      // Handle specific error cases
      if (err.status === 429 || err.message?.includes("Too many")) {
        setError({ 
          message: "Too many OTP requests. Please wait a few minutes before trying again.", 
          field: "email" 
        });
      } else if (err.message?.includes("already registered") || err.message?.includes("already exists")) {
        setError({ 
          message: "This email is already registered. Please login instead.", 
          field: "email" 
        });
      } else if (err.message?.includes("not found") || err.message?.includes("does not exist")) {
        setError({ 
          message: "No account found with this email. Please check your email or register first.", 
          field: "email" 
        });
      } else if (err.message?.includes("network") || err.message?.includes("fetch")) {
        setError({ 
          message: "Network error. Please check your internet connection and try again.", 
          field: "email" 
        });
      } else {
        setError({ 
          message: err.message || "Failed to send OTP. Please try again or contact support.", 
          field: "email" 
        });
      }
    } finally {
      setSendingOTP(false);
    }
  };

  // Verify OTP (for registration or forgot password)
  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError({ 
        message: "Please enter the complete 6-digit OTP sent to your email.", 
        field: "otp" 
      });
      return;
    }

    setVerifyingOTP(true);
    setError({ message: "", field: "" });

    try {
      if (isForgotPassword) {
        await ApiService.verifyForgotPasswordOTP(formData.email, formData.otp);
      } else {
        await ApiService.verifyOTP(formData.email, formData.otp);
      }
      setOtpVerified(true);
      setResendTimer(0);
      setError({ message: "✅ Email verified successfully!", field: "" });
    } catch (err) {
      console.error("Verify OTP error:", err);
      
      // Handle specific error cases
      if (err.status === 429 || err.message?.includes("Too many")) {
        setError({ 
          message: "Too many verification attempts. Please wait a moment and try again.", 
          field: "otp" 
        });
      } else if (err.message?.includes("expired") || err.message?.includes("Expired")) {
        setError({ 
          message: "OTP has expired. Please click 'Resend OTP' to get a new code.", 
          field: "otp" 
        });
      } else if (err.message?.includes("invalid") || err.message?.includes("incorrect")) {
        setError({ 
          message: "Invalid OTP. Please check the code and try again.", 
          field: "otp" 
        });
      } else {
        setError({ 
          message: err.message || "OTP verification failed. Please try again.", 
          field: "otp" 
        });
      }
    } finally {
      setVerifyingOTP(false);
    }
  };

  // Handle Forgot Password Form Submit
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError({ message: "", field: "" });

    try {
      // Validate email
      const emailError = validateEmail(formData.email);
      if (emailError) {
        setError({ message: emailError, field: "email" });
        setLoading(false);
        return;
      }

      // Validate OTP verification
      if (!otpVerified) {
        setError({
          message: "Please verify your email with the OTP before resetting your password.",
          field: "otp",
        });
        setLoading(false);
        return;
      }

      // Validate new password
      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) {
        setError({ message: passwordError, field: "newPassword" });
        setLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmNewPassword) {
        setError({
          message: "Passwords do not match. Please ensure both password fields are identical.",
          field: "confirmNewPassword",
        });
        setLoading(false);
        return;
      }

      // Ensure OTP is present
      if (!formData.otp || formData.otp.length !== 6) {
        setError({
          message: "Valid OTP is required. Please verify your OTP again.",
          field: "otp",
        });
        setLoading(false);
        return;
      }

      // Reset password
      await ApiService.resetPassword({
        email: formData.email,
        newPassword: formData.newPassword,
        otp: formData.otp,
      });

      // Success message + switch to login
      setError({
        message: "✅ Password reset successful! You can now login with your new password.",
        field: "",
      });

      setIsForgotPassword(false);
      setOtpSent(false);
      setOtpVerified(false);
      setResendTimer(0);

      // Reset form
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        usn: "",
        branch: "",
        section: "",
        email: "",
        phone: "",
        otp: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      // Clear success message automatically after 3 seconds
      setTimeout(() => {
        setError({ message: "", field: "" });
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      
      // Handle specific error cases
      if (err.data?.errors && Array.isArray(err.data.errors)) {
        setError({
          message: err.data.errors[0].msg || "Validation error. Please check your input.",
          field: err.data.errors[0].param || "",
        });
      } else if (err.message?.includes("expired")) {
        setError({ 
          message: "OTP has expired. Please request a new OTP.", 
          field: "otp" 
        });
      } else if (err.message?.includes("invalid")) {
        setError({ 
          message: "Invalid OTP or session expired. Please try the password reset process again.", 
          field: "otp" 
        });
      } else if (err.data?.message) {
        setError({ message: err.data.message, field: "" });
      } else if (err.message) {
        setError({ message: err.message, field: "" });
      } else {
        setError({ 
          message: "Password reset failed. Please try again or contact support.", 
          field: "" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) {
      console.log('Form submission blocked: already loading');
      return;
    }
    
    // Handle forgot password separately
    if (isForgotPassword) {
      handleForgotPasswordSubmit(e);
      return;
    }
    
    console.log('Form submitted:', { isRegistering, otpVerified, email: formData.email });
    setLoading(true);
    setError({ message: "", field: "" });

    try {
      if (isRegistering) {
        // --- Registration Validation ---
        
        // Username
        if (!formData.username || !formData.username.trim()) {
          setError({ message: "Username is required", field: "username" });
          setLoading(false);
          return;
        }
        if (formData.username.length < 3) {
          setError({ message: "Username must be at least 3 characters long", field: "username" });
          setLoading(false);
          return;
        }

        // USN
        const usnError = validateUSN(formData.usn);
        if (usnError) {
          setError({ message: usnError, field: "usn" });
          setLoading(false);
          return;
        }

        // Email
        const emailError = validateEmail(formData.email);
        if (emailError) {
          setError({ message: emailError, field: "email" });
          setLoading(false);
          return;
        }

        // Password
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
          setError({ message: passwordError, field: "password" });
          setLoading(false);
          return;
        }

        // Confirm Password
        if (!formData.confirmPassword || !formData.confirmPassword.trim()) {
          setError({ message: "Please confirm your password", field: "confirmPassword" });
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError({
            message: "Passwords do not match. Please ensure both password fields are identical.",
            field: "confirmPassword",
          });
          setLoading(false);
          return;
        }

        // Branch
        if (!formData.branch || formData.branch === "") {
          setError({ message: "Please select your branch", field: "branch" });
          setLoading(false);
          return;
        }

        // Section
        if (!formData.section || !formData.section.trim()) {
          setError({ message: "Section is required", field: "section" });
          setLoading(false);
          return;
        }

        // Phone
        const phoneError = validatePhone(formData.phone);
        if (phoneError) {
          setError({ message: phoneError, field: "phone" });
          setLoading(false);
          return;
        }

        // Check if OTP was sent
        if (!otpSent) {
          setError({
            message: "Please click 'Send OTP' button to verify your email address.",
            field: "email",
          });
          setLoading(false);
          return;
        }

        // Check OTP verification
        if (!otpVerified) {
          setError({
            message: "Please verify your email with the OTP before registering.",
            field: "otp",
          });
          setLoading(false);
          return;
        }

        // Ensure OTP is present
        if (!formData.otp || formData.otp.length !== 6) {
          setError({
            message: "Valid OTP is required for registration. Please verify your OTP again.",
            field: "otp",
          });
          setLoading(false);
          return;
        }

        // --- API Call: Register ---
        const { confirmPassword, newPassword, confirmNewPassword, ...submissionData } = formData;
        submissionData.otp = formData.otp;
        
        console.log('Registering with data:', { 
          email: submissionData.email, 
          hasOTP: !!submissionData.otp, 
          otpLength: submissionData.otp?.length,
          otpVerified 
        });
        
        await ApiService.register(submissionData);

        // Success message + switch to login
        setError({
          message: "✅ Registration successful! Welcome to AcadMate. Please login with your credentials.",
          field: "",
        });

        setIsRegistering(false);
        setOtpSent(false);
        setOtpVerified(false);
        setResendTimer(0);

        // Reset form
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          usn: "",
          branch: "",
          section: "",
          email: "",
          phone: "",
          otp: "",
          newPassword: "",
          confirmNewPassword: "",
        });

        // Clear success message after 3 seconds
        setTimeout(() => setError({ message: "", field: "" }), 3000);
        
      } else {
        // --- Login Validation ---
        
        // Email
        const emailError = validateEmail(formData.email);
        if (emailError) {
          setError({ message: emailError, field: "email" });
          setLoading(false);
          return;
        }

        // Password
        if (!formData.password || !formData.password.trim()) {
          setError({ message: "Password is required", field: "password" });
          setLoading(false);
          return;
        }

        // --- API Call: Login ---
        const response = await ApiService.login({
          email: formData.email,
          password: formData.password,
        });

        // Store token + user in local storage
        const token = response.data?.token || response.token;
        const user = response.data?.user || response.user;
        
        if (!token) {
          throw new Error("Login failed: No authentication token received");
        }
        
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Notify parent
        onLogin(user);
        onClose();
      }
    } catch (err) {
      console.error('Form submission error:', err);
      
      // Handle validation errors from express-validator
      if (err.data?.errors && Array.isArray(err.data.errors)) {
        setError({
          message: err.data.errors[0].msg || "Validation error occurred",
          field: err.data.errors[0].param || "",
        });
      } 
      // Handle specific login/registration errors
      else if (err.message?.includes("Invalid credentials") || err.message?.includes("incorrect password")) {
        setError({ 
          message: "Invalid email or password. Please check your credentials and try again.", 
          field: "" 
        });
      } else if (err.message?.includes("not found") || err.message?.includes("does not exist")) {
        setError({ 
          message: "No account found with this email. Please check your email or register.", 
          field: "email" 
        });
      } else if (err.message?.includes("already exists") || err.message?.includes("already registered")) {
        setError({ 
          message: "An account with this email already exists. Please login instead.", 
          field: "email" 
        });
      } else if (err.message?.includes("network") || err.message?.includes("fetch")) {
        setError({ 
          message: "Network error. Please check your internet connection and try again.", 
          field: "" 
        });
      } else if (err.status === 500) {
        setError({ 
          message: "Server error. Please try again later or contact support.", 
          field: "" 
        });
      } else if (err.data?.message) {
        setError({ message: err.data.message, field: "" });
      } else if (err.message) {
        setError({ message: err.message, field: "" });
      } else {
        setError({ 
          message: "An unexpected error occurred. Please try again.", 
          field: "" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers for OTP
    if (name === "otp") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    // Clear error when user starts typing
    if (error.message) setError({ message: "", field: "" });
  };

  // Reset OTP state when switching modes or closing
  useEffect(() => {
    if (!isOpen) {
      setIsForgotPassword(false);
      setOtpSent(false);
      setOtpVerified(false);
      setResendTimer(0);
      setError({ message: "", field: "" });
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        usn: "",
        branch: "",
        section: "",
        email: "",
        phone: "",
        otp: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    }
    if (!isRegistering && !isForgotPassword) {
      setOtpSent(false);
      setOtpVerified(false);
      setResendTimer(0);
      setFormData((prev) => ({ ...prev, otp: "", newPassword: "", confirmNewPassword: "" }));
    }
  }, [isOpen, isRegistering, isForgotPassword]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold custom-brown">
              {isForgotPassword ? "Forgot Password" : isRegistering ? "Register" : "Login"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 custom-brown" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Forgot Password Form */}
            {isForgotPassword ? (
              <>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium custom-brown mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={otpSent && !otpVerified}
                    placeholder="Enter your email address"
                    className={`w-full px-3 py-2 border rounded-lg ${
                      error.field === "email"
                        ? "border-red-500"
                        : otpVerified
                        ? "border-green-500"
                        : "border-gray-300"
                    } ${otpSent && !otpVerified ? "bg-gray-100" : ""}`}
                  />
                  {error.field === "email" && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium custom-brown mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      className={`w-full px-3 py-2 pr-10 border rounded-lg ${
                        error.field === "newPassword" ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {error.field === "newPassword" && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium custom-brown mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleInputChange}
                      placeholder="Re-enter new password"
                      className={`w-full px-3 py-2 pr-10 border rounded-lg ${
                        error.field === "confirmNewPassword" ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {error.field === "confirmNewPassword" && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </div>

                {/* Send OTP button */}
                <div className="flex justify-end">
                  {!otpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={sendingOTP || resendTimer > 0}
                      className="px-4 py-2 bg-accent text-brown font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {sendingOTP ? "Sending..." : resendTimer > 0 ? `Resend (${resendTimer}s)` : "Send OTP"}
                    </button>
                  )}

                  {otpVerified && (
                    <div className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg flex items-center whitespace-nowrap">
                      ✅ Verified
                    </div>
                  )}
                </div>

                {/* OTP Input */}
                {otpSent && !otpVerified && (
                  <div>
                    <label className="block text-sm font-medium custom-brown mb-2">
                      Enter OTP
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="otp"
                        value={formData.otp}
                        onChange={handleInputChange}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className={`flex-1 px-3 py-2 border rounded-lg ${
                          error.field === "otp" ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={verifyingOTP || !formData.otp || formData.otp.length !== 6}
                        className="px-4 py-2 bg-accent text-brown font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {verifyingOTP ? "Verifying..." : "Verify OTP"}
                      </button>
                    </div>
                    {error.field === "otp" && (
                      <p className="text-red-500 text-sm mt-1">{error.message}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
            {/* Registration Fields */}
            {isRegistering && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium custom-brown mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    className={`w-full px-3 py-2 border rounded-lg ${
                      error.field === "username"
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {error.field === "username" && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium custom-brown mb-2">
                    USN
                  </label>
                  <input
                    type="text"
                    name="usn"
                    value={formData.usn}
                    onChange={handleInputChange}
                    placeholder="e.g., 1JST21CS001"
                    className={`w-full px-3 py-2 border rounded-lg ${
                      error.field === "usn"
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {error.field === "usn" && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium custom-brown mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isRegistering && otpSent && !otpVerified}
                placeholder="Enter your email address"
                className={`w-full px-3 py-2 border rounded-lg ${
                  error.field === "email"
                    ? "border-red-500"
                    : otpVerified
                    ? "border-green-500"
                    : "border-gray-300"
                } ${isRegistering && otpSent && !otpVerified ? "bg-gray-100" : ""}`}
              />
              {isRegistering && otpVerified && (
                <div className="mt-2 px-3 py-2 bg-green-100 text-green-700 font-semibold rounded-lg flex items-center">
                  ✅ Email Verified
                </div>
              )}
              {error.field === "email" && (
                <p className="text-red-500 text-sm mt-1">{error.message}</p>
              )}
            </div>

            {/* OTP Input (only shown when OTP is sent but not verified) */}
            {isRegistering && otpSent && !otpVerified && (
              <div>
                <label className="block text-sm font-medium custom-brown mb-2">
                  Enter OTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className={`flex-1 px-3 py-2 border rounded-lg ${
                      error.field === "otp"
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={verifyingOTP || !formData.otp || formData.otp.length !== 6}
                    className="px-4 py-2 bg-accent text-brown font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {verifyingOTP ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
                {error.field === "otp" && (
                  <p className="text-red-500 text-sm mt-1">{error.message}</p>
                )}
              </div>
            )}

            {/* Password + Confirm Password */}
            <div
              className={isRegistering ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium custom-brown">
                    Password
                  </label>
                  {!isRegistering && !isForgotPassword && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-accent hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className={`w-full px-3 py-2 pr-10 border rounded-lg ${
                      error.field === "password"
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error.field === "password" && (
                  <p className="text-red-500 text-sm mt-1">{error.message}</p>
                )}
              </div>
              {isRegistering && (
                <div>
                  <label className="block text-sm font-medium custom-brown mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Re-enter password"
                      className={`w-full px-3 py-2 pr-10 border rounded-lg ${
                        error.field === "confirmPassword"
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {error.field === "confirmPassword" && (
                    <p className="text-red-500 text-sm mt-1">
                      {error.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {isRegistering && (
              <>
                {/* Branch + Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium custom-brown mb-2">
                      Branch
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        error.field === "branch"
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                    {error.field === "branch" && (
                      <p className="text-red-500 text-sm mt-1">
                        {error.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium custom-brown mb-2">
                      Section
                    </label>
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      placeholder="e.g., A, B, C"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        error.field === "section"
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {error.field === "section" && (
                      <p className="text-red-500 text-sm mt-1">
                        {error.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium custom-brown mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit phone number"
                    className={`w-full px-3 py-2 border rounded-lg ${
                      error.field === "phone"
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {error.field === "phone" && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </div>

                {/* Send OTP Button - At the end of registration form */}
                {!otpSent && (
                  <div>
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={sendingOTP || !formData.email || !formData.email.trim()}
                      className="w-full px-4 py-2 bg-accent text-brown font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingOTP ? "Sending OTP..." : "Send OTP"}
                    </button>
                    {!formData.email && (
                      <p className="text-sm text-gray-500 mt-1">Please fill in all details above and click Send OTP</p>
                    )}
                  </div>
                )}

                {/* OTP Sent Status */}
                {otpSent && !otpVerified && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      ✅ OTP sent to your email! Please check your inbox (and spam folder) and enter the OTP above.
                    </p>
                  </div>
                )}
              </>
            )}
            </>
          )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full custom-accent text-brown font-semibold py-3 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? isForgotPassword
                  ? "Resetting Password..."
                  : isRegistering
                  ? "Registering..."
                  : "Logging in..."
                : isForgotPassword
                ? "Reset Password"
                : isRegistering
                ? "Register"
                : "Login"}
            </button>

            {/* Success/Error Message */}
            {error.message && !error.field && (
              <div
                className={`mt-4 p-3 rounded-lg ${
                  error.message.includes("✅")
                    ? "bg-green-100 border border-green-400 text-green-700"
                    : "bg-red-100 border border-red-400 text-red-700"
                }`}
              >
                {error.message}
              </div>
            )}
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            {isForgotPassword ? (
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setOtpSent(false);
                  setOtpVerified(false);
                  setResendTimer(0);
                  setFormData((prev) => ({ ...prev, otp: "", newPassword: "", confirmNewPassword: "", email: "" }));
                  setError({ message: "", field: "" });
                }}
                className="text-accent font-semibold hover:underline"
              >
                ← Back to Login
              </button>
            ) : (
              <p className="custom-brown opacity-70">
                {isRegistering
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <button
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError({ message: "", field: "" });
                  }}
                  className="ml-2 text-accent font-semibold hover:underline"
                >
                  {isRegistering ? "Login" : "Register"}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}