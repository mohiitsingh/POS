import { useState } from "react";
import { useSettings } from "../../../Contexts/SettingsContext";
import { useToast } from "../../../Contexts/ToastContext";
import { Save } from "lucide-react";

const ProfileSettings = () => {
    const { profile, updateProfile } = useSettings();
    const { showSuccess, showError } = useToast();
    const [formData, setFormData] = useState(profile);

    // Password State
    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // Validation logic could go here
        if (!formData.firstName || !formData.email) {
            showError("Name and Email are required");
            return;
        }
        updateProfile(formData);

        // Mock password save
        if (passwordData.newPassword) {
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                showError("Passwords do not match");
                return;
            }
            // Regex for 8 chars, 1 number, 1 special
            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
            if (!passwordRegex.test(passwordData.newPassword)) {
                showError("Password must be at least 8 characters with 1 number and 1 special char.");
                return;
            }
            showSuccess("Profile and Password updated successfully!");
            setPasswordData({ newPassword: "", confirmPassword: "" });
        } else {
            showSuccess("Profile updated successfully!");
        }
    };

    return (
        <div className="settings-form-section">
            <h2 className="section-title">Personal Information</h2>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        className="form-input"
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        className="form-input"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        className="form-input"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                        type="tel"
                        name="mobile"
                        className="form-input"
                        value={formData.mobile}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <h2 className="section-title" style={{ marginTop: '2rem' }}>Change Password</h2>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                        type="password"
                        name="newPassword"
                        className="form-input"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Min 8 chars, 1 number, 1 special"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        className="form-input"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Retype password"
                    />
                </div>
            </div>

            <div className="form-actions">
                <button className="btn-primary" onClick={handleSave}>
                    <Save size={18} /> Save Profile
                </button>
            </div>
        </div>
    );
};

export default ProfileSettings;
