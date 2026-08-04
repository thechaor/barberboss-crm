import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import logo from "@/assets/logo.png";

const appointmentSchema = z.object({
  client_name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
  client_phone: z.string().min(10, "Telefone inválido").max(20),
  client_email: z.string().email("Email inválido").max(255),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
}

const PublicSchedule = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState<string>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error loading services:", error);
      toast.error("Erro ao carregar serviços");
    } else {
      setServices(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const client_name = formData.get("client_name") as string;
    const client_phone = formData.get("client_phone") as string;
    const client_email = formData.get("client_email") as string;
    const password = formData.get("password") as string;

    try {
      const validation = appointmentSchema.parse({
        client_name,
        client_phone,
        client_email,
        password,
      });

      if (!selectedService || !selectedDate || !selectedTime) {
        toast.error("Preencha todos os campos e selecione a data no calendário");
        setLoading(false);
        return;
      }

      // Tenta criar a conta do usuário
      const { error: authError } = await supabase.auth.signUp({
        email: validation.client_email,
        password: validation.password,
        options: {
          emailRedirectTo: `${window.location.origin}/minha-conta`,
          data: {
            name: validation.client_name,
            phone: validation.client_phone,
          },
        },
      });

      // Cria o agendamento
      const { error: appointmentError } = await supabase.from("appointments").insert({
        client_name: validation.client_name,
        client_phone: validation.client_phone,
        client_email: validation.client_email,
        service_id: selectedService,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: selectedTime,
        status: "pending",
      });

      if (appointmentError) {
        console.error("Error creating appointment:", appointmentError);
        toast.error("Erro ao criar agendamento");
      } else {
        if (authError && authError.message.includes("already registered")) {
          toast.success("Agendamento criado! Você já possui conta cadastrada.");
        } else if (authError) {
          toast.success("Agendamento criado! Aguarde a confirmação.");
        } else {
          toast.success("Conta criada e agendamento realizado! Verifique seu email.");
        }
        
        e.currentTarget.reset();
        setSelectedDate(undefined);
        setSelectedService(undefined);
        setSelectedTime(undefined);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground border-b border-border/50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="BarberBoss" className="h-12" />
            <h1 className="text-2xl font-display font-bold">
              Barber<span className="text-gold">Boss</span>
            </h1>
          </div>
          <Button variant="secondary" onClick={() => window.location.href = "/auth"}>
            Área Administrativa
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Agendar Horário</CardTitle>
            <CardDescription>
              Preencha os dados abaixo e selecione o dia no calendário para agendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="client_name">Nome Completo *</Label>
                <Input
                  id="client_name"
                  name="client_name"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_phone">WhatsApp *</Label>
                <Input
                  id="client_phone"
                  name="client_phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_email">Email *</Label>
                <Input
                  id="client_email"
                  name="client_email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
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
                <Label>Selecione a Data no Calendário *</Label>
                <div className="border rounded-lg p-2 flex flex-col items-center justify-center bg-card">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
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

              <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                {loading ? "Processando..." : "Agendar e Cadastrar"}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Sua conta será criada e seu agendamento confirmado em breve via WhatsApp
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PublicSchedule;