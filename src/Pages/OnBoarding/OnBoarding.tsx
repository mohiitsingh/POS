import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../Contexts/AuthContext";
import OnboardingModal from "../../Components/OnBoardingModal/OnBoardingModal";
import "./Onboarding.css";

const Onboarding = () => {
    const navigate = useNavigate();
    const { refreshSubscription, signOut } = useAuth();

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
