import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ArrowRight,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Menu,
  ReceiptIndianRupee,
} from "lucide-react";
import logo from "/public/logo.png"
import "./LandingPage.css";

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  return (
    <div className="app">
      {/* Hero Container (Wrapper including Navbar) */}
      <div className="hero-wrapper">
        <nav className={`navbar-floating ${scrolled ? "scrolled" : ""}`}>
          <div className="logo">
            <img src={logo} alt="Bill Easy" className="logo-img" />
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button className="btn-login" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="menu-toggle" style={{ display: "none" }}>
              <Menu />
            </button>
          </div>
        </nav>

        <section className="hero-centered">
          <div className="hero-content-center">
            <span className="hero-badge-pill">✨ New Launch Offer</span>
            <h1>
              Generate Bills in <br className="break-desktop" />
              <span className="text-highlight">3 Clicks</span>.
            </h1>
            <p>
              The fastest, most affordable POS for small cafes and restaurants.{" "}
              <br className="break-desktop" />
              Handle orders easily and track revenue instantly.
            </p>

            <div className="center-actions">
              <div className="email-input-wrapper">
                <input type="email" placeholder="Enter your email address" />
                <button className="btn-primary-solid">
                  See a demo <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="hero-image-floating">
              {/* Realistic POS Card */}
              <div className="pos-card-main">
                <div className="pos-header">
                  <div className="pos-dot red"></div>
                  <div className="pos-dot yellow"></div>
                  <div className="pos-dot green"></div>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.8rem",
                      opacity: 0.7,
                    }}
                  >
                    Table 4 • Running
                  </span>
                </div>
                <div className="pos-body">
                  <div className="order-item">
                    <span>Cappuccino</span>
                    <span>₹4.50</span>
                  </div>
                  <div className="order-item">
                    <span>Bagel</span>
                    <span>₹3.00</span>
                  </div>
                  <div className="order-item">
                    <span>Avocado Toast</span>
                    <span>₹8.50</span>
                  </div>
                  <div className="pos-total-btn">Charge ₹16.00</div>
                </div>
              </div>

              {/* Floating Badges */}
              <div className="float-badge left">
                <ChefHat size={20} /> Kitchen Ready
              </div>
              <div className="float-badge right">
                <ReceiptIndianRupee size={20} /> Bill Printed
              </div>
            </div>
          </div>

          {/* Logos Marquee */}
          <div className="hero-logos">
            <span>Trusted by 500+ Cafes</span>
            <div className="logo-row">
              <span className="brand-logo">CafeCoffee</span>
              <span className="brand-logo">BurgerBros</span>
              <span className="brand-logo">PizzaHut</span>
              <span className="brand-logo">TacoBell</span>
              <span className="brand-logo">Starbucks</span>
            </div>
          </div>
        </section>
      </div>

      {/* 3-Click Magic */}
      <section id="how-it-works" className="process-section">
        <h2 className="section-title">
          The <span className="text-gradient">3-Click Magic</span>
        </h2>
        <div className="process-grid-container">
          <div className="process-step-card">
            <div className="step-number">1</div>
            <div className="icon-box">
              <Menu size={48} />
            </div>
            <h3>Select Items</h3>
            <p>Tap items to add to order</p>
          </div>

          <div className="step-connector">
            <ArrowRight size={32} />
          </div>

          <div className="process-step-card">
            <div className="step-number">2</div>
            <div className="icon-box">
              <ReceiptIndianRupee size={48} />
            </div>
            <h3>Generate Bill</h3>
            <p>One tap to finalize</p>
          </div>

          <div className="step-connector">
            <ArrowRight size={32} />
          </div>

          <div className="process-step-card dual-print-card">
            <div className="step-number">3</div>
            <div
              className="icon-box"
              style={{
                background: "transparent",
                height: "auto",
                marginBottom: "1rem",
              }}
            >
              <div className="dual-print-visual">
                <div className="mini-receipt chef-token">
                  <ChefHat size={20} />
                  <span>KOT</span>
                </div>
                <div className="mini-receipt customer-bill">
                  <ReceiptIndianRupee size={20} />
                  <span>Bill</span>
                </div>
              </div>
            </div>
            <h3>Dual Print</h3>
            <p>Kitchen Token + Customer Bill</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="features-text">
          <h2
            className="section-title"
          >
            Track  Everything, 
            <span className="text-gradient">Effortlessly.</span>
          </h2>
          <div className="feature-list-cards">
            <div className="feature-card">
              <div className="check-icon-box">
                <Check size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>
                  Real-time Tracking
                </h4>
                <p style={{ color: "var(--color-text-light)" }}>
                  Monitor every sale as it happens.
                </p>
              </div>
            </div>
            <div className="feature-card">
              <div className="check-icon-box">
                <Check size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>
                  Best Sellers
                </h4>
                <p style={{ color: "var(--color-text-light)" }}>
                  Identify your top dishes instantly.
                </p>
              </div>
            </div>
            <div className="feature-card">
              <div className="check-icon-box">
                <Check size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>
                  Automated Reports
                </h4>
                <p style={{ color: "var(--color-text-light)" }}>
                  PDF reports delivered to your inbox.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NEW Dashboard Mockup */}
        <div className="dashboard-wrapper">
          {/* Main Dashboard Card */}
          <div className="dashboard-card main-stats">
            <div className="card-header">
              <span>Sales Projection</span>
              <span className="badge-green">+12%</span>
            </div>
            <div className="sales-graph">
              <div className="bar" style={{ height: "40%" }}></div>
              <div className="bar" style={{ height: "65%" }}></div>
              <div className="bar" style={{ height: "50%" }}></div>
              <div className="bar" style={{ height: "85%" }}></div>
              <div className="bar" style={{ height: "60%" }}></div>
              <div className="bar highlight" style={{ height: "95%" }}></div>
              <div className="bar" style={{ height: "70%" }}></div>
            </div>
            <div className="graph-days">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>
          </div>

          {/* Pie Chart Card - Floating */}
          <div className="dashboard-card float-card pie-card">
            <h4>Top Items</h4>
            <div className="pie-chart-container">
              <div className="pie-chart"></div>
              <div className="pie-legend">
                <div className="legend-item">
                  <span className="dot yellow"></span>Coffee
                </div>
                <div className="legend-item">
                  <span className="dot green"></span>Food
                </div>
                <div className="legend-item">
                  <span className="dot red"></span>Drinks
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card - Floating */}
          <div className="dashboard-card float-card stats-card">
            <div className="icon-stat-box">
              <ArrowRight size={16} />
            </div>
            <div>
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">₹9,45,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Benefits */}
      <section id="pricing" className="benefits-section">
        <div className="pricing-grid-header">
          <h2 className="section-title">
            Simple Pricing.{" "}
            <span className="text-gradient">No Hidden Fees.</span>
          </h2>
          <p
            style={{
              fontSize: "1.2rem",
              color: "var(--color-text-light)",
              marginBottom: "4rem",
            }}
          >
            Choose the plan that suits your growth.
          </p>
        </div>

        <div className="pricing-grid">
          {/* Monthly Card */}
          <div className="pricing-card basic">
            <div className="card-badge">Flexible</div>
            <h3>Monthly</h3>
            <p>Perfect for testing the waters</p>
            <div className="price-block">
              <span className="currency">₹</span>
              <span className="amount">999</span>
              <span className="period">/mo</span>
            </div>
            <ul className="pricing-features">
              <li>
                <Check size={16} /> All Features Included
              </li>
              <li>
                <Check size={16} /> Max 500 Bills/mo
              </li>
              <li>
                <Check size={16} /> Email Support
              </li>
            </ul>
            <button className="btn-outline pricing-btn" onClick={() => navigate("/login")}>Start Trial</button>
          </div>

          {/* 6 Months Card */}
          <div className="pricing-card pro active-glow">
            <div className="card-badge popular">Most Popular</div>
            <div className="discount-pill">Save 10%</div>
            <h3>6 Months</h3>
            <p>For growing cafes</p>
            <div className="price-block">
              <span className="currency">₹</span>
              <span className="amount">899</span>
              <span className="period">/mo</span>
              <span className="old-price">₹999</span>
            </div>
            <ul className="pricing-features">
              <li>
                <Check size={16} /> All Monthly Features
              </li>
              <li>
                <Check size={16} /> <strong>Unlimited</strong> Bills
              </li>
              <li>
                <Check size={16} /> Priority Support
              </li>
            </ul>
            <button className="btn-primary pricing-btn" onClick={() => navigate("/login")}>Get Started</button>
          </div>

          {/* 12 Months Card */}
          <div className="pricing-card elite">
            <div className="card-badge best-value">Best Value</div>
            <div className="discount-pill">Save 30%</div>
            <h3>12 Months</h3>
            <p>Maximum savings for pros</p>
            <div className="price-block">
              <span className="currency">₹</span>
              <span className="amount">699</span>
              <span className="period">/mo</span>
              <span className="old-price">₹999</span>
            </div>
            <ul className="pricing-features">
              <li>
                <Check size={16} /> Everything in 6 Months
              </li>
              <li>
                <Check size={16} /> Dedicated Account Manager
              </li>
              <li>
                <Check size={16} /> Free Layout Setup
              </li>
            </ul>
            <button
              className="btn-primary-solid pricing-btn"
              style={{ width: "100%" }} onClick={() => navigate("/login")}
            >
              Go Annual
            </button>
          </div>
        </div>

        <p
          style={{
            fontSize: "0.875rem",
            marginTop: "3rem",
            color: "var(--color-text-light)",
          }}
        >
          All plans include a 14-day free trial • No subscription required
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {[
            {
              q: "Is it hard to install?",
              a: "No, it's cloud-based and ready instantly. You can start billing in minutes without any complex setup.",
            },
            {
              q: "Do I need special hardware?",
              a: "No, it works on standard devices (laptops, tablets, phones) and connects with most standard thermal printers.",
            },
            {
              q: "Is my business data secure?",
              a: "Yes, we use enterprise-grade cloud security with regular backups to ensure your data is always safe and accessible.",
            },
          ].map((item, i) => (
            <div className="faq-item" key={i}>
              <button className="faq-question" onClick={() => toggleFaq(i)}>
                {item.q}
                {openFaq === i ? (
                  <ChevronUp color="var(--color-primary)" />
                ) : (
                  <ChevronDown />
                )}
              </button>
              <div
                className="faq-answer"
                style={{
                  maxHeight: openFaq === i ? "200px" : "0",
                  opacity: openFaq === i ? 1 : 0,
                  overflow: "hidden",
                  padding: openFaq === i ? "0 2rem 1.5rem" : "0 2rem 0",
                  transition: "all 0.3s ease",
                }}
              >
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner Area */}
      <section className="cta-section-wrapper">
        <div className="cta-banner">
          <div className="cta-content">
            <span className="badge-pill-white">
              <Check size={14} /> No credit card required
            </span>
            <h2>
              Ready to simplify <br />
              your billing forever?
            </h2>
            <p>
              Join 500+ cafes generating bills in 3 clicks. <br />
              Start your 14-day free trial today.
            </p>
            <div className="cta-actions">
              <button className="btn-white-solid">
                Get Started Free <ArrowRight size={18} />
              </button>
              <button className="btn-transparent">Book a Demo</button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="cta-decorations">
            <div className="circle-blur c1"></div>
            <div className="circle-blur c2"></div>
            <div className="pattern-grid"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="logo">
          <img src={logo} alt="Bill Easy" className="logo-img" />
        </div>
        <div className="footer-links">
          <span>&copy; 2026 Bill Easy</span>
          <a href="#">Support</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
