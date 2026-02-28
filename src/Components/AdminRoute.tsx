import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

const ADMIN_EMAIL = "mohits0819@gmail.com";

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: "flex", justifyContent: "center",
                alignItems: "center", height: "100vh",
                fontSize: "1.1rem", color: "#6366f1",
                background: "#0f0f13", fontFamily: "Inter, sans-serif",
            }}>
                Verifying access…
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (user.email !== ADMIN_EMAIL) {
        return (
            <div style={{
                display: "flex", flexDirection: "column", justifyContent: "center",
                alignItems: "center", height: "100vh", gap: "1rem",
                background: "#0f0f13", fontFamily: "Inter, sans-serif", color: "#fff",
                textAlign: "center",
            }}>
                <span style={{ fontSize: "3rem" }}>🚫</span>
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Access Denied</h2>
                <p style={{ color: "#64748b", margin: 0 }}>You don't have permission to view this page.</p>
            </div>
        );
    }

    return <Outlet />;
};

export default AdminRoute;
