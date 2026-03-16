import React, { useState } from 'react';
import { feedbackAPI } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: '', label: 'Select a category...' },
  { value: 'general', label: '💬 General Feedback' },
  { value: 'bug', label: '🐛 Bug Report' },
  { value: 'feature', label: '✨ Feature Request' },
  { value: 'support', label: '🛠 Support' },
  { value: 'other', label: '📦 Other' },
];

const initialForm = {
  name: '', email: '', category: '', rating: 0, subject: '', message: ''
};

function StarRating({ value, onChange, error }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div>
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= (hovered || value) ? 'filled' : 'empty'}`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            role="button"
            aria-label={`Rate ${star} stars`}
          >★</span>
        ))}
        {value > 0 && (
          <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', alignSelf: 'center' }}>
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
          </span>
        )}
      </div>
      {error && <div className="error-msg">⚠ {error}</div>}
    </div>
  );
}

function SuccessScreen({ onReset }) {
  return (
    <div className="success-screen">
      <div className="success-circle">✓</div>
      <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.4rem', marginBottom: '0.5rem' }}>
        Feedback Received!
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
        Thank you for taking the time to share your thoughts.
      </p>
      <button className="btn btn-primary" onClick={onReset}>Submit Another</button>
    </div>
  );
}

export default function FeedbackForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Valid email is required';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.rating) errs.rating = 'Please give a rating';
    if (!form.subject.trim() || form.subject.trim().length < 5) errs.subject = 'Subject must be at least 5 characters';
    if (!form.message.trim() || form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fix the form errors');
      return;
    }
    setLoading(true);
    try {
      await feedbackAPI.submit(form);
      setSubmitted(true);
      toast.success('Feedback submitted!');
    } catch (err) {
      if (err.errors?.length) {
        const fieldErrors = {};
        err.errors.forEach(e => fieldErrors[e.field] = e.message);
        setErrors(fieldErrors);
      }
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card">
          <SuccessScreen onReset={() => { setForm(initialForm); setErrors({}); setSubmitted(false); }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Share Your Feedback</h1>
        <p>We read every submission and use it to make things better.</p>
      </div>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name <span>*</span></label>
                <input className={`form-input ${errors.name ? 'error' : ''}`} type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
                {errors.name && <div className="error-msg">⚠ {errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address <span>*</span></label>
                <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
                {errors.email && <div className="error-msg">⚠ {errors.email}</div>}
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category <span>*</span></label>
                <select className={`form-select ${errors.category ? 'error' : ''}`} name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {errors.category && <div className="error-msg">⚠ {errors.category}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Overall Rating <span>*</span></label>
                <StarRating value={form.rating} onChange={val => { setForm(prev => ({ ...prev, rating: val })); if (errors.rating) setErrors(prev => ({ ...prev, rating: '' })); }} error={errors.rating} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Subject <span>*</span></label>
              <input className={`form-input ${errors.subject ? 'error' : ''}`} type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="Brief summary of your feedback" maxLength={200} />
              {errors.subject && <div className="error-msg">⚠ {errors.subject}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Message <span>*</span></label>
              <textarea className={`form-textarea ${errors.message ? 'error' : ''}`} name="message" value={form.message} onChange={handleChange} placeholder="Share your thoughts in detail..." maxLength={2000} rows={6} />
              {errors.message && <div className="error-msg">⚠ {errors.message}</div>}
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => { setForm(initialForm); setErrors({}); }} disabled={loading}>Reset</button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 160 }}>
                {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Submitting...</> : <>✦ Submit Feedback</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}