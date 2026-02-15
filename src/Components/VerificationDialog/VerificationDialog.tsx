import { Mail, X, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import './VerificationDialog.css';

interface VerificationDialogProps {
    email: string;
    onClose: () => void;
    onResend: () => Promise<void>;
}

const VerificationDialog = ({ email, onClose, onResend }: VerificationDialogProps) => {
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const handleResend = async () => {
        setIsResending(true);
        setResendSuccess(false);
        try {
            await onResend();
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to resend email:', error);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="verification-overlay" onClick={onClose}>
            <div className="verification-dialog" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose} aria-label="Close">
                    <X size={20} />
                </button>

                <div className="verification-icon">
                    <Mail size={48} />
                </div>

                <h2 className="verification-title">Check Your Email</h2>

                <p className="verification-message">
                    We've sent a verification link to
                </p>
                <p className="verification-email">{email}</p>

                <p className="verification-instructions">
                    Click the link in the email to verify your account and get started.
                </p>

                {resendSuccess && (
                    <div className="resend-success">
                        ✓ Verification email sent successfully!
                    </div>
                )}

                <div className="verification-actions">
                    <button
                        className="btn-resend"
                        onClick={handleResend}
                        disabled={isResending}
                    >
                        {isResending ? (
                            <>
                                <RefreshCw size={16} className="spinning" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={16} />
                                Resend Email
                            </>
                        )}
                    </button>
                    <button className="btn-close-dialog" onClick={onClose}>
                        Close
                    </button>
                </div>

                <p className="verification-note">
                    Didn't receive the email? Check your spam folder or click resend.
                </p>
            </div>
        </div>
    );
};

export default VerificationDialog;
