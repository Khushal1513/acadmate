import React, { useState, useEffect } from 'react';
import { commentAPI } from '../../services/discussionAPI';
import './CommentSection.css';

const Comment = ({ comment, onReply, onEdit, onDelete, currentUser, depth = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);

  const canModify =
    currentUser &&
    (currentUser.uid === comment.author?.uid || currentUser.role === 'admin');

  const formatDate = (date) => {
    if (!date) return 'just now';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  return (
    <div className={`comment ${depth > 0 ? 'comment-reply' : ''}`}>
      {/* ---------- HEADER ---------- */}
      <div className="comment-header">
        <div className="comment-author">
          {comment.author?.photoURL ? (
            <img src={comment.author.photoURL} alt="" className="comment-avatar" />
          ) : (
            <div className="comment-avatar-placeholder">
              {(comment.author?.displayName || 'A')[0]}
            </div>
          )}
          <span className="comment-author-name">
            {comment.author?.displayName || 'Anonymous'}
          </span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>

        {canModify && (
          <div className="comment-actions">
            <button className="action-btn" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="action-btn delete" onClick={() => onDelete(comment.id)}>Delete</button>
          </div>
        )}
      </div>

      {/* ---------- CONTENT + REPLY BUTTON ---------- */}
      {isEditing ? (
        <div className="comment-edit-form">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className="edit-actions">
            <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="save-btn" onClick={() => { onEdit(comment.id, editContent); setIsEditing(false); }}>Save</button>
          </div>
        </div>
      ) : (
        <div className="comment-content-row">
          <span className="comment-content">{comment.content}</span>
          {currentUser && depth < 5 && (
            <button
              className="reply-inline-btn"
              onClick={() => setIsReplying(!isReplying)}
            >
              Reply
            </button>
          )}
        </div>
      )}

      {/* ---------- REPLY FORM ---------- */}
      {isReplying && (
        <div className="reply-form">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`Replying to ${comment.author?.displayName || 'user'}...`}
          />
          <div className="reply-actions">
            <button className="cancel-btn" onClick={() => { setIsReplying(false); setReplyContent(''); }}>Cancel</button>
            <button className="submit-btn" onClick={() => { onReply(comment.id, replyContent); setReplyContent(''); setIsReplying(false); }}>Post Reply</button>
          </div>
        </div>
      )}

      {/* ---------- REPLIES ---------- */}
      {comment.replies?.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUser={currentUser}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection = ({ discussionId, isLoggedIn, userData }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    const res = await commentAPI.getByDiscussion(discussionId);
    setComments(res.comments || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [discussionId]);

  return (
    <div className="comment-section">
      <h2 className="comment-section-title">Comments</h2>

      {isLoggedIn && (
        <div className="add-comment-form">
          <textarea
            className="comment-textarea"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button
            className="submit-comment-btn"
            onClick={async () => {
              if (!newComment.trim()) return;
              await commentAPI.create({ discussionId, content: newComment, parentId: null });
              setNewComment('');
              fetchComments();
            }}
          >
            Post Comment
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-comments">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="no-comments">No comments yet</div>
      ) : (
        <div className="comments-list">
          {comments.map((c) => (
            <Comment
              key={c.id}
              comment={c}
              onReply={async (id, content) => {
                if (!content.trim()) return;
                await commentAPI.create({ discussionId, content, parentId: id });
                fetchComments();
              }}
              onEdit={async (id, content) => { await commentAPI.update(id, content); fetchComments(); }}
              onDelete={async (id) => { await commentAPI.delete(id); fetchComments(); }}
              currentUser={userData}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
