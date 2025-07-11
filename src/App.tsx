
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import { NotificationProvider } from "./contexts/NotificationContext/NotificationContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import Pacientes from "./pages/Pacientes";
import Profissionais from "./pages/Profissionais";
import Procedimentos from "./pages/Procedimentos";
import Prontuario from "./pages/Prontuario";
import Configuracoes from "./pages/Configuracoes";
import Notificacoes from "./pages/Notificacoes";
import Assinatura from "./pages/Assinatura";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <NotificationProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/agenda" element={<MainLayout><Agenda /></MainLayout>} />
            <Route path="/pacientes" element={<MainLayout><Pacientes /></MainLayout>} />
            <Route path="/profissionais" element={<MainLayout><Profissionais /></MainLayout>} />
            <Route path="/procedimentos" element={<MainLayout><Procedimentos /></MainLayout>} />
            <Route path="/prontuario" element={<MainLayout><Prontuario /></MainLayout>} />
            <Route path="/configuracoes" element={<MainLayout><Configuracoes /></MainLayout>} />
            <Route path="/notificacoes" element={<MainLayout><Notificacoes /></MainLayout>} />
            <Route path="/assinatura" element={<MainLayout><Assinatura /></MainLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </NotificationProvider>
  </QueryClientProvider>
);

export default App;
