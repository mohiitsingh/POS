import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import "./Skeleton.css";

const ProtectedRoute = () => {
    const { user, loading, hasPaidSubscription, subscriptionLoading, isFreeTrialActive } = useAuth();

    if (loading || subscriptionLoading) {
        return (
            <div className="skeleton-grid">
      {[1, 2, 3].map((item) => (
        <div key={item} className="skeleton-card">
          <div className="skeleton badge"></div>

          <div className="skeleton title"></div>

          <div className="skeleton text"></div>
          <div className="skeleton text short"></div>

          <div className="skeleton price"></div>

          <div className="features">
            {[1, 2, 3, 4].map((feature) => (
              <div
                key={feature}
                className="skeleton feature"
              ></div>
            ))}
          </div>

          <div className="skeleton button"></div>
        </div>
      ))}
    </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (!hasPaidSubscription && !isFreeTrialActive) return <Navigate to="/onboarding" replace />;

    return <Outlet />;
};

export default ProtectedRoute;

