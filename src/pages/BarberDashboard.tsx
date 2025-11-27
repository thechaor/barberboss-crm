import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, CheckCircle, XCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import logo from "@/assets/logo.png";

interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  services: { name: string } | null;
  denial_reason?: string;
}

const BarberDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [denialReason, setDenialReason] = useState("");

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get barber profile
  const { data: profile } = useQuery({
    queryKey: ['barber-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Get barber info from barbers table
  const { data: barberInfo } = useQuery({
    queryKey: ['barber-info', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('id')
        .eq('created_by', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Get daily motivational quote
  const { data: motivation } = useQuery({
    queryKey: ['daily-motivation'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('daily-motivation');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Get appointments for this barber
  const { data: appointments = [] } = useQuery({
    queryKey: ['barber-appointments', barberInfo?.id],
    queryFn: async () => {
      if (!barberInfo?.id) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*, services(name)')
        .eq('barber_id', barberInfo.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      
      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!barberInfo?.id,
  });

  // Get client count (completed appointments)
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const pendingAppointments = appointments.filter(a => a.status === 'pending');

  const confirmMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-appointments'] });
      toast.success('Agendamento confirmado!');
    },
    onError: () => {
      toast.error('Erro ao confirmar agendamento');
    },
  });

  const denyMutation = useMutation({
    mutationFn: async ({ appointmentId, reason }: { appointmentId: string; reason: string }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled', denial_reason: reason })
        .eq('id', appointmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-appointments'] });
      toast.success('Agendamento negado');
      setDenyDialogOpen(false);
      setDenialReason("");
      setSelectedAppointment(null);
    },
    onError: () => {
      toast.error('Erro ao negar agendamento');
    },
  });

  const handleConfirm = (appointmentId: string) => {
    confirmMutation.mutate(appointmentId);
  };

  const handleDenyClick = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setDenyDialogOpen(true);
  };

  const handleDenySubmit = () => {
    if (denialReason.trim().length < 10) {
      toast.error('A justificativa deve ter pelo menos 10 caracteres');
      return;
    }
    
    if (selectedAppointment) {
      denyMutation.mutate({ appointmentId: selectedAppointment, reason: denialReason });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="BarberBoss" className="h-10" />
            <span className="text-2xl font-display text-gold">BarberBoss</span>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-display mb-2">
            Bem-vindo, {profile?.name || 'Barbeiro'}! 👋
          </h1>
          <p className="text-muted-foreground capitalize">{today}</p>
          {motivation?.quote ? (
            <p className="text-lg text-foreground mt-2 italic">
              {motivation.quote}
            </p>
          ) : (
            <p className="text-lg text-foreground mt-2">
              Como podemos melhorar o visual dos nossos clientes hoje?
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gold/10 rounded-lg">
                <CheckCircle className="w-8 h-8 text-gold" />
              </div>
              <div>
                <p className="text-3xl font-display">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Clientes Atendidos</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <Calendar className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <p className="text-3xl font-display">{pendingAppointments.length}</p>
                <p className="text-sm text-muted-foreground">Agendamentos Pendentes</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Appointments */}
        {pendingAppointments.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-display mb-4">Agendamentos Pendentes</h2>
            <div className="space-y-4">
              {pendingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-lg gap-4"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{appointment.client_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.services?.name || 'Serviço não especificado'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às{' '}
                      {appointment.appointment_time}
                    </p>
                    <p className="text-sm text-muted-foreground">{appointment.client_phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleConfirm(appointment.id)}
                      disabled={confirmMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDenyClick(appointment.id)}
                      disabled={denyMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Negar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* All Appointments History */}
        <Card className="p-6">
          <h2 className="text-2xl font-display mb-4">Histórico de Agendamentos</h2>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum agendamento ainda.
              </p>
            ) : (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{appointment.client_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.services?.name || 'Serviço não especificado'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às{' '}
                      {appointment.appointment_time}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : appointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {appointment.status === 'completed'
                        ? 'Concluído'
                        : appointment.status === 'confirmed'
                        ? 'Confirmado'
                        : appointment.status === 'cancelled'
                        ? 'Cancelado'
                        : 'Pendente'}
                    </span>
                    {appointment.denial_reason && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Motivo: {appointment.denial_reason}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>

      {/* Deny Dialog */}
      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Negar Agendamento</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Justifique o motivo da negação (mínimo 10 caracteres):
            </label>
            <Textarea
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              placeholder="Ex: Horário não disponível devido a compromisso pessoal..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDenySubmit}
              disabled={denyMutation.isPending || denialReason.trim().length < 10}
            >
              Confirmar Negação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarberDashboard;
