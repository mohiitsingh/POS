import "../Privacy/Privacy.css";
import { ChevronLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Support = () => {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <Link to="/" className="back-link">
          <ChevronLeft size={20} /> Back to Home
        </Link>
        <h1>Support</h1>
        <p className="last-updated">We're here to help you succeed.</p>

        <section className="policy-section">
          <h2>Contact Us</h2>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Mail size={18} color="var(--color-primary)" />
            <a href="mailto:support@arambh.in" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
              support@arambhonline.in
            </a>
          </p>
        </section>

        <section className="policy-section" style={{ marginTop: '3rem' }}>
          <h2>Frequently Asked Questions</h2>
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>How do I change my billing plan?</h3>
            <p>You can upgrade or downgrade your plan anytime by contacting us.</p>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Does it work without internet?</h3>
            <p>A stable internet connection is recommended for real-time syncing.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Support;
