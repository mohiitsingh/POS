import { useState, useEffect } from "react";
import "./Login.css";
import BrandingPanel from "../../Components/BrandingPanel/BrandingPanel";
import { Link, useNavigate } from "react-router-dom";
import { Chrome } from "lucide-react";
import logo from "/public/logo.png";
import { useAuth } from "../../Contexts/AuthContext";
import VerificationDialog from "../../Components/VerificationDialog/VerificationDialog";

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, resendVerificationEmail, hasPaidSubscription } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
    rememberMe: false,
  });

  // On mount: restore remembered email if present
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!isLoginMode) {
      if (!formData.fullName) {
        newErrors.fullName = "Full Name is required";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (isLoginMode) {
        try {
          await signIn(formData.email, formData.password);

          // Save or clear remembered email
          if (formData.rememberMe) {
            localStorage.setItem("rememberedEmail", formData.email);
          } else {
            localStorage.removeItem("rememberedEmail");
          }

          if (hasPaidSubscription) {
            navigate("/dashboard");
          } else {
            navigate("/onboarding");
          }
        } catch (error: any) {
          if (error.message?.includes("Email not confirmed")) {
            setErrors({
              email: "Please verify your email before logging in. Check your inbox for the verification link.",
            });
          } else {
            setErrors({
              email: error?.message || "Invalid email or password",
            });
          }
        }
      } else {
        await signUp(formData.email, formData.password, {
          fullName: formData.fullName,
          phone: "",
          role: "NA",
        });
        setRegisteredEmail(formData.email);
        setShowVerificationDialog(true);
      }
    } catch (error: any) {
      const message = error?.message || "Something went wrong";
      setErrors({ email: message });
    }
  };

  const handleCloseDialog = () => {
    setShowVerificationDialog(false);
    setIsLoginMode(true);
    setFormData({ ...formData, password: "", confirmPassword: "" });
    // After email verification, user should log in — /onboarding route
    // will handle the redirect automatically since they have no active subscription yet.
  };

  const handleResendEmail = async () => {
    await resendVerificationEmail(registeredEmail);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    setFormData({ ...formData, password: "", confirmPassword: "" });
  };

  return (
    <div className="auth-page">
      {/* Left Section - Auth Form */}
      <div className="auth-section">
        <div className="auth-container">
          {/* Brand Logo */}
          <Link to="/" className="auth-logo">
            <img src={logo} alt="Bill Easy" className="logo-icon" />
          </Link>

          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h1>{isLoginMode ? "Welcome Back" : "Create Your Account"}</h1>
              <p>
                {isLoginMode
                  ? "Enter your email and password to access your account."
                  : "Sign up to start managing your restaurant efficiently."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Register: Full Name */}
              {!isLoginMode && (
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={errors.fullName ? "error" : ""}
                  />
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>
              )}

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@company.com"
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={errors.password ? "error" : ""}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              {/* Register: Confirm Password */}
              {!isLoginMode && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={errors.confirmPassword ? "error" : ""}
                  />
                  {errors.confirmPassword && (
                    <span className="error-text">{errors.confirmPassword}</span>
                  )}
                </div>
              )}

              {/* Login Options: Remember Me & Forgot Password */}
              {isLoginMode && (
                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                    />
                    Remember Me
                  </label>
                  <a href="#" className="forgot-password">
                    Forgot Password?
                  </a>
                </div>
              )}

              <button type="submit" className="btn-primary-login">
                {isLoginMode ? "Log In" : "Register"}
              </button>

              <div className="divider">
                <span>Or {isLoginMode ? "Login" : "Register"} With</span>
              </div>

              <div className="social-buttons">
                <button type="button" className="btn-social" onClick={signInWithGoogle}>
                  <Chrome size={20} />
                  Google
                </button>
              </div>
            </form>

            <div className="auth-footer">
              <p>
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={toggleMode} className="btn-link">
                  {isLoginMode ? "Register Now" : "Login"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Branding Panel */}
      <div className="branding-section">
        <BrandingPanel />
      </div>

      {/* Verification Dialog */}
      {showVerificationDialog && (
        <VerificationDialog
          email={registeredEmail}
          onClose={handleCloseDialog}
          onResend={handleResendEmail}
        />
      )}
    </div>
  );
};

export default Login;