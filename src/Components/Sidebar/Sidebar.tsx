
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    UtensilsCrossed,
    Armchair,
    FileBarChart,
    Settings,
    LogOut,
    TrendingUp,
} from "lucide-react";
import logo from "../../assets/logo.png"
import "./Sidebar.css";
import { useAuth } from "../../Contexts/AuthContext";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const isCollapsed = false; // Collapsed state currently disabled/unused

    // Get user info from auth context
    const userName = user?.user_metadata?.fullName || user?.email?.split('@')[0] || "User";
    // const userRole = user?.user_metadata?.role || "Staff";
    const userRole = "Owner";
    const userAvatar = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff`;

    const navItems = [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Menu Management", path: "/menu-management", icon: UtensilsCrossed },
        { label: "Orders History", path: "/orders", icon: FileBarChart },
        { label: "Tables", path: "/tables", icon: Armchair },
        { label: "Reports", path: "/reports", icon: TrendingUp },
        { label: "Settings", path: "/settings", icon: Settings },
    ];

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even if signOut fails
            navigate('/login', { replace: true });
        }
    };

    return (
        <aside className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isOpen ? "mobile-open" : ""}`}>
            {/* 1. Branding Section */}
            <div className="sidebar-header">
                <Link to="/dashboard" className="sidebar-brand" onClick={onClose}>
                    <div className="brand-logo">
                        {/* <span className="logo-icon">💠</span> */}
                        <img src={logo} alt="Bill Easy" className="logo-img" />
                    </div>
                    {!isCollapsed && <span className="brand-name">Arambh</span>}
                </Link>
            </div>

            {/* 2. User Profile Section */}
            <div className="sidebar-user">
                <div className="user-avatar">
                    <img src={userAvatar} alt={userName} />
                </div>
                {!isCollapsed && (
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className="user-role">{userRole}</span>
                    </div>
                )}
            </div>

            {/* 3. Navigation Menu */}
            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path} className="nav-item">
                                <Link
                                    to={item.path}
                                    className={`nav-link ${isActive ? "active" : ""}`}
                                    title={isCollapsed ? item.label : ""}
                                    onClick={onClose}
                                >
                                    <Icon size={20} className="nav-icon" />
                                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* 4. Logout (Bottom Fixed) */}
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn" title="Logout">
                    <LogOut size={20} className="logout-icon" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
