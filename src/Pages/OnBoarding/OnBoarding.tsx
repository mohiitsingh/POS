import { useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "../../Contexts/AuthContext";
import OnboardingModal from "../../Components/OnBoardingModal/OnBoardingModal";
import "./Onboarding.css";

const Onboarding = () => {
    const navigate = useNavigate();
    const { refreshSubscription, signOut, isFreeTrialActive } = useAuth();

    const handleComplete = async () => {
        await refreshSubscription();
        navigate("/dashboard");
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <>
            {/* Logout button floats above the modal overlay */}
            <div className="onboarding-topbar">
                {isFreeTrialActive && (
                    <button className="onboarding-logout-btn" onClick={() => navigate("/dashboard")} style={{ marginRight: '1rem', background: 'white', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
                        <ArrowLeft size={16} />
                        <span>Back </span>
                    </button>
                )}
                <button className="onboarding-logout-btn" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>

            <OnboardingModal onComplete={handleComplete} />
        </>
    );
};

export default Onboarding;
