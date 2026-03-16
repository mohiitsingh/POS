import { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";
import { ExternalLink, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./PrintersPage.css";

export interface RecommendedPrinter {
    id: string;
    name: string;
    image_url: string;
    description: string;
    buy_link: string;
}

const PrintersPage = () => {
    const [printers, setPrinters] = useState<RecommendedPrinter[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPrinters = async () => {
            const { data, error } = await supabase
                .from("recommended_printers")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error && data) {
                setPrinters(data as RecommendedPrinter[]);
            }
            setLoading(false);
        };

        fetchPrinters();
    }, []);

    return (
        <div className="printers-page-container">
            <header className="printers-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    &larr; Back
                </button>
                <h1><Printer className="header-icon" /> Recommended Printers</h1>
                <p>Top thermal printers we recommend for a seamless billing experience with Arambh.</p>
            </header>

            <main className="printers-main">
                {loading ? (
                    <div className="loading-state">Loading printers...</div>
                ) : printers.length === 0 ? (
                    <div className="empty-state">
                        <Printer size={48} className="empty-icon" />
                        <h2>No printers currently recommended</h2>
                        <p>Check back later for our latest top picks!</p>
                    </div>
                ) : (
                    <div className="printers-grid">
                        {printers.map((printer) => (
                            <div key={printer.id} className="printer-card">
                                <div className="printer-image-container">
                                    <img src={printer.image_url} alt={printer.name} className="printer-image" />
                                </div>
                                <div className="printer-info">
                                    <h3 className="printer-name">{printer.name}</h3>
                                    <p className="printer-description">{printer.description}</p>
                                    <a
                                        href={printer.buy_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary-solid buy-btn"
                                    >
                                        Buy Now <ExternalLink size={16} style={{ marginLeft: "8px" }} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PrintersPage;
