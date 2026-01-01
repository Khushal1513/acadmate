import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { discussionAPI } from "../../services/discussionAPI";
import CommentSection from "./CommentSection";
import "./DiscussionDetail.css";

const DiscussionDetail = ({ isLoggedIn, userData }) => {
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const formatDate = date =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return <div className="loading">Loading discussion...</div>;
  }

  if (error || !discussion) {
    return <div className="error">Discussion not found</div>;
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
    </div>
  );
};

export default DiscussionDetail;
