import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';

const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
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

    // If user is already logged in, redirect to dashboard
    return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
