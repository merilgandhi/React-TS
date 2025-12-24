import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import LogIn from "./Pages/Auth/LogIn";
import Variations from "./Pages/Products/Variations";
import ProductList from "./Pages/Products/ProductList"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Seller from "./Pages/Seller";
import CreateOrders from "./Pages/Orders/CreateOrders";
import OrderList from "./Pages/Orders/OrdersList";
import Dashboard from "./Pages/Dashboard";

function App() {
  return (
    <>
      <Toaster position="top-right" containerStyle={{ marginTop: "60px" }} toastOptions={{duration: 1500,}} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LogIn />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/variations"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Variations />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/edit"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProductList/>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sellers"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Seller />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/createorders"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CreateOrders/>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orderslist"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <OrderList/>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/create"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CreateOrders/>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/view/:orderId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CreateOrders/>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/edit/:orderId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CreateOrders/>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
