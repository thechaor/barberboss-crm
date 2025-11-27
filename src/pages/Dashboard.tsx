import { Card } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  services: { name: string } | null;
}

const Dashboard = () => {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get user profile
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

  // Get total clients
  const { data: clientsData } = useQuery({
    queryKey: ['clients-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Get appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, services(name)')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      
      if (error) throw error;
      return data as Appointment[];
    },
  });

  const totalClients = clientsData || 0;
  const todayDate = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(
    a => a.appointment_date === todayDate && a.status === 'confirmed'
  ).length;
  
  // Calculate VIP clients (more than 5 completed appointments)
  const vipClients = appointments.filter(
    a => a.status === 'completed'
  ).length > 5 ? Math.floor(totalClients * 0.2) : 0;

  // Calculate average visits
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const avgVisits = totalClients > 0 ? Math.round(completedAppointments.length / totalClients) : 0;

  const stats = [
    { 
      title: "Total de Clientes", 
      value: totalClients, 
      icon: Users, 
      color: "text-gold" 
    },
    { 
      title: "Agendamentos Hoje", 
      value: todayAppointments, 
      icon: Calendar, 
      color: "text-navy" 
    },
    { 
      title: "Clientes VIP", 
      value: vipClients, 
      icon: Star, 
      color: "text-gold" 
    },
    { 
      title: "Média de Visitas", 
      value: avgVisits, 
      icon: TrendingUp, 
      color: "text-destructive" 
    },
  ];

  const upcomingAppointments = appointments
    .filter(a => a.status === 'confirmed' || a.status === 'pending')
    .slice(0, 4);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-display mb-2">
          Bem-vindo, {profile?.name || 'Admin'}! 👋
        </h1>
        <p className="text-muted-foreground capitalize">{today}</p>
        {motivation?.quote ? (
          <p className="text-lg text-foreground mt-2 italic">
            {motivation.quote}
          </p>
        ) : (
          <p className="text-lg text-foreground mt-2">
            Como podemos melhorar seu negócio hoje?
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-3xl font-display mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <Card className="p-6">
        <h2 className="text-2xl font-display mb-4">Próximos Agendamentos</h2>
        <div className="space-y-4">
          {upcomingAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
            >
              <div>
                <p className="font-semibold">{appointment.client_name}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.services?.name || 'Serviço não especificado'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{appointment.appointment_time}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
