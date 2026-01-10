import React from 'react';
import './AttendanceIcon.css';

const AttendanceIcon = ({ size = 80 }) => {
  return (
    <div
      className="attendance-icon-wrapper"
      style={{ width: size, height: size }}
    >
      <div className="att-ring"></div>
      <div className="att-ring"></div>
      <div className="att-ring"></div>

      <div className="att-icon-circle">
        <svg className="att-user-icon" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>

      <div className="att-checkmark-badge">
        <svg className="att-checkmark" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    </div>
  );
};

export default AttendanceIcon;
