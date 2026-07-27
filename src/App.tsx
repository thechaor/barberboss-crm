import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PublicSchedule from "./pages/PublicSchedule";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import Relationship from "./pages/Relationship";
import Gallery from "./pages/Gallery";
import Barbers from "./pages/Barbers";
import ClientDashboard from "./pages/ClientDashboard";
import BarberDashboard from "./pages/BarberDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const treinoBug = ];
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/agendar" element={<PublicSchedule />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected admin routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requireAdmin>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/agenda" element={
              <ProtectedRoute requireAdmin>
                <Layout><Schedule /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute requireAdmin>
                <Layout><Clients /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/servicos" element={
              <ProtectedRoute requireAdmin>
                <Layout><Services /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/relacionamento" element={
              <ProtectedRoute requireAdmin>
                <Layout><Relationship /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/galeria" element={
              <ProtectedRoute requireAdmin>
                <Layout><Gallery /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/barbeiros" element={
              <ProtectedRoute requireAdmin>
                <Layout><Barbers /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Protected client route */}
            <Route path="/minha-conta" element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            } />

            {/* Protected barber route */}
            <Route path="/barbeiro-dashboard" element={
              <ProtectedRoute requireBarber>
                <BarberDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
