// components/discussion/DiscussionDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { discussionAPI } from '../../services/discussionAPI';
import CommentSection from './CommentSection';
import FileViewer from './FileViewer';
import './DiscussionDetail.css';

const DiscussionDetail = ({ isLoggedIn, userData }) => {
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileViewerIndex, setFileViewerIndex] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDiscussion();
    if (isLoggedIn) checkVoteStatus();
  }, [id, isLoggedIn]);

  const fetchDiscussion = async () => {
    try {
      setLoading(true);
      const res = await discussionAPI.getById(id);
      setDiscussion(res.discussion);
    } catch (err) {
      setError("Failed to load discussion");
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async () => {
    try {
      const res = await discussionAPI.getVoteStatus(id);
      setHasVoted(res.hasVoted);
    } catch {}
  };

  const handleVote = async () => {
    if (!isLoggedIn || !userData) {
      alert("Please login to vote");
      return;
    }

    try {
      setVoting(true);
      const res = await discussionAPI.vote(id);

      setHasVoted(res.voted);
      setDiscussion(prev => ({
        ...prev,
        voteCount: prev.voteCount + (res.voted ? 1 : -1),
      }));
    } catch {
      alert("Voting failed");
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this discussion?")) return;

    try {
      setDeleting(true);
      await discussionAPI.delete(id);
      navigate("/discussions");
    } catch {
      alert("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const canModify =
    isLoggedIn &&
    userData &&
    (userData.uid === discussion?.author?.uid ||
      userData.role === "admin");

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (url) => {
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return '🖼️';
    if (url.match(/\.pdf$/i)) return '📄';
    return '📎';
  };

  const renderFilePreview = (url, index) => {
    const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const filename = url.split('/').pop();

    if (isImage) {
      return (
        <div key={index} className="file-preview image-preview">
          <img src={url} alt={`Attachment ${index + 1}`} />
          <a href={url} target="_blank" rel="noopener noreferrer" className="view-full">
            View Full Size
          </a>
        </div>
      );
    }

    return (
      <a
        key={index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="file-attachment"
      >
        <span className="file-icon">{getFileIcon(url)}</span>
        <span className="file-name">{decodeURIComponent(filename)}</span>
      </a>
    );
  };

   if (loading) {
    return (
      <div className="discussion-detail-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="discussion-detail-container">
        <div className="error-state">
          <h2>⚠️ {error || 'Discussion not found'}</h2>
          <button onClick={() => navigate('/discussions')} className="back-btn">
            ← Back to Discussions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="discussion-detail-container">
      <div className="discussion-main">
        {/* Avatar */}
        <div className="discussion-author-section">
          <div className="author-avatar-placeholder-large">
            {(discussion.author?.displayName || "A")[0].toUpperCase()}
          </div>
        </div>

        <div className="discussion-content-area">
          {/* Header */}
          <div className="discussion-header-info">
            <span className="author-name">
              {discussion.author?.displayName || "Anonymous"}
            </span>
            <span className="discussion-date">
              Asked {formatDate(discussion.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h1 className="discussion-title">{discussion.title}</h1>

          {/* Body */}
          <div className="discussion-body">
            {discussion.content.split("\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* ACTIONS ROW */}
          <div className="discussion-actions-bottom">
            {/* Vote Pill */}
            <div className="vote-pill">
  <button
    onClick={handleVote}
    className={`vote-icon up ${hasVoted ? "active" : ""}`}
    disabled={voting || !isLoggedIn}
  >
    ↑
  </button>

  <span className="vote-count">{discussion.voteCount || 0}</span>

  <button className="vote-icon down" disabled>
    ↓
  </button>
</div>


            {/* Delete */}
            {canModify && (
              <button
                className="delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "..." : "🗑️ Delete"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <CommentSection
        discussionId={id}
        isLoggedIn={isLoggedIn}
        userData={userData}
        onCommentAdded={fetchDiscussion}
      />

      {/* File Viewer Modal */}
      {fileViewerOpen && discussion?.fileUrls && discussion.fileUrls.length > 0 && (
        <FileViewer
          files={discussion.fileUrls}
          initialIndex={fileViewerIndex}
          onClose={() => setFileViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default DiscussionDetail;
