import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./routes";
import { AuthExpirationHandler } from "./components/AuthExpirationHandler";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import { Toaster } from "sonner";

function App() {
  const { initializeAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  return (
    <Router>
      <AuthExpirationHandler />
      <AppRoutes />
      <Toaster position="top-center" duration={4000} closeButton richColors />
    </Router>
  );
}

export default App;
