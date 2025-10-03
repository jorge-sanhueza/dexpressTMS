import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export const AuthExpirationHandler: React.FC = () => {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthExpired = () => {
      console.log("🔄 Auth expired event received");
      clearAuth();
      navigate("/login");
    };

    // Listen for auth expiration events
    window.addEventListener("auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, [clearAuth, navigate]);

  return null;
};
