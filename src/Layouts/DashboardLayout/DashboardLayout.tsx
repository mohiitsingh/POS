
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import TrialWarningPopup from "../../Components/TrialWarningPopup/TrialWarningPopup";
import "./DashboardLayout.css";

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className="main-content">
                <TrialWarningPopup />
                
                {/* Mobile Header with Toggle */}
                <div className="mobile-header">
                    <button
                        className="menu-toggle"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    <span className="mobile-brand">Arambh</span>
                </div>

                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
