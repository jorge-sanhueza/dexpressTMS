import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./routes";
import { AuthExpirationHandler } from "./components/AuthExpirationHandler";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";

function App() {
  const { initializeAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    console.log("🚀 App mounted - Initializing auth. isInitialized:", isInitialized);
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  return (
    <Router>
      <AuthExpirationHandler />
      <AppRoutes />
    </Router>
  );
}

export default App;