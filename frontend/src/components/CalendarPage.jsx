import React from 'react'
import Calendar from './Calender.jsx'
import './styles.css'

const CalendarPage = ({ onBackToHome }) => {
  return (
    <>
      <style>
        {`
          :root {
            --white: white;
            --beige: #fbf9f1;
            --accent: #f4b30c;
            --black: black;
            --brown: #1a1200;
            --beige-footer: #ddd9c5;
          }

            .calendar-container {
              max-width: 700px;
              margin: 0 auto;
              padding: 0.5rem;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              width: 100%;
            }

          .calendar-header {
            margin-bottom: 2rem;
          }

          .calendar-title {
            margin: 0;
            color: var(--brown);
            font-size: 2.5rem;
            font-weight: 700;
            text-align: center;
          }

          .back-arrow-btn {
            position: fixed;
            top: 80px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: white;
            border: 2px solid var(--accent);
            color: var(--accent);
            font-size: 1.5rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(244, 179, 12, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
          }

          .back-arrow-btn:hover {
            background: var(--accent);
            color: white;
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(244, 179, 12, 0.4);
          }

          .notification-banner {
            background: var(--accent);
            color: var(--white);
            padding: 0.8rem 1.2rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            text-align: center;
            font-weight: 600;
            animation: slideIn 0.3s ease;
          }

          @keyframes slideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          .event-form-section {
            background: var(--white);
            padding: 1.2rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .event-form-section h3 {
            margin: 0 0 1rem 0;
            color: var(--brown);
            font-size: 1.1rem;
            font-weight: 600;
          }

          .event-form {
            background: var(--beige);
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid var(--accent);
          }

          .form-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr auto;
            gap: 1rem;
            align-items: end;
          }

          .input-group {
            display: flex;
            flex-direction: column;
          }

          .input-group label {
            margin-bottom: 0.5rem;
            color: var(--brown);
            font-size: 0.9rem;
            font-weight: 600;
          }

          .form-input {
            padding: 0.6rem;
            border: 2px solid var(--beige-footer);
            border-radius: 6px;
            font-size: 0.9rem;
            background: var(--white);
            color: var(--brown);
            transition: all 0.2s ease;
          }

          .form-input:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 2px rgba(244, 179, 12, 0.3);
          }

          .btn-add {
            background: linear-gradient(135deg, #f4b30c 0%, #ff8c42 100%);
            color: var(--white);
            border: none;
            padding: 0.7rem 1.6rem;
            border-radius: 999px;
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            white-space: nowrap;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(244, 179, 12, 0.4);
            letter-spacing: 0.3px;
          }

          .btn-add::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s;
          }

          .btn-add:hover {
            background: linear-gradient(135deg, #ff8c42 0%, #f4b30c 100%);
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 8px 25px rgba(244, 179, 12, 0.6);
          }

          .btn-add:hover::before {
            left: 100%;
          }

          .btn-add:active {
            transform: translateY(0) scale(0.98);
          }

          .calendar-nav-section {
            background: var(--white);
            padding: 1.2rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .calendar-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .calendar-nav h3 {
            margin: 0;
            color: var(--brown);
            font-size: 1.2rem;
            font-weight: 600;
          }

          .nav-btn {
            background: linear-gradient(135deg, #f4b30c 0%, #ff8c42 100%);
            color: var(--white);
            border: none;
            padding: 0.6rem 1.2rem;
            border-radius: 999px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(244, 179, 12, 0.4);
            min-width: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .nav-btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.5s, height 0.5s;
          }

          .nav-btn:hover {
            background: linear-gradient(135deg, #ff8c42 0%, #f4b30c 100%);
            transform: translateY(-2px) scale(1.1);
            box-shadow: 0 8px 25px rgba(244, 179, 12, 0.6);
          }

          .nav-btn:hover::before {
            width: 200px;
            height: 200px;
          }

          .nav-btn:active {
            transform: translateY(0) scale(0.95);
          }

          .calendar-grid-section {
            background: var(--white);
            padding: 0.8rem;
            border-radius: 12px;
            margin-bottom: 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 0.1rem;
          }

          .calendar-header-day {
            background: var(--accent);
            color: var(--white);
            padding: 0.2rem 0.1rem;
            text-align: center;
            font-weight: 700;
            border-radius: 6px;
            font-size: 0.9rem;
            min-height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .calendar-day {
            background: var(--beige);
            border-radius: 1px;
            padding: 0.1rem;
            min-height: 20px;
            border: 1px solid transparent;
            transition: all 0.2s ease;
            overflow: hidden;
            position: relative;
          }

          .calendar-day:hover {
            border-color: var(--accent);
            transform: translateY(-1px);
          }

          .calendar-day.has-event {
            border-color: var(--accent);
            background: var(--white);
          }

          .day-number {
            font-weight: 500;
            color: var(--brown);
            margin-bottom: 0.05rem;
            text-align: center;
            font-size: 0.7rem;
          }

          .event-item {
            background: var(--accent);
            color: var(--black);
            padding: 0.1rem 0.2rem;
            border-radius: 3px;
            font-size: 0.5rem;
            margin-bottom: 0.1rem;
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
            display: block;
          }

          .event-item.exam {
            background: #f4b30c;
          }

          .event-item.assignment {
            background: #f4b30c;
          }

          .event-item.fee {
            background: #f4b30c;
          }

          .event-item.other {
            background: #f4b30c;
          }

          .college-badge {
            margin-left: 0.3rem;
            font-size: 0.8rem;
          }

          .upcoming-events-section {
            background: var(--white);
            padding: 1.2rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .upcoming-events-section h3 {
            margin: 0 0 1rem 0;
            color: var(--brown);
            font-size: 1.1rem;
            font-weight: 600;
          }

          .events-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
          }

          .event-card {
            background: var(--beige);
            padding: 1rem;
            border-radius: 12px;
            border-left: 4px solid var(--accent);
            transition: all 0.2s ease;
            min-height: 80px;
          }

          .event-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .event-card.exam {
            border-left-color: #f4b30c;
          }

          .event-card.assignment {
            border-left-color: #f4b30c;
          }

          .event-card.fee {
            border-left-color: #f4b30c;
          }

          .event-card.other {
            border-left-color: #f4b30c;
          }

          .event-info {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .event-info strong {
            color: var(--brown);
            font-size: 1rem;
          }

          .event-date {
            color: var(--brown);
            font-size: 0.9rem;
            opacity: 0.8;
          }

          .college-badge {
            background: var(--accent);
            color: var(--white);
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 600;
            align-self: flex-start;
          }

          @media (max-width: 768px) {
            .calendar-container {
              max-width: 95vw;
              padding: 0.3rem;
            }
            
            .form-row {
              grid-template-columns: 1fr;
              gap: 1rem;
            }
            
            .calendar-grid {
              gap: 0.2rem;
            }
            
            .calendar-header-day {
              font-size: 0.8rem;
              padding: 0.3rem 0.2rem;
              min-height: 35px;
            }
            
            .calendar-day {
              min-height: 10px;
              padding: 0.01rem;
            }
            
            .day-number {
              font-size: 0.6rem;
            }
            
            .events-grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }
            
            .event-card {
              padding: 1rem;
              min-height: 100px;
            }
            
            .event-form-section,
            .calendar-nav-section,
            .calendar-grid-section,
            .upcoming-events-section {
              padding: 1rem;
              margin-bottom: 1rem;
            }
          }
          
          @media (max-width: 480px) {
            .calendar-container {
              max-width: 100vw;
              padding: 0.2rem;
            }
            
            .calendar-grid {
              gap: 0.1rem;
            }
            
            .calendar-header-day {
              font-size: 0.7rem;
              padding: 0.2rem 0.1rem;
              min-height: 30px;
            }
            
            .calendar-day {
              min-height: 8px;
              padding: 0.005rem;
            }
            
            .day-number {
              font-size: 0.5rem;
            }
            
            .event-item {
              font-size: 0.6rem;
              padding: 0.2rem 0.3rem;
            }
            
            .event-form-section,
            .calendar-nav-section,
            .calendar-grid-section,
            .upcoming-events-section {
              padding: 0.8rem;
              margin-bottom: 0.8rem;
            }
            
            .form-row {
              gap: 0.8rem;
            }
            
            .btn-add,
            .nav-btn,
            .back-btn {
              padding: 0.5rem 1rem;
              font-size: 0.8rem;
            }
          }
        `}
      </style>
      <div className="page-layout">
        <div className="page-container">
          {/* Header with title and back button */}
          {/* <div className="grade-header">
            <h2 className="grade-title">📅 EventBuddy</h2>
            <button className="btn back-btn" onClick={onBackToHome}>← Back to Home</button>
          </div> */}
          {/* Main content area for calendar component */}
          <div className="page-content">
            <Calendar onBack={onBackToHome} />
          </div>
        </div>
      </div>
    </>
  )
}

export default CalendarPage