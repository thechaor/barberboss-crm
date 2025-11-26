import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

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
  services: { name: string };
}

const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: barbers } = useQuery({
    queryKey: ["barbers-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("barbers")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Barber[];
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ["client-appointments", user?.id],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("*, services(name)")
        .eq("client_email", user.email)
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user?.email,
  });

  const completedVisits =
    appointments?.filter((apt) => apt.status === "completed").length || 0;

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
      <header className="bg-dark border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <img src={logo} alt="BarberBoss" className="h-12" />
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Olá, {user?.email}!</h1>
        <p className="text-muted-foreground mb-8">
          Bem-vindo à sua área do cliente
        </p>

        <Card className="mb-8 bg-gradient-to-r from-gold/10 to-gold/5 border-gold">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gold mb-2">
                {completedVisits}
              </div>
              <p className="text-lg">
                {completedVisits === 1 ? "Corte realizado" : "Cortes realizados"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Obrigado pela confiança!
              </p>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <MessageCircle className="mr-2" />
          Nossos Barbeiros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {barbers?.map((barber) => (
            <Card key={barber.id}>
              <CardHeader>
                <CardTitle>{barber.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {barber.photo_url && (
                  <img
                    src={barber.photo_url}
                    alt={barber.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={() => openWhatsApp(barber.phone, barber.name)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chamar no WhatsApp
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mb-8">
          <Button size="lg" variant="gold" asChild>
            <a href="/agendar">
              <Calendar className="mr-2 h-5 w-5" />
              Agendar Novo Horário
            </a>
          </Button>
        </div>

        {appointments && appointments.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Histórico de Agendamentos</h2>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{apt.services?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(apt.appointment_date).toLocaleDateString(
                            "pt-BR"
                          )}{" "}
                          às {apt.appointment_time}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          apt.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : apt.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : apt.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {apt.status === "completed"
                          ? "Concluído"
                          : apt.status === "confirmed"
                          ? "Confirmado"
                          : apt.status === "pending"
                          ? "Pendente"
                          : "Cancelado"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
