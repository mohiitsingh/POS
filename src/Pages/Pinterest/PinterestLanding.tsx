import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../config/supabase";
import { Loader2, ArrowLeft, ExternalLink, Send, Trophy, Medal, BadgeDollarSign } from "lucide-react";
import { Helmet } from "react-helmet-async";
import logo from "/logo.png";
import "./PinterestLanding.css";

// ── Types ──
interface Product {
  name: string;
  image_url: string;
  price: string;
  tag: "winner" | "runner_up" | "budget" | "";
  review: string;
  buy_link: string;
}

interface ProductSection {
  section_title: string;
  products: Product[];
}

interface ComparisonRow {
  feature: string;
  products: Record<string, string>;
}

interface PinterestPage {
  id: string;
  slug: string;
  meta_title: string;
  meta_description: string | null;
  show_hero: boolean;
  show_products: boolean;
  show_comparison: boolean;
  show_email_section: boolean;
  show_footer: boolean;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  pinterest_pin_url: string | null;
  sections: ProductSection[];
  comparison_data: ComparisonRow[];
  is_published: boolean;
}

// ── Tag Component ──
const TagBadge = ({ tag }: { tag: Product["tag"] }) => {
  if (!tag) return null;

  const config = {
    winner: { icon: <Trophy size={12} />, label: "Winner", className: "winner" },
    runner_up: { icon: <Medal size={12} />, label: "Runner-up", className: "runner_up" },
    budget: { icon: <BadgeDollarSign size={12} />, label: "Budget Pick", className: "budget" },
  };

  const c = config[tag];
  if (!c) return null;

  return (
    <span className={`pin-product-tag ${c.className}`}>
      {c.icon} {c.label}
    </span>
  );
};

// ── Main Component ──
const PinterestLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState<PinterestPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Email form
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("pinterest_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setPage(data as PinterestPage);
      }
      setLoading(false);
    };

    fetchPage();
  }, [slug]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailStatus("error");
      return;
    }

    setEmailStatus("submitting");

    try {
      const { error } = await supabase.from("demo_requests").insert([
        {
          name: "Pinterest Visitor",
          phone: "0000000000",
          email: email.trim(),
          state: "Pinterest",
          city: slug || "unknown",
          request_type: "pinterest_email",
        },
      ]);

      if (error) throw error;
      setEmailStatus("success");
      setEmail("");
    } catch {
      setEmailStatus("error");
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="pin-loading">
        <Loader2 size={20} className="spinner" />
        Loading...
      </div>
    );
  }

  // ── Not Found ──
  if (notFound || !page) {
    return (
      <div className="pin-not-found">
        <div className="pin-not-found-icon">📌</div>
        <h2>Page Not Found</h2>
        <p>The Pinterest page you're looking for doesn't exist or has been unpublished.</p>
        <button className="pin-not-found-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={16} /> Go Home
        </button>
      </div>
    );
  }

  // ── Get all product names for comparison table headers ──
  const allProductNames: string[] = [];
  if (page.comparison_data && page.comparison_data.length > 0) {
    const nameSet = new Set<string>();
    page.comparison_data.forEach((row) => {
      Object.keys(row.products || {}).forEach((name) => nameSet.add(name));
    });
    allProductNames.push(...Array.from(nameSet));
  }

  return (
    <div className="pin-page">
      <Helmet>
        <title>{page.meta_title}</title>
        {page.meta_description && (
          <meta name="description" content={page.meta_description} />
        )}
      </Helmet>

      {/* Navbar */}
      <nav className="pin-navbar">
        <div className="pin-navbar-left">
          <img
            src={logo}
            alt="Arambh"
            className="pin-navbar-logo"
            onClick={() => navigate("/")}
          />
          <div className="pin-navbar-divider" />
          <span className="pin-navbar-label">Product Picks</span>
        </div>
        <button className="pin-navbar-home" onClick={() => navigate("/")}>
          <ArrowLeft size={14} /> Home
        </button>
      </nav>

      {/* Hero Section */}
      {page.show_hero && page.hero_title && (
        <section className="pin-hero">
          <div className="pin-hero-content">
            <span className="pin-hero-badge">📌 From Pinterest</span>
            <h1>{page.hero_title}</h1>
            {page.hero_subtitle && (
              <p className="pin-hero-subtitle">{page.hero_subtitle}</p>
            )}
          </div>
          {page.hero_image_url && (
            <img
              src={page.hero_image_url}
              alt={page.hero_title}
              className="pin-hero-image"
            />
          )}
        </section>
      )}

      {/* Pinterest Pin Link */}
      {page.pinterest_pin_url && (
        <div className="pin-source-link">
          <a
            href={page.pinterest_pin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="pin-source-btn"
          >
            📌 View Original Pin <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Product Sections */}
      {page.show_products && page.sections && page.sections.length > 0 && (
        <div className="pin-sections">
          {page.sections.map((section, idx) => (
            <div key={idx} className="pin-product-section">
              {section.section_title && (
                <h2 className="pin-section-title">{section.section_title}</h2>
              )}
              <div className="pin-products-grid">
                {section.products.map((product, pIdx) => (
                  <div key={pIdx} className="pin-product-card">
                    <TagBadge tag={product.tag} />
                    <div className="pin-product-image-wrap">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <div style={{ color: "#cbd5e1", fontSize: "3rem" }}>📦</div>
                      )}
                    </div>
                    <div className="pin-product-info">
                      <div className="pin-product-name">{product.name}</div>
                      <div className="pin-product-price">{product.price}</div>
                      {product.review && (
                        <div className="pin-product-review">{product.review}</div>
                      )}
                      <a
                        href={product.buy_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pin-amazon-btn"
                      >
                        Buy on Amazon <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Table */}
      {page.show_comparison && page.comparison_data && page.comparison_data.length > 0 && (
        <section className="pin-comparison-section">
          <h2 className="pin-comparison-title">Quick Comparison</h2>
          <div className="pin-comparison-table-wrap">
            <table className="pin-comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  {allProductNames.map((name) => (
                    <th key={name}>{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.comparison_data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.feature}</td>
                    {allProductNames.map((name) => (
                      <td key={name}>{row.products?.[name] || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Email Section */}
      {page.show_email_section && (
        <section className="pin-email-section">
          <div className="pin-email-content">
            <h2>Stay Updated</h2>
            <p>
              Get notified when we publish new product recommendations and deals.
            </p>
            {emailStatus === "success" ? (
              <p className="pin-email-success">✓ You're subscribed! We'll keep you posted.</p>
            ) : (
              <form className="pin-email-form" onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  className="pin-email-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="pin-email-submit"
                  disabled={emailStatus === "submitting"}
                >
                  {emailStatus === "submitting" ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <Send size={16} />
                  )}
                  Subscribe
                </button>
              </form>
            )}
            {emailStatus === "error" && (
              <p className="pin-email-error">Please enter a valid email address.</p>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      {page.show_footer && (
        <footer className="pin-footer">
          <img src={logo} alt="Arambh" className="pin-footer-logo" />
          <div className="pin-footer-links">
            <span>&copy; 2026 Arambh</span>
            <Link to="/support">Support</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PinterestLanding;
