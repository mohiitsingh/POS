import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';

/**
 * OnboardingRoute – allows only logged-in users.
 * If the user already has an active subscription, redirect to /dashboard.
 * Otherwise render the Outlet (the onboarding page).
 */
const OnboardingRoute = () => {
    const { user, loading, hasPaidSubscription, subscriptionLoading } = useAuth();

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
    if (hasPaidSubscription) return <Navigate to="/dashboard" replace />;

    return <Outlet />;
};

export default OnboardingRoute;
