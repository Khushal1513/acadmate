import React, { useState } from "react";

const LoginModal = ({ onClose, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ message: "", field: "" });

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    usn: "",
    section: "",
    phone: "",
    branch: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError({ message: "", field: "" });

    try {
      if (isRegistering) {
        // ---------------------- VALIDATION ----------------------
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

        // ---------------------- BUILD SUBMISSION DATA ----------------------
        const submissionData = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          usn: formData.usn,
          section: formData.section,
          phone: formData.phone,
          branch: formData.branch,
        };

        // ---------------------- API CALL ----------------------
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
        });

        setIsRegistering(false);

        if (!response.ok) {
          setError({
            message: result.message || "An error occurred.",
            field: "",
          });
        } else {
          alert("Registration Successful! A confirmation email has been sent.");
          onClose();
        }
      } else {
        // ---------------------- LOGIN ----------------------
        onLogin({
          username: "John Doe",
          email: formData.email,
          phone: "+1 (555) 987-6543",
          usn: "01JST21CS001",
          branch: "Computer Science and Engineering",
          section: "A",
        });

        onClose();
      }
    } catch (error) {
      console.error(error);
      setError({
        message: "Could not connect to the server. Please try again later.",
        field: "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-container">
        <h2>{isRegistering ? "Register" : "Login"}</h2>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <input
                type="text"
                name="username"
                placeholder="Full Name"
                value={formData.username}
                onChange={handleChange}
              />

              <input
                type="text"
                name="usn"
                placeholder="USN"
                value={formData.usn}
                onChange={handleChange}
              />

              <input
                type="text"
                name="section"
                placeholder="Section"
                value={formData.section}
                onChange={handleChange}
              />

              <input
                type="text"
                name="branch"
                placeholder="Branch"
                value={formData.branch}
                onChange={handleChange}
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          {error.message && (
            <p className="error-message">{error.message}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? "Processing..."
              : isRegistering
              ? "Register"
              : "Login"}
          </button>
        </form>

        <p className="toggle-text" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </p>

        <button className="close-button" onClick={onClose}>X</button>
      </div>
    </div>
  );
};

export default LoginModal;
