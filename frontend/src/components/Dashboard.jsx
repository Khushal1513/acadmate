import React from 'react';
import './Dashboard.css';

const Dashboard = ({ onNavigate }) => {
  const cycles = [
    {
      id: 'physics',
      title: 'Physics Cycle',
      icon: '⚛️',
      subjects: [
        'Engineering Mathematics',
        'Engineering Physics',
        'Elective1- Mechanical Engineering',
        'Elements of Electrical Engineering',
        'Elective2- Introduction to Programming',
        'Innovation & Design Thinking'
      ]
    },
    {
      id: 'chemistry',
      title: 'Chemistry Cycle',
      icon: '⚗️',
      subjects: [
        'Engineering Mathematics',
        'Engineering Chemistry',
        'Engineering Mechanics',
        'Elective3- Electronics Engineering',
        'Engineering Graphics and Design',
        'Elective3- Sustainability/Skill',
        'Communication English'
      ]
    }
  ];

  const materialTypes = [
    { id: 'syllabus', title: 'Syllabus Copy', icon: '📋' },
    { id: 'textbook', title: 'Textbook', icon: '📚' },
    { id: 'notes', title: 'Notes', icon: '📝' },
    { id: 'pyqs', title: "PYQ's", icon: '📄' }
  ];

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-header">
            <h2>Study Materials</h2>
            <p>Access all your course materials organized by semester cycles</p>
          </div>

          <div className="cycles-grid">
            {cycles.map(cycle => (
              <div key={cycle.id} className="cycle-card">
                <div className="cycle-header">
                  <div className="cycle-icon">{cycle.icon}</div>
                  <h3>{cycle.title}</h3>
                </div>

                {/* ✅ SUBJECTS INLINE */}
                <div className="subjects-list">
                  <span className="subjects-label">Subjects:</span>
                  <div className="subjects-tags">
                    {cycle.subjects.map(subject => (
                      <span key={subject} className="subject-tag">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="materials-grid">
                  {materialTypes.map(material => (
                    <button
                      key={material.id}
                      className="material-card"
                      onClick={() =>
                        onNavigate &&
                        onNavigate('subjects', {
                          cycle: cycle.id,
                          type: material.id
                        })
                      }
                    >
                      <div className="material-icon">{material.icon}</div>
                      <h5>{material.title}</h5>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
