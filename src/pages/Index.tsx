import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Scissors, LogIn } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logo from "@/assets/logo.png";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }).max(100),
  email: z.string().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
  phone: z.string().optional(),
});

const appointmentSchema = z.object({
  client_name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
  client_phone: z.string().min(10, "Telefone inválido").max(20),
  client_email: z.string().email("Email inválido").max(255),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

const Index = () => {
  const { data: galleryImages } = useQuery({
    queryKey: ['gallery-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data;
    },
  });

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

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Dialog States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Form Loading States
  const [loading, setLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Schedule Form States
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState<string>();
  const [selectedTime, setSelectedTime] = useState<string>();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const validation = loginSchema.parse({ email, password });
      const { error, role } = await signIn(validation.email, validation.password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou senha incorretos");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Login realizado com sucesso!");
        setIsLoginOpen(false);
        
        if (role === 'admin') {
          navigate("/dashboard");
        } else if (role === 'barber') {
          navigate("/barbeiro-dashboard");
        } else {
          navigate("/minha-conta");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;

    try {
      const validation = signupSchema.parse({ name, email, password, phone });
      const { error } = await signUp(validation.email, validation.password, validation.name, validation.phone);

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Este email já está cadastrado");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Cadastro realizado com sucesso!");
        setIsLoginOpen(false);
        navigate("/minha-conta");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setScheduleLoading(true);

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
        toast.error("Selecione o serviço, a data no calendário e o horário");
        setScheduleLoading(false);
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

      // Cria o agendamento no banco de dados
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
          toast.success("Agendamento solicitado com sucesso!");
        } else {
          toast.success("Agendamento realizado e conta criada com sucesso!");
        }

        setIsScheduleOpen(false);
        setSelectedDate(undefined);
        setSelectedService(undefined);
        setSelectedTime(undefined);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setScheduleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gold rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <img 
            src={logo} 
            alt="BarberBoss" 
            className="h-24 w-auto drop-shadow-2xl"
          />
        </div>

        {/* Hero content */}
          <h1 className="text-5xl md:text-7xl font-display font-bold text-primary-foreground mb-4 animate-fade-in relative inline-block select-none" style={{ animationDelay: '0.2s' }}>
            <span className="relative z-10">
              Barber<span className="text-gold relative inline-block">Boss<span className="corner-glow" aria-hidden="true" /></span>
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 font-medium animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Sistema completo de gestão para barbearias
          </p>
          
          <p className="text-base md:text-lg text-primary-foreground/70 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            Agende seus horários, gerencie clientes e fortaleça relacionamentos com seus clientes VIP.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          {/* Form Modal: Agendar Horário */}
          <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <CalendarIcon className="mr-2 h-5 w-5" />
                Agendar Horário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar">
              <DialogHeader className="text-center">
                <img src={logo} alt="BarberBoss" className="h-16 mx-auto mb-2" />
                <DialogTitle className="text-2xl font-display">
                  Agendar <span className="text-gold">Horário</span>
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados e escolha a data e horário no calendário
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleScheduleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="sched-name">Nome Completo *</Label>
                  <Input
                    id="sched-name"
                    name="client_name"
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sched-phone">WhatsApp *</Label>
                    <Input
                      id="sched-phone"
                      name="client_phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sched-email">Email *</Label>
                    <Input
                      id="sched-email"
                      name="client_email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sched-password">Senha (para sua conta) *</Label>
                  <Input
                    id="sched-password"
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

                <Button type="submit" variant="gold" className="w-full mt-4" disabled={scheduleLoading}>
                  {scheduleLoading ? "Processando..." : "Confirmar Agendamento"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Form Modal: Login */}
          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-lg px-8 py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Login
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="text-center">
                <img src={logo} alt="BarberBoss" className="h-20 mx-auto mb-4" />
                <DialogTitle className="text-2xl font-display">
                  Barber<span className="text-gold">Boss</span>
                </DialogTitle>
                <DialogDescription>Sistema de Gestão para Barbearias</DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Cadastro</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="••••••"
                        required
                      />
                    </div>
                    <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome Completo</Label>
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Telefone (opcional)</Label>
                      <Input
                        id="signup-phone"
                        name="phone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="••••••"
                        required
                      />
                    </div>
                    <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                      {loading ? "Cadastrando..." : "Criar Conta"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16 animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="bg-primary-foreground/5 backdrop-blur-sm p-6 rounded-lg border border-primary-foreground/10">
            <Scissors className="h-8 w-8 text-accent mb-3" />
            <h3 className="text-lg font-display font-bold text-primary-foreground mb-2">
              Gestão de Clientes
            </h3>
            <p className="text-sm text-primary-foreground/70">
              Mantenha histórico completo e segmente seus clientes VIP
            </p>
          </div>

          <div className="bg-primary-foreground/5 backdrop-blur-sm p-6 rounded-lg border border-primary-foreground/10">
            <CalendarIcon className="h-8 w-8 text-accent mb-3" />
            <h3 className="text-lg font-display font-bold text-primary-foreground mb-2">
              Agenda Inteligente
            </h3>
            <p className="text-sm text-primary-foreground/70">
              Organize sua rotina e confirme agendamentos facilmente
            </p>
          </div>

          <div className="bg-primary-foreground/5 backdrop-blur-sm p-6 rounded-lg border border-primary-foreground/10">
            <div className="h-8 w-8 text-accent mb-3 flex items-center justify-center text-2xl">
              💬
            </div>
            <h3 className="text-lg font-display font-bold text-primary-foreground mb-2">
              Relacionamento
            </h3>
            <p className="text-sm text-primary-foreground/70">
              Mensagens prontas para reconquistar e fidelizar clientes
            </p>
          </div>
        </div>

        {/* Gallery Section */}
        {galleryImages && galleryImages.length > 0 && (
          <div className="max-w-6xl mx-auto mt-20 mb-12 animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground text-center mb-3">
              🔥 Nossos Trabalhos 🔥
            </h2>
            <p className="text-center text-primary-foreground/70 mb-8">
              Confira alguns dos nossos melhores cortes
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
              {galleryImages.map((image) => (
                <div 
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 group cursor-pointer hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={image.image_url}
                    alt={image.title || 'Trabalho da barbearia'}
                    className="w-full h-full object-cover"
                  />
                  {image.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <p className="text-primary-foreground font-medium p-4 w-full text-center">
                        {image.title}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;