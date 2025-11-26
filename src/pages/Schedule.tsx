import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, User } from "lucide-react";
import { mockAppointments } from "@/data/mockClients";
import { Appointment } from "@/types/client";

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const todayAppointments = mockAppointments
    .filter(a => {
      const appointmentDate = new Date(a.date);
      return (
        appointmentDate.getDate() === selectedDate.getDate() &&
        appointmentDate.getMonth() === selectedDate.getMonth() &&
        appointmentDate.getFullYear() === selectedDate.getFullYear()
      );
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="navy">Agendado</Badge>;
      case "completed":
        return <Badge variant="gold">Concluído</Badge>;
      case "cancelled":
        return <Badge variant="red">Cancelado</Badge>;
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display mb-2">Agenda</h1>
          <p className="text-muted-foreground">Gerencie seus agendamentos</p>
        </div>
        <Button variant="gold" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Date Selector */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-6 h-6 text-gold" />
          <div>
            <p className="text-sm text-muted-foreground">Data selecionada</p>
            <p className="text-xl font-display">
              {selectedDate.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Appointments Timeline */}
      <div className="space-y-4">
        {todayAppointments.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">
              Nenhum agendamento para esta data
            </p>
          </Card>
        ) : (
          todayAppointments.map((appointment) => (
            <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-display text-gold">
                      {appointment.time}
                    </div>
                  </div>
                  <div className="h-16 w-px bg-border" />
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <h3 className="text-xl font-display">{appointment.clientName}</h3>
                    </div>
                    <p className="text-muted-foreground">{appointment.service}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(appointment.status)}
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      Editar
                    </Button>
                    <Button variant="gold" size="sm">
                      Confirmar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Schedule;
