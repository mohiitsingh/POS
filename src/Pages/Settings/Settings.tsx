import { useState } from "react";
import ProfileSettings from "./Components/ProfileSettings";
import BillingSettings from "./Components/BillingSettings";
import PrinterSettings from "./Components/PrinterSettings";
import "./Settings.css";

const Settings = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'printer'>('profile');

    return (
        <div className="settings-container">
            <header className="settings-header">
                <h1>Settings</h1>
            </header>

            <div className="settings-tabs">
                <button
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </button>
                <button
                    className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('billing')}
                >
                    Billing Configuration
                </button>
                <button
                    className={`tab-btn ${activeTab === 'printer' ? 'active' : ''}`}
                    onClick={() => setActiveTab('printer')}
                >
                    Printer Settings
                </button>
            </div>

            <div className="settings-content">
                {activeTab === 'profile' ? <ProfileSettings /> : activeTab === 'billing' ? <BillingSettings /> : <PrinterSettings />}
            </div>
        </div>
    );
};

export default Settings;
