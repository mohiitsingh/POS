import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import "./Skeleton.css";

/**
 * OnboardingRoute – allows only logged-in users.
 * If the user already has an active subscription, redirect to /dashboard.
 * Otherwise render the Outlet (the onboarding page).
 */
const OnboardingRoute = () => {
    const { user, loading, hasPaidSubscription, subscriptionLoading, isFreeTrialActive } = useAuth();
    const location = useLocation();

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
    
    // Allow if user intentionally clicked "Subscribe Now" during free trial
    const isExplicitSubscribe = location.state?.explicitSubscribe === true;
    
    if (hasPaidSubscription || (isFreeTrialActive && !isExplicitSubscribe)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default OnboardingRoute;
