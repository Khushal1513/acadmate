import React from 'react';
import { data } from './data'; // Import data to find the PDF URL
import './PdfViewer.css';

const PdfViewer = ({ user, onLogout, cycle, subjectId, type, pdfId, onNavigate, onBack }) => {

  // Find the specific PDF URL from our data structure
  const currentCycleData = data[cycle];
  const currentSubject = currentCycleData?.subjects.find(s => s.id === subjectId);
  const pdf = currentSubject ? currentSubject[type]?.find(p => p.id === pdfId) : null;
  
  // This logic now correctly handles a direct syllabus link or a document link
  const pdfToView = type === 'syllabus' 
    ? { title: `${cycle.charAt(0).toUpperCase() + cycle.slice(1)} Syllabus`, url: 'https://drive.google.com/file/d/1MCHK2uif5hiptlESsN6Ta6XQvYY3tEuS/view?usp=sharing' }
    : pdf;

  if (!pdfToView) {
    return <div>PDF not found.</div>;
  }

  return (
    <div className="pdf-viewer-page">
     
      <main className="pdf-main">
        <div className="container">
          <div className="pdf-header">
            <h2>{pdfToView.title}</h2>
          </div>
          <div className="pdf-embed-container">
            <iframe
              src={pdfToView.url}
              title={pdfToView.title}
              className="pdf-embed"
            >
              Your browser does not support PDFs.
            </iframe>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PdfViewer;