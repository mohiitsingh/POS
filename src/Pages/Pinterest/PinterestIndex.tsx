import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../config/supabase";
import { Loader2, ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { Helmet } from "react-helmet-async";
import logo from "/logo.png";
import "./PinterestIndex.css";

interface PinterestPageSummary {
  id: string;
  slug: string;
  meta_title: string;
  meta_description: string | null;
  hero_image_url: string | null;
  hero_title: string | null;
  show_hero: boolean;
  show_comparison: boolean;
  show_email_section: boolean;
  sections: Array<{ section_title: string; products: Array<{ name: string }> }>;
  created_at: string;
}

const PinterestIndex = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<PinterestPageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("pinterest_pages")
        .select(
          "id, slug, meta_title, meta_description, hero_image_url, hero_title, show_hero, show_comparison, show_email_section, sections, created_at"
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (data) setPages(data as PinterestPageSummary[]);
      setLoading(false);
    };

    fetch();
  }, []);

  // Count total products across all sections
  const totalProducts = (page: PinterestPageSummary) =>
    page.sections?.reduce(
      (acc, s) => acc + (s.products?.length || 0),
      0
    ) || 0;

  // Collect active section labels for tag pills
  const sectionTags = (page: PinterestPageSummary): string[] => {
    const tags: string[] = [];
    if (page.show_hero) tags.push("Hero");
    if (page.show_comparison) tags.push("Comparison");
    if (page.show_email_section) tags.push("Email");
    return tags.slice(0, 3); // max 3 tags
  };

  return (
    <div className="pinindex-page">
      <Helmet>
        <title>Product Picks — Arambh</title>
        <meta
          name="description"
          content="Browse our curated product recommendations. Hand-picked and reviewed for the best value."
        />
      </Helmet>

      {/* Navbar */}
      <nav className="pinindex-navbar">
        <div className="pinindex-navbar-left">
          <img
            src={logo}
            alt="Arambh"
            className="pinindex-navbar-logo"
            onClick={() => navigate("/")}
          />
          <div className="pinindex-navbar-divider" />
          <span className="pinindex-navbar-label">Product Picks</span>
        </div>
        <button className="pinindex-back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={14} /> Home
        </button>
      </nav>

      {/* Hero */}
      <section className="pinindex-hero">
        <span className="pinindex-hero-badge">📌 From Pinterest</span>
        <h1>Our Product Picks</h1>
        <p>
          Hand-picked, reviewed, and compared — find the best products at the
          best prices from our Pinterest collections.
        </p>
      </section>

      {/* Main Content */}
      <main className="pinindex-main">
        {loading ? (
          <div className="pinindex-loading">
            <Loader2 size={20} className="spinner" />
            Loading picks...
          </div>
        ) : pages.length === 0 ? (
          <div className="pinindex-empty">
            <div className="pinindex-empty-icon">📌</div>
            <h2>No pages yet</h2>
            <p>Our curated picks are coming soon. Check back later!</p>
          </div>
        ) : (
          <div className="pinindex-grid">
            {pages.map((page) => (
              <div
                key={page.id}
                className="pinindex-card"
                onClick={() => navigate(`/pin/${page.slug}`)}
              >
                {/* Thumbnail */}
                <div className="pinindex-card-thumb">
                  {page.hero_image_url ? (
                    <img src={page.hero_image_url} alt={page.meta_title} />
                  ) : (
                    <div className="pinindex-card-thumb-placeholder">
                      <ShoppingBag size={48} />
                    </div>
                  )}
                  {totalProducts(page) > 0 && (
                    <span className="pinindex-card-count">
                      🛍 {totalProducts(page)} product{totalProducts(page) !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="pinindex-card-body">
                  <h3 className="pinindex-card-title">{page.meta_title}</h3>
                  {page.meta_description && (
                    <p className="pinindex-card-desc">{page.meta_description}</p>
                  )}

                  <div className="pinindex-card-footer">
                    <div className="pinindex-card-tags">
                      {sectionTags(page).map((tag) => (
                        <span key={tag} className="pinindex-card-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="pinindex-card-cta">
                      View <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="pinindex-footer">
        <img src={logo} alt="Arambh" className="pinindex-footer-logo" />
        <div className="pinindex-footer-links">
          <span style={{ color: "#6b7280", fontSize: "0.82rem" }}>
            &copy; 2026 Arambh
          </span>
          <Link to="/support">Support</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </footer>
    </div>
  );
};

export default PinterestIndex;
