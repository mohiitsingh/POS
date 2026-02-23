import { useState, useEffect } from "react";
import { useSettings } from "../../../Contexts/SettingsContext";
import { useToast } from "../../../Contexts/ToastContext";
import { Save } from "lucide-react";

const BillingSettings = () => {
    const { billing, updateBilling } = useSettings();
    const { showSuccess, showError } = useToast();
    const [formData, setFormData] = useState(billing);

    // Sync form when billing loads asynchronously from Supabase
    useEffect(() => {
        setFormData(billing);
    }, [billing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Handle number inputs specifically
        const val = type === 'number' ? parseFloat(value) : value;
        setFormData({ ...formData, [name]: val });
    };

    const handleSave = () => {
        if (!formData.businessName) {
            showError("Business Name is required.");
            return;
        }
        if (formData.taxValue < 0 || formData.taxValueType === 'percentage' && formData.taxValue > 100) {
            showError("Invalid Tax Value.");
            return;
        }
        // Save
        updateBilling(formData);
        showSuccess("Billing settings saved successfully!");
    };

    return (
        <div className="settings-form-section">
            {/* Business Info */}
            <h2 className="section-title">Business Information</h2>
            <div className="form-group">
                <label className="form-label">Business Name</label>
                <input
                    type="text"
                    name="businessName"
                    className="form-input"
                    value={formData.businessName}
                    onChange={handleChange}
                />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">GST Number (Optional)</label>
                    <input
                        type="text"
                        name="gstNo"
                        className="form-input"
                        value={formData.gstNo}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">FSSAI Number (Optional)</label>
                    <input
                        type="text"
                        name="fssaiNo"
                        className="form-input"
                        value={formData.fssaiNo}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Business Address:</label>
                <input name="businessAdresss" className="form-input" id="businessAdresss"
                    value={formData.businessAdresss} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label className="form-label">Business Phone (Optional)</label>
                <input
                    type="tel"
                    name="businessPhone"
                    className="form-input"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.businessPhone ?? ''}
                    onChange={handleChange}
                />
            </div>

            {/* Tax Settings */}
            <h2 className="section-title" style={{ marginTop: '2rem' }}>Tax Settings</h2>
            <div className="form-group">
                <label className="form-label">Tax Type</label>
                <select
                    name="taxType"
                    className="form-select"
                    value={formData.taxType}
                    onChange={handleChange}
                >
                    <option value="forward">Forward Tax (Added to Bill)</option>
                    {/* Inclusive reserved for future implementation */}
                </select>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Value Type</label>
                    <div className="radio-group" style={{ height: '42px' }}>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="taxValueType"
                                value="percentage"
                                checked={formData.taxValueType === 'percentage'}
                                onChange={handleChange}
                            /> Percentage (%)
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="taxValueType"
                                value="fixed"
                                checked={formData.taxValueType === 'fixed'}
                                onChange={handleChange}
                            /> Fixed Amount
                        </label>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Tax Value</label>
                    <input
                        type="number"
                        name="taxValue"
                        className="form-input"
                        value={formData.taxValue}
                        onChange={handleChange}
                        min="0"
                    />
                    <span className="helper-text">
                        {formData.taxValueType === 'percentage'
                            ? 'Enter percentage (e.g. 5 for 5%)'
                            : 'Enter fixed amount per bill'}
                    </span>
                </div>
            </div>

            {/* Discount Settings */}
            <h2 className="section-title" style={{ marginTop: '2rem' }}>Default Discount</h2>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <div className="radio-group" style={{ height: '42px' }}>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="discountType"
                                value="percentage"
                                checked={formData.discountType === 'percentage'}
                                onChange={handleChange}
                            /> Percentage (%)
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="discountType"
                                value="fixed"
                                checked={formData.discountType === 'fixed'}
                                onChange={handleChange}
                            /> Fixed Amount
                        </label>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Default Value</label>
                    <input
                        type="number"
                        name="discountValue"
                        className="form-input"
                        value={formData.discountValue}
                        onChange={handleChange}
                        min="0"
                    />
                </div>
            </div>

            <div className="form-actions">
                <button className="btn-primary" onClick={handleSave}>
                    <Save size={18} /> Save Settings
                </button>
            </div>
        </div>
    );
};

export default BillingSettings;
