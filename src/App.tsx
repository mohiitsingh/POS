import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/AppRoutes";
import { MenuProvider } from "./Contexts/MenuContext";
import { OrderProvider } from "./Contexts/OrderContext";
import { SettingsProvider } from "./Contexts/SettingsContext";
import { TableProvider } from "./Contexts/TableContext";
import { AuthProvider } from "./Contexts/AuthContext";
import { ToastProvider } from "./Contexts/ToastContext";



function App() {


  return (
    <ToastProvider>
      <AuthProvider>
        <MenuProvider>
          <SettingsProvider>
            <TableProvider>
              <OrderProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </OrderProvider>
            </TableProvider>
          </SettingsProvider>
        </MenuProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
