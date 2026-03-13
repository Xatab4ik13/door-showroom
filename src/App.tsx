import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Delivery from "./pages/Delivery";
import About from "./pages/About";
import News from "./pages/News";
import Contacts from "./pages/Contacts";
import Checkout from "./pages/Checkout";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Suppliers from "./pages/admin/Suppliers";
import Customers from "./pages/admin/Customers";
import AdminSettings from "./pages/admin/AdminSettings";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <AdminAuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Public site */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/delivery" element={<Delivery />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                </Route>

                {/* Admin panel */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="products" element={<Products />} />
                  <Route path="suppliers" element={<Suppliers />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AdminAuthProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
