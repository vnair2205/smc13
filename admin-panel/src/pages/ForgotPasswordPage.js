import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const onSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post('/api/admin/forgot-password', { email });
      setMessage('If an account with that email exists, a password reset link has been sent.');
    } catch (err) {
      setMessage('Error sending email. Please try again later.');
    }
  };

  return (
    <div style={{ padding: '50px' }}>
      <h1>Forgot Password</h1>
      <p>Enter your email to receive a password reset link.</p>
      <form onSubmit={onSubmit}>
        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div style={{ marginTop: '20px' }}>
          <input type="submit" value="Submit" />
          <Link to="/login"><button type="button">Cancel</button></Link>
        </div>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPasswordPage;