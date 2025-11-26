import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, MessageCircle, Calendar, Gift } from "lucide-react";
import logo from "@/assets/logo.png";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Barber {
  id: string;
  name: string;
  phone: string;
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

const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const today = new Date();
  const todayFormatted = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch user profile with birthday
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

  // Check if today is user's birthday
  const isBirthday = profile?.birthday 
    ? new Date(profile.birthday).getMonth() === today.getMonth() &&
      new Date(profile.birthday).getDate() === today.getDate()
    : false;

  // Fetch active barbers
  const { data: barbers = [] } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as Barber[];
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

  // Count completed visits
  const completedVisits = appointments.filter(a => a.status === 'completed').length;

  const openWhatsApp = (phone: string, barberName: string) => {
    const message = encodeURIComponent(
      `Olá ${barberName}, gostaria de agendar um horário!`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
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
            <div className="p-3 bg-gold/10 rounded-lg">
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
          <MessageCircle className="w-6 h-6" />
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
                onClick={() => openWhatsApp(barber.phone, barber.name)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chamar no WhatsApp
              </Button>
            </Card>
          ))}
        </div>

        {/* Schedule Button */}
        <div className="flex justify-center mb-8">
          <Button size="lg" onClick={() => navigate('/agendar')}>
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
    </div>
  );
};

export default ClientDashboard;
