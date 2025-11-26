import { Card } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, Star } from "lucide-react";
import { mockClients, mockAppointments } from "@/data/mockClients";

const Dashboard = () => {
  const totalClients = mockClients.length;
  const vipClients = mockClients.filter(c => c.isVip).length;
  const todayAppointments = mockAppointments.filter(
    a => a.status === "scheduled"
  ).length;
  const avgVisits = Math.round(
    mockClients.reduce((sum, c) => sum + c.visitCount, 0) / totalClients
  );

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

  const upcomingAppointments = mockAppointments
    .filter(a => a.status === "scheduled")
    .slice(0, 4);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-display mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
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
                <p className="font-semibold">{appointment.clientName}</p>
                <p className="text-sm text-muted-foreground">{appointment.service}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{appointment.time}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.date.toLocaleDateString('pt-BR')}
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
