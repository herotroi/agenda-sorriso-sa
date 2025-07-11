
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import Pacientes from "./pages/Pacientes";
import Profissionais from "./pages/Profissionais";
import Procedimentos from "./pages/Procedimentos";
import Prontuario from "./pages/Prontuario";
import Assinatura from "./pages/Assinatura";
import Configuracoes from "./pages/Configuracoes";
import Notificacoes from "./pages/Notificacoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/agenda" element={
                <ProtectedRoute>
                  <Agenda />
                </ProtectedRoute>
              } />
              <Route path="/pacientes" element={
                <ProtectedRoute>
                  <Pacientes />
                </ProtectedRoute>
              } />
              <Route path="/profissionais" element={
                <ProtectedRoute>
                  <Profissionais />
                </ProtectedRoute>
              } />
              <Route path="/procedimentos" element={
                <ProtectedRoute>
                  <Procedimentos />
                </ProtectedRoute>
              } />
              <Route path="/prontuario" element={
                <ProtectedRoute>
                  <Prontuario />
                </ProtectedRoute>
              } />
              <Route path="/assinatura" element={
                <ProtectedRoute>
                  <Assinatura />
                </ProtectedRoute>
              } />
              <Route path="/configuracoes" element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              } />
              <Route path="/notificacoes" element={
                <ProtectedRoute>
                  <Notificacoes />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
