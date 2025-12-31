import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.getProfile();
        setUser(res.user); // ✅ FIX HERE
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading profile...</h2>;
  }

  if (!user) {
    return <h2 style={{ textAlign: "center" }}>Profile not found</h2>;
  }

  return (
    <div className="profile-page">
      <main className="profile-main">
        <div className="container">
          <div className="profile-container">
            <div
              style={{
                textAlign: "center",
                marginBottom: "3rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f4b30c, #e6a00b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "1.5rem",
                  boxShadow: "0 10px 30px rgba(244, 179, 12, 0.3)",
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>

              <h2
                style={{
                  fontSize: "2.5rem",
                  color: "#1a1200",
                  margin: 0,
                }}
              >
                {user.username}
              </h2>
            </div>

            <div className="profile-grid">
              <div className="profile-card">
                <h3>Personal Information</h3>
                <div className="profile-info">
                  <div className="info-item">
                    <label>Username:</label>
                    <span>{user.username}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{user.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{user.phone}</span>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <h3>Academic Details</h3>
                <div className="profile-info">
                  <div className="info-item">
                    <label>USN:</label>
                    <span>{user.usn}</span>
                  </div>
                  <div className="info-item">
                    <label>Branch:</label>
                    <span>{user.branch}</span>
                  </div>
                  <div className="info-item">
                    <label>Section:</label>
                    <span>{user.section}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
