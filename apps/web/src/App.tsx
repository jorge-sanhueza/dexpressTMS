import { BrowserRouter as Router } from 'react-router-dom';
import { AuthInitializer } from './components/auth/AuthInitializer';
import { AppRoutes } from './routes';

function App() {
  return (
    <Router>
      <AuthInitializer>
        <AppRoutes />
      </AuthInitializer>
    </Router>
  );
}

export default App;