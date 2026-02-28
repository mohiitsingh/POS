import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/AppRoutes";
import { SettingsProvider } from "./Contexts/SettingsContext";
import { AuthProvider } from "./Contexts/AuthContext";
import { ToastProvider } from "./Contexts/ToastContext";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
