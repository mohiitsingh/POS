import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';

const ProtectedRoute = () => {
    const { user, loading, hasPaidSubscription, subscriptionLoading, isFreeTrialActive } = useAuth();

    if (loading || subscriptionLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem',
                color: 'var(--primary-color)'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (!hasPaidSubscription && !isFreeTrialActive) return <Navigate to="/onboarding" replace />;

    return <Outlet />;
};

export default ProtectedRoute;

