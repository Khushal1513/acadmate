import React from "react";
import "./AttendanceIcon.css";

const AttendanceIcon = ({ size = 120 }) => {
  return (
    <div
      className="attendance-icon"
      style={{ width: size, height: size }}
    >
      <img
        src="/attendance-logo.jpeg"
        alt="Attendance Logo"
        className="attendance-logo-img"
      />
    </div>
  );
};

export default AttendanceIcon;
