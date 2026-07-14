import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, ReceiptIndianRupee, ShoppingBag, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";
import logo from "/logo.png";
import "./HomeHub.css";

const HomeHub = () => {
  const navigate = useNavigate();

  return (
    <div className="hub-page">
      <Helmet>
        <title>Arambh — Restaurant POS & Product Picks</title>
        <meta
          name="description"
          content="Arambh offers affordable billing software for restaurants and curated product recommendations. Explore our modules."
        />
      </Helmet>

      {/* Background Effects */}
      <div className="hub-bg-effects">
        <div className="hub-bg-orb orb-1" />
        <div className="hub-bg-orb orb-2" />
        <div className="hub-bg-orb orb-3" />
      </div>
      <div className="hub-grid-pattern" />

      {/* Content */}
      <div className="hub-content">
        {/* Navbar */}
        <nav className="hub-navbar">
          <img src={logo} alt="Arambh" className="hub-logo" />
          <div className="hub-nav-links">
            <Link to="/support" className="hub-nav-link">Support</Link>
            <button
              className="hub-nav-link primary"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section className="hub-hero">
          <span className="hub-hero-badge">
            <Sparkles size={14} /> Welcome to Arambh
          </span>
          <h1>
            One Platform,<br />
            <span className="hub-hero-highlight">Multiple Solutions.</span>
          </h1>
          <p>
            From restaurant billing to curated product picks — choose the module
            that fits your needs and get started instantly.
          </p>
        </section>

        {/* Module Cards */}
        <section className="hub-modules">
          <div className="hub-modules-grid">
            {/* POS Module */}
            <div
              className="hub-module-card"
              onClick={() => navigate("/pos")}
            >
              <div className="hub-card-icon pos">
                <ReceiptIndianRupee size={28} />
              </div>
              <span className="hub-card-badge live">Live</span>
              <h3 className="hub-card-title">POS Billing</h3>
              <p className="hub-card-desc">
                The fastest, most affordable billing software for restaurants &
                cafes in India. Generate bills in 3 clicks with real-time
                tracking and reports.
              </p>
              <span className="hub-card-action pos-action">
                Explore POS <ArrowRight size={16} />
              </span>
            </div>

            {/* Pinterest Module */}
            <div
              className="hub-module-card"
              onClick={() => navigate("/pin")}
            >
              <div className="hub-card-icon pinterest">
                <ShoppingBag size={28} />
              </div>
              <span className="hub-card-badge new">New</span>
              <h3 className="hub-card-title">Product Picks</h3>
              <p className="hub-card-desc">
                Curated product recommendations from our Pinterest.
                Hand-picked, reviewed, and compared — find the best products at
                the best prices.
              </p>
              <span className="hub-card-action pinterest-action">
                Browse Picks <ArrowRight size={16} />
              </span>
            </div>

            {/* Coming Soon */}
            <div className="hub-module-card disabled">
              <div className="hub-card-icon coming-soon">
                <Sparkles size={28} />
              </div>
              <span className="hub-card-badge soon">Coming Soon</span>
              <h3 className="hub-card-title">More Coming</h3>
              <p className="hub-card-desc">
                We're building more tools and modules to help your business
                grow. Stay tuned for exciting new features launching soon.
              </p>
              <span className="hub-card-action soon-action">
                Stay Tuned <ArrowRight size={16} />
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="hub-footer">
          <span className="hub-footer-text">&copy; 2026 Arambh. All rights reserved.</span>
          <div className="hub-footer-links">
            <Link to="/support">Support</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomeHub;
