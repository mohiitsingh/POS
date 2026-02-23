import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import './EmailVerification.css';

const EmailVerification = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Get the hash from URL (Supabase sends verification as hash)
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const type = hashParams.get('type');

                if (type === 'signup' && accessToken) {
                    // Email is already verified by Supabase when user clicks the link
                    setStatus('success');
                    setMessage('Email verified successfully! Redirecting to dashboard...');

                    // Wait a moment to show success message, then redirect
                    setTimeout(() => {
                        navigate('/dashboard', { replace: true });
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage('Invalid verification link. Please try again or contact support.');
                }
            } catch (error: any) {
                console.error('Verification error:', error);
                setStatus('error');
                setMessage(error.message || 'Failed to verify email. Please try again.');
            }
        };

        verifyEmail();
    }, [navigate]);

    return (
        <div className="verification-page">
            <div className="verification-container">
                <div className={`verification-status ${status}`}>
                    {status === 'verifying' && (
                        <div className="spinner"></div>
                    )}
                    {status === 'success' && (
                        <div className="success-icon">✓</div>
                    )}
                    {status === 'error' && (
                        <div className="error-icon">✕</div>
                    )}
                </div>

                <h1 className="verification-heading">
                    {status === 'verifying' && 'Verifying Email'}
                    {status === 'success' && 'Email Verified!'}
                    {status === 'error' && 'Verification Failed'}
                </h1>

                <p className="verification-text">{message}</p>

                {status === 'error' && (
                    <button
                        className="btn-back-to-login"
                        onClick={() => navigate('/login')}
                    >
                        Back to Login
                    </button>
                )}
            </div>
        </div>
    );
};

export default EmailVerification;
