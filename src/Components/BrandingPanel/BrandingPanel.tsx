
import "./BrandingPanel.css";
import illustration from "../../assets/pos_dashboard_illustration.png";

const BrandingPanel = () => {
    return (
        <div className="branding-panel">
            <div className="branding-content">
                <h2 className="branding-title">
                    Effortlessly manage your restaurant
                    <br /> and operations.
                </h2>
                <p className="branding-subtitle">
                    Log in to access your POS dashboard and manage your orders, inventory, and staff.
                </p>

                <div className="illustration-container">
                    <img src={illustration} alt="POS Dashboard" className="branding-illustration" />

                    {/* Abstract background elements could go here */}
                    <div className="floating-card card-1">
                        <div className="card-content">
                            <span>Total Sales</span>
                            <strong>₹12,450</strong>
                        </div>
                    </div>
                    <div className="floating-card card-2">
                        <div className="card-content">
                            <span>Active Orders</span>
                            <strong>24</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandingPanel;
