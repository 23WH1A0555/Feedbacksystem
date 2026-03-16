import React, { useState, useEffect, useCallback } from 'react';
import { feedbackAPI } from '../services/api';
import toast from 'react-hot-toast';

function DetailModal({ feedback, onClose, onStatusChange, onDelete }) {
  const [status, setStatus] = useState(feedback.status);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await feedbackAPI.updateStatus(feedback._id, newStatus);
      setStatus(newStatus);
      onStatusChange(feedback._id, newStatus);
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await feedbackAPI.delete(feedback._id);
      onDelete(feedback._id);
      onClose();
      toast.success('Feedback deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>{feedback.subject}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`badge badge-${feedback.category}`}>{feedback.category}</span>
              <span className={`badge badge-${status}`}>{status}</span>
              <span style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>{'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>From</div>
              <div style={{ fontWeight: 600 }}>{feedback.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{feedback.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Submitted</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{new Date(feedback.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '1rem', border: '1px solid var(--border)', lineHeight: 1.7, fontSize: '0.9rem' }}>
            {feedback.message}
          </div>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Update Status</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['new', 'reviewed', 'resolved'].map(s => (
              <button key={s} className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => handleStatusChange(s)} disabled={updating || status === s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>✕ Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '', rating: '', page: 1 });
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = { ...filters };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    try {
      const res = await feedbackAPI.getAll(params);
      setFeedbacks(res.data);
      setPagination(res.pagination);
    } catch { toast.error('Failed to load feedback'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }));

  return (
    <div>
      <div className="page-header"><h1>Responses</h1><p>{pagination.total} total submissions</p></div>
      <div className="filter-bar">
        <select value={filters.category} onChange={e => handleFilterChange('category', e.target.value)}>
          <option value="">All Categories</option>
          <option value="general">General</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
          <option value="support">Support</option>
          <option value="other">Other</option>
        </select>
        <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filters.rating} onChange={e => handleFilterChange('rating', e.target.value)}>
          <option value="">All Ratings</option>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={load}>↻ Refresh</button>
      </div>
      {loading ? (
        <div className="loading"><div className="spinner" />Loading...</div>
      ) : feedbacks.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">◈</div><p>No feedback found.</p></div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Subject</th><th>Category</th><th>Rating</th><th>Status</th><th>Date</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map(fb => (
                  <tr key={fb._id}>
                    <td><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fb.name}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{fb.email}</div></td>
                    <td><div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{fb.subject}</div></td>
                    <td><span className={`badge badge-${fb.category}`}>{fb.category}</span></td>
                    <td><span style={{ color: 'var(--gold)' }}>{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span></td>
                    <td><span className={`badge badge-${fb.status}`}>{fb.status}</span></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{new Date(fb.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setSelected(fb)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={filters.page <= 1} onClick={() => handleFilterChange('page', filters.page - 1)}>‹</button>
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => (
                <button key={i+1} className={`page-btn ${filters.page === i+1 ? 'active' : ''}`} onClick={() => handleFilterChange('page', i+1)}>{i+1}</button>
              ))}
              <button className="page-btn" disabled={filters.page >= pagination.pages} onClick={() => handleFilterChange('page', filters.page + 1)}>›</button>
            </div>
          )}
        </>
      )}
      {selected && <DetailModal feedback={selected} onClose={() => setSelected(null)} onStatusChange={(id, s) => setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, status: s } : f))} onDelete={(id) => { setFeedbacks(prev => prev.filter(f => f._id !== id)); setPagination(prev => ({ ...prev, total: prev.total - 1 })); }} />}
    </div>
  );
}