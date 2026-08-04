import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServiceCard3D } from "@/components/ServiceCard3D";
import { QuickActions } from "@/components/QuickActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Value";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Star, ShieldCheck, MapPin, Clock, Phone, Award, Scissors, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { z } from "zod";
import logo from "@/assets/logo.png";
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
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Form Loaders
  const [loading, setLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Schedule States
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState<string>();
  const [selectedTime, setSelectedTime] = useState<string>();

  // Fetch Services & Gallery
  const { data: galleryImages = [] } = useQuery({
    queryKey: ["gallery-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["active-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setIsScheduleOpen(true);
  };
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
    <div className="min-h-screen bg-[#0D1117] text-gray-100 relative selection:bg-gold selection:text-black">
      {/* Header */}
      <Header
        onOpenSchedule={() => setIsScheduleOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Hero Section */}
      <Hero onOpenSchedule={() => setIsScheduleOpen(true)} />

      {/* Services Section */}
      <section id="servicos" className="py-24 relative bg-surface/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-[0.2em] text-gold uppercase bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20 inline-block mb-4">
              Menu de Experiências
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-bold text-white mb-4">
              Nossos Serviços <span className="text-gradient-gold">Exclusivos</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              Escolha o tratamento ideal para o seu estilo. Todos os procedimentos acompanham consultoria visagista.
            </p>
          </div>

          {/* 3D Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard3D
                key={service.id}
                service={service}
                onSelect={handleServiceSelect}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {galleryImages.length > 0 && (
        <section id="galeria" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold tracking-[0.2em] text-gold uppercase bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20 inline-block mb-4">
                Galeria de Transformações
              </span>
              <h2 className="font-display text-4xl sm:text-6xl font-bold text-white mb-4">
                Nossos <span className="text-gradient-gold">Trabalhos</span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg">
                Confira a excelência e o rigor nos detalhes em cada corte e acabamento.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-surface shadow-xl hover:border-gold/50 transition-all duration-300"
                >
                  <img
                    src={image.image_url}
                    alt={image.title || "Trabalho da barbearia"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/90 via-[#0D1117]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-sm font-semibold text-white">
                      {image.title || "Corte Personalizado BarberBoss"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-24 bg-surface/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-[0.2em] text-gold uppercase bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20 inline-block mb-4">
              Avaliações Reais
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-bold text-white mb-4">
              O Que Dizem Nossos <span className="text-gradient-gold">Clientes VIP</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Ricardo Alves",
                role: "Cliente Há 3 Anos",
                comment:
                  "Atendimento impecável! A pontualidade e o profissionalismo da BarberBoss não têm comparação na cidade.",
                stars: 5,
              },
              {
                name: "Gabriel Santos",
                role: "Empresário",
                comment:
                  "A experiência do ritual de barba com toalha quente é sensacional. Saio renovado a cada visita.",
                stars: 5,
              },
              {
                name: "Marcelo Fonseca",
                role: "Advogado",
                comment:
                  "O sistema de agendamento online é super rápido. Chego e sou atendido exatamente no horário marcado.",
                stars: 5,
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-surface border border-white/10 rounded-2xl p-6 shadow-xl relative hover:border-gold/30 transition-colors"
              >
                <div className="flex text-gold mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed italic">
                  "{testimonial.comment}"
                </p>
                <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-base">{testimonial.name}</h4>
                    <span className="text-xs text-gray-400">{testimonial.role}</span>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-gold" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white mb-4">
            Dúvidas <span className="text-gradient-gold">Frequentes</span>
          </h2>
          <p className="text-gray-400">Tudo o que você precisa saber antes da sua primeira visita.</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="border border-white/10 rounded-2xl px-6 bg-surface">
            <AccordionTrigger className="text-white hover:text-gold text-lg py-5">
              Como funciona o agendamento online?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400 pb-5">
              Você seleciona o serviço desejado, a data no calendário e o horário de sua preferência. Sua conta é criada automaticamente e você recebe as confirmações diretas no seu e-mail e WhatsApp.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border border-white/10 rounded-2xl px-6 bg-surface">
            <AccordionTrigger className="text-white hover:text-gold text-lg py-5">
              É necessário chegar com antecedência?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400 pb-5">
              Recomendamos chegar de 5 a 10 minutos antes do seu horário agendado para desfrutar de um drink de boas-vindas no nosso lounge.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border border-white/10 rounded-2xl px-6 bg-surface">
            <AccordionTrigger className="text-white hover:text-gold text-lg py-5">
              Posso reagendar ou cancelar meu horário?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400 pb-5">
              Sim! Pelo painel 'Minha Conta' você tem total liberdade para gerenciar e visualizar seu histórico de agendamentos.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-white/10 pt-16 pb-12 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="BarberBoss" className="h-10" />
              <span className="font-display text-2xl font-bold text-white">
                Barber<span className="text-gold">Boss</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Tradição, estilo e cuidado pessoal elevado ao mais alto padrão.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-widest text-gold">
              Navegação
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#hero" className="hover:text-gold">Início</a></li>
              <li><a href="#servicos" className="hover:text-gold">Serviços</a></li>
              <li><a href="#galeria" className="hover:text-gold">Galeria</a></li>
              <li><a href="#faq" className="hover:text-gold">Perguntas Frequentes</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-widest text-gold">
              Horário de Funcionamento
            </h4>
            <p className="text-sm mb-1">Segunda a Sábado: 09h00 às 20h00</p>
            <p className="text-sm">Domingo: Fechado</p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-widest text-gold">
              Contato
            </h4>
            <p className="text-sm flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-gold" /> (11) 99999-9999
            </p>
            <p className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold" /> Av. Paulista, 1000 - São Paulo/SP
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-white/5 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} BarberBoss CRM. Todos os direitos reservados.
        </div>
      </footer>

      {/* Floating Quick Actions */}
      <QuickActions onOpenSchedule={() => setIsScheduleOpen(true)} />

      {/* Modal Agendamento */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar bg-surface border-gold/30 text-white">
          <DialogHeader className="text-center">
            <img src={logo} alt="BarberBoss" className="h-14 mx-auto mb-2" />
            <DialogTitle className="text-2xl font-display text-white">
              Agendar <span className="text-gradient-gold">Horário</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Escolha seu serviço e defina a data ideal no calendário
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleScheduleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="sched-name" className="text-gray-300">Nome Completo *</Label>
              <Input
                id="sched-name"
                name="client_name"
                placeholder="Seu nome completo"
                className="bg-[#0D1117] border-white/10 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sched-phone" className="text-gray-300">WhatsApp *</Label>
                <Input
                  id="sched-phone"
                  name="client_phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="bg-[#0D1117] border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sched-email" className="text-gray-300">Email *</Label>
                <Input
                  id="sched-email"
                  name="client_email"
                  type="email"
                  placeholder="seu@email.com"
                  className="bg-[#0D1117] border-white/10 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sched-password" className="text-gray-300">Senha (para sua conta) *</Label>
              <Input
                id="sched-password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                className="bg-[#0D1117] border-white/10 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Serviço *</Label>
              <Select value={selectedService} onValueChange={setSelectedService} required>
                <SelectTrigger className="bg-[#0D1117] border-white/10 text-white">
                  <SelectValue placeholder="Escolha o serviço" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-gold/30 text-white">
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)} ({service.duration_minutes}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Selecione a Data *</Label>
              <div className="border border-white/10 rounded-xl p-2 flex flex-col items-center justify-center bg-[#0D1117]">
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
                  className="rounded-md border-0 text-white pointer-events-auto"
                />
                {selectedDate && (
                  <p className="text-xs text-gold font-semibold mt-1">
                    Data selecionada: {format(selectedDate, "PPP", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Horário *</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime} required>
                <SelectTrigger className="bg-[#0D1117] border-white/10 text-white">
                  <SelectValue placeholder="Escolha o horário" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-gold/30 text-white">
                  {[
                    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
                    "16:00", "16:30", "17:00", "17:30", "18:00"
                  ].map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="gold" className="w-full mt-4 shadow-gold-glow" disabled={scheduleLoading}>
              {scheduleLoading ? "Processando..." : "Confirmar Agendamento"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Login */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md bg-surface border-gold/30 text-white">
          <DialogHeader className="text-center">
            <img src={logo} alt="BarberBoss" className="h-16 mx-auto mb-2" />
            <DialogTitle className="text-2xl font-display text-white">
              Barber<span className="text-gold">Boss</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">Acesse sua conta do sistema</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#0D1117]">
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
                    className="bg-[#0D1117] border-white/10 text-white"
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
                    className="bg-[#0D1117] border-white/10 text-white"
                    required
                  />
                </div>
                <Button type="submit" variant="gold" className="w-full shadow-gold-glow" disabled={loading}>
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
                    className="bg-[#0D1117] border-white/10 text-white"
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
                    className="bg-[#0D1117] border-white/10 text-white"
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
                    className="bg-[#0D1117] border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••"
                    className="bg-[#0D1117] border-white/10 text-white"
                    required
                  />
                </div>
                <Button type="submit" variant="gold" className="w-full shadow-gold-glow" disabled={loading}>
                  {loading ? "Cadastrando..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
  );
};

export default Index;