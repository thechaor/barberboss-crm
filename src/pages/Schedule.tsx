import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

const denialSchema = z.object({
  denial_reason: z.string().min(10, "A justificativa deve ter no mínimo 10 caracteres").max(500),
});

interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "denied" | "completed" | "cancelled";
  denial_reason: string | null;
  service: {
    name: string;
    price: number;
    duration_minutes: number;
  };
}

const Schedule = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [denialDialogOpen, setDenialDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        service:services(name, price, duration_minutes)
      `)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (error) {
      console.error("Error loading appointments:", error);
      toast.error("Erro ao carregar agendamentos");
    } else {
      setAppointments(data as any || []);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge variant="gold">Pendente</Badge>,
      confirmed: <Badge className="bg-green-600 hover:bg-green-700">Confirmado</Badge>,
      denied: <Badge variant="destructive">Negado</Badge>,
      completed: <Badge className="bg-blue-600 hover:bg-blue-700">Concluído</Badge>,
      cancelled: <Badge variant="secondary">Cancelado</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>;
  };

  const confirmAppointment = async (appointment: Appointment) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "confirmed" })
      .eq("id", appointment.id);

    if (error) {
      console.error("Error confirming appointment:", error);
      toast.error("Erro ao confirmar agendamento");
    } else {
      toast.success("Agendamento confirmado!");
      loadAppointments();
    }
  };

  const openDenialDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDenialDialogOpen(true);
  };

  const handleDenial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const denial_reason = formData.get("denial_reason") as string;

    try {
      const validation = denialSchema.parse({ denial_reason });

      const { error } = await supabase
        .from("appointments")
        .update({
          status: "denied",
          denial_reason: validation.denial_reason,
        })
        .eq("id", selectedAppointment.id);

      if (error) throw error;

      toast.success("Agendamento negado");
      setDenialDialogOpen(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error denying appointment:", error);
        toast.error("Erro ao negar agendamento");
      }
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = (status?: string) => {
    if (!status) return appointments;
    return appointments.filter((apt) => apt.status === status);
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{appointment.client_name}</CardTitle>
            <CardDescription>
              {format(new Date(appointment.appointment_date), "PPP", { locale: ptBR })} às {appointment.appointment_time}
            </CardDescription>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-gold">{appointment.service.name}</p>
          <p className="text-sm text-muted-foreground">
            R$ {appointment.service.price.toFixed(2)} • {appointment.service.duration_minutes}min
          </p>
        </div>
        
        <div className="text-sm space-y-1">
          <p><strong>WhatsApp:</strong> {appointment.client_phone}</p>
          {appointment.client_email && (
            <p><strong>Email:</strong> {appointment.client_email}</p>
          )}
        </div>

        {appointment.denial_reason && (
          <div className="pt-3 border-t">
            <p className="text-sm font-semibold text-destructive">Motivo da negação:</p>
            <p className="text-sm text-muted-foreground">{appointment.denial_reason}</p>
          </div>
        )}

        {appointment.status === "pending" && (
          <div className="flex gap-2 pt-3 border-t">
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => confirmAppointment(appointment)}
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => openDenialDialog(appointment)}
            >
              <X className="w-4 h-4 mr-2" />
              Negar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Agenda</h1>
          <p className="text-muted-foreground">Gerencie os agendamentos da barbearia</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pendentes ({filterAppointments("pending").length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmados ({filterAppointments("confirmed").length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Todos ({appointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filterAppointments("pending").length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum agendamento pendente</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filterAppointments("pending").map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          {filterAppointments("confirmed").length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum agendamento confirmado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filterAppointments("confirmed").map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {appointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={denialDialogOpen} onOpenChange={setDenialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Negar Agendamento</DialogTitle>
            <DialogDescription>
              Informe o motivo da negação para o cliente {selectedAppointment?.client_name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDenial} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="denial_reason">Motivo da Negação *</Label>
              <Textarea
                id="denial_reason"
                name="denial_reason"
                placeholder="Ex: Agenda lotada para este horário, barbeiro indisponível, etc."
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">Mínimo de 10 caracteres</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDenialDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={loading}>
                {loading ? "Negando..." : "Confirmar Negação"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;