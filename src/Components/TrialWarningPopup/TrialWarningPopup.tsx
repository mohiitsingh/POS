import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import { AlertTriangle, X } from 'lucide-react';
import './TrialWarningPopup.css';

const TrialWarningPopup = () => {
    const { hasPaidSubscription, isFreeTrialActive, daysUntilTrialEnds } = useAuth();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = React.useState(true);

    // Only show if:
    // 1. Not already subscribed
    // 2. Free trial is still active (otherwise they get kicked to /onboarding)
    // 3. 7 or fewer days left
    // 4. User hasn't dismissed it this session
    if (hasPaidSubscription || !isFreeTrialActive || daysUntilTrialEnds > 7 || !isVisible) {
        return null;
    }

    return (
        <div className="trial-warning-banner">
            <div className="trial-warning-content">
                <AlertTriangle size={20} className="trial-warning-icon" />
                <div className="trial-warning-text">
                    <span className="trial-warning-title">Free Trial Expiring Soon</span>
                    <span className="trial-warning-desc">
                        Your free trial expires in <strong>{daysUntilTrialEnds} {daysUntilTrialEnds === 1 ? 'day' : 'days'}</strong>. 
                        To avoid service interruption, please subscribe now.
                    </span>
                </div>
            </div>
            
            <div className="trial-warning-actions">
                <button 
                    className="trial-warning-btn-subscribe"
                    onClick={() => navigate('/onboarding', { state: { explicitSubscribe: true } })}
                >
                    Subscribe Now
                </button>
                <button 
                    className="trial-warning-btn-dismiss"
                    onClick={() => setIsVisible(false)}
                    aria-label="Dismiss"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default TrialWarningPopup;
