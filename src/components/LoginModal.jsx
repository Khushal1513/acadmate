import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./Register.css";
import ApiService from "../services/api";

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
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
  });

  const [error, setError] = useState({ message: "", field: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

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
    if (password.length < 8)
      return "Password must be at least 8 characters long.";
    if (!/\d/.test(password)) return "Password must contain at least one number.";
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter.";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter.";
    if (!/[!@#$%^&*]/.test(password))
      return "Password must contain a special character (e.g., !@#$%).";
    return null;
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!formData.email || !formData.email.trim()) {
      setError({ message: "Please enter your email first.", field: "email" });
      return;
    }

    if (!formData.email.toLowerCase().endsWith("@gmail.com")) {
      setError({
        message: "Please provide a valid @gmail.com email address.",
        field: "email",
      });
      return;
    }

    setSendingOTP(true);
    setError({ message: "", field: "" });

    try {
      await ApiService.sendOTP(formData.email);
      setOtpSent(true);
      setOtpVerified(false);
      setResendTimer(60); // 60 seconds countdown
      setError({
        message: "✅ OTP sent to your email! Please check your inbox.",
        field: "",
      });
    } catch (err) {
      setError({ message: err.message || "Failed to send OTP", field: "email" });
    } finally {
      setSendingOTP(false);
    }
  };

  // Verify OTP
 const handleVerifyOTP = async () => {
  if (!formData.otp || formData.otp.length !== 6) return;

  setVerifyingOTP(true);
  setError({ message: "", field: "" });

  try {
    await ApiService.verifyOTP(formData.email, formData.otp);
    setOtpVerified(true);
    setResendTimer(0);
    setError({ message: "✅ OTP verified successfully!", field: "" });
  } catch (err) {
    setError({ message: err.message || "Invalid OTP", field: "otp" });
  } finally {
    setVerifyingOTP(false);
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
    if (loading) return;
    setLoading(true);
    setError({ message: "", field: "" });

    try {
      if (isRegistering) {
        // --- Validation ---
        for (const key in formData) {
          if (
            Object.prototype.hasOwnProperty.call(formData, key) &&
            String(formData[key]).trim() === ""
          ) {
            setError({
              message: "Please fill in all required fields.",
              field: key,
            });
            setLoading(false);
            return;
          }
        }

        if (!formData.usn.toUpperCase().includes("JST")) {
          setError({
            message: 'Invalid USN. It must contain "JST".',
            field: "usn",
          });
          setLoading(false);
          return;
        }

        if (!formData.email.toLowerCase().endsWith("@gmail.com")) {
          setError({
            message: "Please provide a valid @gmail.com email address.",
            field: "email",
          });
          setLoading(false);
          return;
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
          setError({ message: passwordError, field: "password" });
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError({
            message: "Passwords do not match.",
            field: "confirmPassword",
          });
          setLoading(false);
          return;
        }

        const phoneRegex = /^(91)?[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone)) {
          setError({
            message: "Please enter a valid 10 or 12-digit phone number.",
            field: "phone",
          });
          setLoading(false);
          return;
        }

        // Check OTP verification
        if (!otpVerified) {
          setError({
            message: "Please verify your email with OTP before registering.",
            field: "otp",
          });
          setLoading(false);
          return;
        }

        // Ensure OTP is present
        if (!formData.otp || formData.otp.length !== 6) {
          setError({
            message: "OTP is required for registration. Please verify your OTP again.",
            field: "otp",
          });
          setLoading(false);
          return;
        }

        // --- API Call: Register ---
        const { confirmPassword, ...submissionData } = formData;
        // Explicitly include OTP in registration request (required for backend verification)
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
          message: "✅ Registration successful! Please login now.",
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
        });

        // Clear success message automatically
        setTimeout(() => setError({ message: "", field: "" }), 3000);
      } else {
        // --- API Call: Login ---
        const response = await ApiService.login({
          email: formData.email,
          password: formData.password,
        });

        // Store token + user in local storage
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Notify parent
        onLogin(response.user);
        onClose();
      }
    } catch (err) {
      // Handle validation errors from express-validator
      if (err.data?.errors && Array.isArray(err.data.errors)) {
        setError({
          message: err.data.errors[0].msg,
          field: err.data.errors[0].param || "",
        });
      } else if (err.data?.message) {
        // Handle error messages from backend
        setError({ message: err.data.message, field: "" });
      } else if (err.message) {
        // Handle other errors
        setError({ message: err.message, field: "" });
      } else {
        setError({ message: "Something went wrong. Please try again.", field: "" });
      }
      console.error('Registration error:', err);
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
    if (error.message) setError({ message: "", field: "" });
  };

  // Reset OTP state when switching modes or closing
  useEffect(() => {
    if (!isOpen) {
      setOtpSent(false);
      setOtpVerified(false);
      setResendTimer(0);
      setFormData((prev) => ({ ...prev, otp: "" }));
    }
    if (!isRegistering) {
      setOtpSent(false);
      setOtpVerified(false);
      setResendTimer(0);
      setFormData((prev) => ({ ...prev, otp: "" }));
    }
  }, [isOpen, isRegistering]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold custom-brown">
              {isRegistering ? "Register" : "Login"}
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
                Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={otpSent && !otpVerified}
                  className={`flex-1 px-3 py-2 border rounded-lg ${
                    error.field === "email"
                      ? "border-red-500"
                      : otpVerified
                      ? "border-green-500"
                      : "border-gray-300"
                  } ${otpSent && !otpVerified ? "bg-gray-100" : ""}`}
                />
                {isRegistering && !otpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={sendingOTP || resendTimer > 0}
                    className="px-4 py-2 bg-accent text-brown font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {sendingOTP
                      ? "Sending..."
                      : resendTimer > 0
                      ? `Resend (${resendTimer}s)`
                      : "Send OTP"}
                  </button>
                )}
                {isRegistering && otpVerified && (
                  <div className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg flex items-center whitespace-nowrap">
                    ✅ Verified
                  </div>
                )}
              </div>
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
                    disabled={loading || !formData.otp || formData.otp.length !== 6}
                    className="px-4 py-2 bg-accent text-brown font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
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
                <label className="block text-sm font-medium custom-brown mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    error.field === "password"
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {error.field === "password" && (
                  <p className="text-red-500 text-sm mt-1">{error.message}</p>
                )}
              </div>
              {isRegistering && (
                <div>
                  <label className="block text-sm font-medium custom-brown mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      error.field === "confirmPassword"
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
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
                    pattern="^(91)?[0-9]{10}$"
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
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full custom-accent text-brown font-semibold py-3 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              {loading
                ? isRegistering
                  ? "Registering..."
                  : "Logging in..."
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
            <p className="custom-brown opacity-70">
              {isRegistering
                ? "Already have an account?"
                : "Don't have an account?"}
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="ml-2 text-accent font-semibold hover:underline"
              >
                {isRegistering ? "Login" : "Register"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
