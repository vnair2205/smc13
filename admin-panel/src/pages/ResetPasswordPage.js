import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const { token } = useParams();
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        try {
            await axios.post(`/api/admin/reset-password/${token}`, { password });
            setMessage('Password has been successfully reset. You can now log in.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setMessage('Failed to reset password. The link may be invalid or expired.');
        }
    };

    return (
        <div style={{ padding: '50px' }}>
            <h1>Reset Your Password</h1>
            <form onSubmit={onSubmit}>
                <div>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginTop: '20px' }}>
                    <input type="submit" value="Reset Password" />
                </div>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPasswordPage;