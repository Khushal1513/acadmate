import React from 'react';
import './Profile.css';

const Profile = ({ user, onLogout }) => {
  return (
    <div className="profile-page">
      <main className="profile-main">
        <div className="container">
          <div className="profile-container">
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '3rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}>
              <div 
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f4b30c, #e6a00b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '1.5rem',
                  boxShadow: '0 10px 30px rgba(244, 179, 12, 0.3)'
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ 
                fontSize: '2.5rem', 
                color: '#1a1200', 
                margin: '0',
                textAlign: 'center',
                width: '100%'
              }}>
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