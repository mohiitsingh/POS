import { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";
import { useNavigate, Link } from "react-router-dom";
import {
  Check,
  ArrowRight,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Menu,
  ReceiptIndianRupee,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import logo from "/logo.png";
import "./LandingPage.css";
import type { RecommendedPrinter } from "../Printers/PrintersPage";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet-async";

interface Plan {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badge_class: string;
  price_per_month: number;
  old_price: number | null;
  discount_label: string | null;
  total_label: string;
  features: string[];
}

const CARD_CLASS: Record<string, string> = {
  monthly: "basic",
  sixmonths: "pro active-glow",
  annual: "elite",
};

const BTN_CLASS: Record<string, string> = {
  monthly: "btn-outline pricing-btn",
  sixmonths: "btn-primary pricing-btn",
  annual: "btn-primary-solid pricing-btn",
};

const BTN_LABEL: Record<string, string> = {
  monthly: "Start Trial",
  sixmonths: "Get Started",
  annual: "Go Annual",
};

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  // Demo Modal State
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoFormType, setDemoFormType] = useState<"demo" | "custom_pos">("demo");
  const [demoForm, setDemoForm] = useState({
    name: "",
    phone: "",
    email: "",
    state: "",
    city: "",
  });
  const [demoSubmitStatus, setDemoSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [demoErrorMessage, setDemoErrorMessage] = useState("");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [previewPrinters, setPreviewPrinters] = useState<RecommendedPrinter[]>(
    [],
  );

  useEffect(() => {
    supabase
      .from("plans")
      .select(
        "id, title, subtitle, badge, badge_class, price_per_month, old_price, discount_label, total_label, features",
      )
      .then(({ data }) => {
        if (data) setPlans(data as Plan[]);
      });
  }, []);

  useEffect(() => {
    const fetchPreviewPrinters = async () => {
      const { data } = await supabase
        .from("recommended_printers")
        .select("*")
        .limit(3)
        .order("created_at", { ascending: false });
      if (data) setPreviewPrinters(data as RecommendedPrinter[]);
    };
    fetchPreviewPrinters();
  }, []);

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

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit: 60 seconds cooldown
    const lastSubmitTime = localStorage.getItem("last_demo_request_time");
    if (lastSubmitTime && Date.now() - parseInt(lastSubmitTime) < 30000) {
      setDemoSubmitStatus("error");
      setDemoErrorMessage(
        "You're doing that too fast. Please wait a minute and try again.",
      );
      return;
    }

    setDemoSubmitStatus("submitting");
    setDemoErrorMessage("");

    const sName = DOMPurify.sanitize(demoForm.name.trim());
    const sPhone = DOMPurify.sanitize(demoForm.phone.trim());
    const sEmail = DOMPurify.sanitize(demoForm.email.trim());
    const sState = DOMPurify.sanitize(demoForm.state.trim());
    const sCity = DOMPurify.sanitize(demoForm.city.trim());

    // --- Validation ---
    if (sName.length < 2) {
      setDemoSubmitStatus("error");
      setDemoErrorMessage("Please enter a valid full name.");
      return;
    }

    // Basic 10-digit Indian phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(sPhone)) {
      setDemoSubmitStatus("error");
      setDemoErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    if (sEmail !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sEmail)) {
        setDemoSubmitStatus("error");
        setDemoErrorMessage("Please enter a valid email address.");
        return;
      }
    }

    if (sState.length < 2 || sCity.length < 2) {
      setDemoSubmitStatus("error");
      setDemoErrorMessage("Please enter a valid state and city.");
      return;
    }
    // ------------------

    try {
      const { error } = await supabase.from("demo_requests").insert([
        {
          name: sName,
          phone: sPhone,
          email: sEmail,
          state: sState,
          city: sCity,
          request_type: demoFormType,
        },
      ]);

      if (error) throw error;

      localStorage.setItem("last_demo_request_time", Date.now().toString());
      setDemoSubmitStatus("success");
    } catch (err: any) {
      console.error("Demo submission failed:", err);
      setDemoSubmitStatus("error");
      setDemoErrorMessage(err.message || "Failed to submit request.");
    }
  };

  const openDemoModal = (type: "demo" | "custom_pos" = "demo") => {
    setDemoFormType(type);
    setIsDemoModalOpen(true);
  };

  const closeDemoModal = () => {
    setIsDemoModalOpen(false);
    setDemoSubmitStatus("idle");
    setDemoForm({ name: "", phone: "", email: "", state: "", city: "" });
    setDemoFormType("demo");
  };

  return (
    <div className="app">
      <Helmet>
        <title>Billing Software for Restaurants in India | Arambh</title>
        <meta
          name="description"
          content="Affordable POS system for restaurants and cafes in India. Generate bills, track sales, and grow your business."
        />
      </Helmet>
      {/* Hero Container (Wrapper including Navbar) */}
      <div className="hero-wrapper">
        <nav className={`navbar-floating ${scrolled ? "scrolled" : ""}`}>
          <div className="logo">
            <img src={logo} alt="arambh logo" className="logo-img" />
          </div>
          <div className="nav-links">
            <a href="/">Home</a>
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
            <span className="hero-badge-pill">
              ✨ New Launch Offer - Free For 2 Months
            </span>
            <h1>
              Generate Bills in <br className="break-desktop" />
              <span className="text-highlight">3 Clicks</span>.
            </h1>
            <p>
              The fastest, most affordable POS for Restaurants & Cafes in India.{" "}
              <br className="break-desktop" />
              Handle orders easily and track revenue instantly.
            </p>

            <div className="center-actions">
              <div className="cta-actions">
                <button
                  className="btn-white-solid"
                  onClick={() => navigate("/login")}
                >
                  Start Free Trial (2 Months Free)
                  <ArrowRight size={18} />
                </button>
                <button
                  className="btn-transparent"
                  onClick={() => setIsDemoModalOpen(true)}
                >
                  Book a Demo
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
                    <span>₹40.00</span>
                  </div>
                  <div className="order-item">
                    <span>Brownie</span>
                    <span>₹30.00</span>
                  </div>
                  <div className="order-item">
                    <span>Avocado Toast</span>
                    <span>₹80.00</span>
                  </div>
                  <div className="pos-total-btn">Charge ₹150.00</div>
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
            <span>Trusted by 500+ cafes and restaurants across India</span>
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
          <h2 className="section-title">
            Track Everything,
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
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card ${CARD_CLASS[plan.id] ?? "basic"}`}
            >
              <div className={`card-badge ${plan.badge_class}`}>
                {plan.badge}
              </div>
              {plan.discount_label && (
                <div className="discount-pill">{plan.discount_label}</div>
              )}
              <h3>{plan.title}</h3>
              <p>{plan.subtitle}</p>
              <div className="price-block">
                <span className="currency">₹</span>
                <span className="amount">{plan.price_per_month}</span>
                <span className="period">/mo</span>
                {plan.old_price && (
                  <span className="old-price">₹{plan.old_price}</span>
                )}
              </div>
              <ul className="pricing-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <Check size={16} /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={BTN_CLASS[plan.id] ?? "btn-outline pricing-btn"}
                style={{ width: "100%" }}
                onClick={() => navigate("/login")}
              >
                {BTN_LABEL[plan.id] ?? "Get Started"}
              </button>
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: "0.875rem",
            marginTop: "3rem",
            color: "var(--color-text-light)",
          }}
        >
          All plans include a 2-month free trial • No subscription required
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
              a: "No, it works on standard devices(laptop or desktop) and connects with most standard thermal printers.",
            },
            {
              q: "Is my business data secure?",
              a: "Yes, we use enterprise-grade cloud security with regular backups to ensure your data is always safe and accessible.",
            },
            {
              q: "Can I customise the software according to my need?",
              a: "Yes, we provide 100% customisation, for that you need to contact us by filling the form. And our team will contact.",
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

      {/* Recommended Printers Section */}
      {previewPrinters.length > 0 && (
        <section
          className="benefits-section"
          id="printers"
          style={{
            backgroundColor: "var(--color-bg)",
            padding: "4rem 2rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <div className="pricing-grid-header">
            <h2 className="section-title">
              Top <span className="text-gradient">Recommended</span> Printers
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--color-text-light)",
                marginBottom: "3rem",
                maxWidth: "600px",
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              Ensure a seamless billing experience with our tested and verified
              thermal printers.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "2rem",
                maxWidth: "1000px",
                margin: "2rem auto",
                textAlign: "left",
              }}
            >
              {previewPrinters.map((printer) => (
                <div
                  key={printer.id}
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      height: "200px",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "1rem",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <img
                      src={printer.image_url}
                      alt={printer.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        marginBottom: "0.5rem",
                        color: "var(--color-text)",
                      }}
                    >
                      {printer.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--color-text-light)",
                        marginBottom: "1.5rem",
                        flexGrow: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {printer.description}
                    </p>
                    <a
                      href={printer.buy_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary-solid"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "0.5rem",
                        textDecoration: "none",
                      }}
                    >
                      Buy Now <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn-outline"
              style={{
                display: "flex",
                padding: "0.5rem 1rem",
                borderRadius: "12px",
                margin: "2rem auto 0",
                alignItems: "center",
                gap: "0.5rem",
              }}
              onClick={() => navigate("/thermal-printers")}
            >
              View More <ArrowRight size={18} />
            </button>
          </div>
        </section>
      )}
{/* Customizable POS Section */}
      <section className="features-section customisable-section" >
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <span className="badge-pill-white" style={{ background: "rgba(var(--color-primary-rgb), 0.1)", color: "var(--color-primary)", border: "1px solid rgba(var(--color-primary-rgb), 0.2)" }}>
            <ChefHat size={14} style={{ display: "inline-block", verticalAlign: "middle" }} /> Enterprise Solution
          </span>
          <h2 className="section-title" style={{ marginTop: "1rem" }}>
            Need a <span className="text-gradient">Customizable POS</span>?
          </h2>
          <p style={{ color: "var(--color-text-light)", fontSize: "1.1rem", marginBottom: "1rem" }}>
            Want to own the software for your business? We offer fully customizable POS solutions tailored to your specific workflow, branding, and hardware requirements.
          </p>
          <button className="btn-primary-solid" onClick={() => openDemoModal("custom_pos")} style={{ padding: "0.75rem 2rem", fontSize: "1.1rem" }}>
            Request Custom POS <ArrowRight size={18} style={{ marginLeft: "0.5rem", display: "inline-block", verticalAlign: "middle" }} />
          </button>
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
              Start your 2-month free trial today.
            </p>
            <div className="cta-actions">
              <button
                className="btn-white-solid"
                onClick={() => navigate("/login")}
              >
                Start Free Trial (2 Months Free) <ArrowRight size={18} />
              </button>
              <button
                className="btn-transparent"
                onClick={() => setIsDemoModalOpen(true)}
              >
                Book a Demo
              </button>
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
          <img src={logo} alt="Arambh" className="logo-img" />
        </div>
        <div className="footer-links">
          <span>&copy; 2026 Arambh</span>
          <Link to="/support">Support</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </footer>

      {/* Demo Modal rendering */}
      {isDemoModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content demo-modal">
            <button className="modal-close" onClick={closeDemoModal}>
              <X size={20} />
            </button>

            {demoSubmitStatus === "success" ? (
              <div className="demo-success">
                <div className="success-icon-wrap">
                  <Check size={32} color="white" />
                </div>
                <h3>Request Sent Successfully!</h3>
                <p>Our team will contact you soon.</p>
                <button
                  className="btn-primary-solid"
                  onClick={closeDemoModal}
                  style={{ margin: "1rem auto" }}
                >
                  Got it
                </button>
              </div>
            ) : (
              <>
                <h3 className="modal-title">Book a Free Demo</h3>
                <p className="modal-subtitle">
                  Leave your details and we'll show you how Arambh works.
                </p>

                {demoSubmitStatus === "error" && (
                  <div
                    className="error-message"
                    style={{ marginBottom: "1rem" }}
                  >
                    {demoErrorMessage}
                  </div>
                )}

                <form className="demo-form" onSubmit={handleDemoSubmit}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={demoForm.name}
                      onChange={(e) =>
                        setDemoForm({ ...demoForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={demoForm.phone}
                      onChange={(e) =>
                        setDemoForm({ ...demoForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. john@cafe.com"
                      value={demoForm.email}
                      onChange={(e) =>
                        setDemoForm({ ...demoForm, email: e.target.value })
                      }
                    />
                  </div>
                  {/* <div className="form-row" style={{ display: "flex", gap: "1rem" }}> */}
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maharashtra"
                      value={demoForm.state}
                      onChange={(e) =>
                        setDemoForm({ ...demoForm, state: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={demoForm.city}
                      onChange={(e) =>
                        setDemoForm({ ...demoForm, city: e.target.value })
                      }
                    />
                  </div>
                  {/* </div> */}

                  <button
                    type="submit"
                    className="btn-primary-solid"
                    disabled={demoSubmitStatus === "submitting"}
                    style={{
                      width: "100%",
                      marginTop: "1rem",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {demoSubmitStatus === "submitting" && (
                      <Loader2 size={16} className="spinner" />
                    )}
                    Submit Request
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
