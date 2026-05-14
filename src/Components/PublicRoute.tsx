import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import "./Skeleton.css";

const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="skeleton-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="skeleton-card">
            <div className="skeleton badge"></div>

            <div className="skeleton title"></div>

            <div className="skeleton text"></div>
            <div className="skeleton text short"></div>

            <div className="skeleton price"></div>

            <div className="features">
              {[1, 2, 3, 4].map((feature) => (
                <div key={feature} className="skeleton feature"></div>
              ))}
            </div>

            <div className="skeleton button"></div>
          </div>
        ))}
      </div>
    );
  }

  // If user is already logged in, redirect to dashboard
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
