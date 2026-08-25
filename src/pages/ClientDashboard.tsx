import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogOut, Calendar, Gift, Scissors } from "lucide-react";
import logo from "@/assets/logo.png";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface BarberPublic {
  id: string;
  name: string;
  photo_url: string | null;
  is_active: boolean;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  services: { name: string } | null;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Modal / Form state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [clientPhone, setClientPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const todayFormatted = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch user profile with birthday & phone
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
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

  useEffect(() => {
    if (profile?.phone) {
      setClientPhone(profile.phone);
    }
  }, [profile]);

  // Check if today is user's birthday
  const isBirthday = profile?.birthday 
    ? new Date(profile.birthday).getMonth() === today.getMonth() &&
      new Date(profile.birthday).getDate() === today.getDate()
    : false;

  // Fetch active barbers
  const { data: barbers = [] } = useQuery({
    queryKey: ['barbers-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers_public')
        .select('*');
      
      if (error) throw error;
      return data as BarberPublic[];
    },
  });

  // Fetch active services
  const { data: services = [] } = useQuery({
    queryKey: ['active-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // Fetch user appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, services(name)')
        .eq('client_email', user?.email)
        .order('appointment_date', { ascending: false });
      
      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user?.email,
  });

  const completedVisits = appointments.filter(a => a.status === 'completed').length;

  const handleOpenSchedule = (barberId?: string | null) => {
    setSelectedBarber(barberId || null);
    setIsScheduleOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error("Selecione o serviço, a data e o horário desejados");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("appointments").insert({
        client_name: profile?.name || user?.email?.split("@")[0] || "Cliente",
        client_phone: clientPhone || profile?.phone || "",
        client_email: user?.email,
        barber_id: selectedBarber || null,
        service_id: selectedService,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: selectedTime,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Agendamento solicitado com sucesso! Aguarde a confirmação.");
      setIsScheduleOpen(false);
      setSelectedService(undefined);
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setSelectedBarber(null);
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.email] });
    } catch (error: any) {
      console.error("Erro ao agendar:", error);
      toast.error(error.message || "Erro ao solicitar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
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
            Bem-vindo, {profile?.name || 'Cliente'}! 👋
          </h1>
          <p className="text-muted-foreground capitalize">{todayFormatted}</p>
          <p className="text-lg text-foreground mt-2">
            Como podemos melhorar seu visual hoje?
          </p>
        </div>

        {/* Birthday Alert */}
        {isBirthday && (
          <Alert className="mb-6 bg-gold/10 border-gold">
            <Gift className="h-5 w-5 text-gold" />
            <AlertDescription className="ml-2">
              <strong>🎉 FELIZ ANIVERSÁRIO!</strong>
              <br />
              Parabéns pelo seu dia especial! Use o cupom <strong>ANIVER10</strong> para ganhar 10% de desconto no seu próximo corte!
            </AlertDescription>
          </Alert>
        )}

        {/* Visit Counter */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <Calendar className="w-8 h-8 text-gold" />
            </div>
            <div>
              <p className="text-3xl font-display">{completedVisits}</p>
              <p className="text-sm text-muted-foreground">Cortes Realizados</p>
            </div>
          </div>
        </Card>

        {/* Barbers List */}
        <h2 className="text-2xl font-display mb-4 flex items-center gap-2">
          <Scissors className="w-6 h-6 text-gold" />
          Nossos Barbeiros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {barbers.map((barber) => (
            <Card key={barber.id} className="p-6">
              {barber.photo_url && (
                <img
                  src={barber.photo_url}
                  alt={barber.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{barber.name}</h3>
              <Button
                className="w-full"
                variant="gold"
                onClick={() => handleOpenSchedule(barber.id)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar com {barber.name}
              </Button>
            </Card>
          ))}
        </div>

        {/* Schedule Button */}
        <div className="flex justify-center mb-8">
          <Button size="lg" variant="gold" onClick={() => handleOpenSchedule(null)}>
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Novo Horário
          </Button>
        </div>

        {/* Appointment History */}
        {appointments.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl font-display mb-4">Histórico de Agendamentos</h2>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{apt.services?.name || 'Serviço'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(apt.appointment_date).toLocaleDateString('pt-BR')} às{' '}
                      {apt.appointment_time}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : apt.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : apt.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {apt.status === 'completed'
                      ? 'Concluído'
                      : apt.status === 'confirmed'
                      ? 'Confirmado'
                      : apt.status === 'pending'
                      ? 'Pendente'
                      : 'Cancelado'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      {/* Popup / Modal Leve de Agendamento */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogHeader className="text-center">
            <img src={logo} alt="BarberBoss" className="h-14 mx-auto mb-2" />
            <DialogTitle className="text-2xl font-display">
              Novo <span className="text-gold">Agendamento</span>
            </DialogTitle>
            <DialogDescription>
              Escolha o serviço, barbeiro e o melhor dia/horário para você
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleScheduleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="client-phone">WhatsApp / Telefone para Contato *</Label>
              <Input
                id="client-phone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Barbeiro (Opcional)</Label>
              <Select
                value={selectedBarber || "any"}
                onValueChange={(val) => setSelectedBarber(val === "any" ? null : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer barbeiro disponível</SelectItem>
                  {barbers.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Serviço *</Label>
              <Select value={selectedService} onValueChange={setSelectedService} required>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)} ({service.duration_minutes}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data no Calendário *</Label>
              <div className="border rounded-lg p-2 flex flex-col items-center justify-center bg-card">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    const todayDate = new Date();
                    todayDate.setHours(0, 0, 0, 0);
                    return date < todayDate;
                  }}
                  locale={ptBR}
                  className="rounded-md border-0 pointer-events-auto"
                />
                {selectedDate && (
                  <p className="text-xs text-gold font-semibold mt-1">
                    Data selecionada: {format(selectedDate, "PPP", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Horário *</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime} required>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="gold" className="w-full mt-4" disabled={loading}>
              {loading ? "Confirmando..." : "Solicitar Agendamento"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboard;
