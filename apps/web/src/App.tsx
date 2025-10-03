import { BrowserRouter as Router } from "react-router-dom";
import { AuthInitializer } from "./components/auth/AuthInitializer";
import { AppRoutes } from "./routes";
import "./services/apiInterceptor";
import { AuthExpirationHandler } from "./components/AuthExpirationHandler";

function App() {
  return (
    <Router>
      <AuthInitializer>
        <AuthExpirationHandler />
        <AppRoutes />
      </AuthInitializer>
    </Router>
  );
}

export default App;
