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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Star, ShieldCheck, MapPin, Phone, Award, Scissors, Sparkles } from "lucide-react";
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
  "16:00", "16:30", "17:00", "17:30", "18:00",
];

const testimonials = [
  {
    name: "Ricardo Alves",
    role: "Cliente há 3 anos",
    comment: "Atendimento impecável! A pontualidade e o profissionalismo da BarberBoss não têm comparação na cidade.",
  },
  {
    name: "Gabriel Santos",
    role: "Empresário",
    comment: "A experiência do ritual de barba com toalha quente é sensacional. Saio renovado a cada visita.",
  },
  {
    name: "Marcelo Fonseca",
    role: "Advogado",
    comment: "O sistema de agendamento online é super rápido. Chego e sou atendido exatamente no horário marcado.",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState<string>();
  const [selectedTime, setSelectedTime] = useState<string>();

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

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      const validation = loginSchema.parse({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });
      const { error, role } = await signIn(validation.email, validation.password);

      if (error) {
        toast.error(error.message.includes("Invalid login credentials") ? "Email ou senha incorretos" : error.message);
        return;
      }

      toast.success("Login realizado com sucesso!");
      setIsLoginOpen(false);
      navigate(role === "admin" ? "/dashboard" : role === "barber" ? "/barbeiro-dashboard" : "/minha-conta");
    } catch (error) {
      if (error instanceof z.ZodError) toast.error(error.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      const validation = signupSchema.parse({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        phone: formData.get("phone") as string,
      });
      const { error } = await signUp(validation.email, validation.password, validation.name, validation.phone);

      if (error) {
        toast.error(error.message.includes("already registered") ? "Este email já está cadastrado" : error.message);
        return;
      }

      toast.success("Cadastro realizado com sucesso!");
      setIsLoginOpen(false);
      navigate("/minha-conta");
    } catch (error) {
      if (error instanceof z.ZodError) toast.error(error.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setScheduleLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      const validation = appointmentSchema.parse({
        client_name: formData.get("client_name") as string,
        client_phone: formData.get("client_phone") as string,
        client_email: formData.get("client_email") as string,
        password: formData.get("password") as string,
      });

      if (!selectedService || !selectedDate || !selectedTime) {
        toast.error("Selecione o serviço, a data no calendário e o horário");
        return;
      }

      const { error: authError } = await supabase.auth.signUp({
        email: validation.client_email,
        password: validation.password,
        options: {
          emailRedirectTo: `${window.location.origin}/minha-conta`,
          data: { name: validation.client_name, phone: validation.client_phone },
        },
      });

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
        return;
      }

      toast.success(authError?.message.includes("already registered") ? "Agendamento criado! Você já possui conta cadastrada." : "Agendamento solicitado com sucesso!");
      setIsScheduleOpen(false);
      setSelectedDate(undefined);
      setSelectedService(undefined);
      setSelectedTime(undefined);
    } catch (error) {
      if (error instanceof z.ZodError) toast.error(error.errors[0].message);
    } finally {
      setScheduleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Header onOpenSchedule={() => setIsScheduleOpen(true)} onOpenLogin={() => setIsLoginOpen(true)} />
      <Hero onOpenSchedule={() => setIsScheduleOpen(true)} />

      <section className="relative -mt-8 px-4 pb-8 sm:-mt-12 sm:pb-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-gold-glow sm:grid-cols-3">
          {[
            { icon: Scissors, title: "Cuidado preciso", text: "Técnicas clássicas e atuais." },
            { icon: Award, title: "Padrão premium", text: "Detalhes em cada atendimento." },
            { icon: Sparkles, title: "Experiência completa", text: "Ambiente feito para você." },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4 bg-card px-5 py-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-gold">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="servicos" className="relative border-y border-border bg-card/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-16">
            <span className="mb-4 inline-block rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold">Menu de experiências</span>
            <h2 className="mb-4 font-display text-4xl font-bold text-foreground sm:text-6xl">Nossos serviços <span className="text-gradient-gold">exclusivos</span></h2>
            <p className="text-base text-muted-foreground sm:text-lg">Escolha o tratamento ideal para o seu estilo. Todos os procedimentos acompanham consultoria visagista.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {services.map((service) => <ServiceCard3D key={service.id} service={service} onSelect={handleServiceSelect} />)}
          </div>
        </div>
      </section>

      {galleryImages.length > 0 && (
        <section id="galeria" className="relative py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-16">
              <span className="mb-4 inline-block rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold">Galeria de transformações</span>
              <h2 className="mb-4 font-display text-4xl font-bold text-foreground sm:text-6xl">Nossos <span className="text-gradient-gold">trabalhos</span></h2>
              <p className="text-base text-muted-foreground sm:text-lg">Confira a excelência e o rigor nos detalhes em cada corte e acabamento.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {galleryImages.map((image) => (
                <div key={image.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/50">
                  <img src={image.image_url} alt={image.title || "Trabalho da barbearia"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background/90 via-background/20 to-transparent p-3 opacity-100 sm:p-4 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    <p className="text-xs font-semibold text-foreground sm:text-sm">{image.title || "Corte personalizado BarberBoss"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="depoimentos" className="border-y border-border bg-card/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-16">
            <span className="mb-4 inline-block rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold">Avaliações reais</span>
            <h2 className="font-display text-4xl font-bold text-foreground sm:text-6xl">O que dizem nossos <span className="text-gradient-gold">clientes VIP</span></h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-8">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-gold/30 hover:shadow-gold-glow">
                <div className="mb-5 flex text-gold">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-4 w-4 fill-gold" aria-hidden="true" />)}</div>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground italic">“{testimonial.comment}”</p>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div><h3 className="font-semibold text-foreground">{testimonial.name}</h3><p className="text-xs text-muted-foreground">{testimonial.role}</p></div>
                  <ShieldCheck className="h-5 w-5 text-gold" aria-label="Avaliação verificada" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-10 text-center sm:mb-12"><h2 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-5xl">Dúvidas <span className="text-gradient-gold">frequentes</span></h2><p className="text-muted-foreground">Tudo o que você precisa saber antes da sua primeira visita.</p></div>
        <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
          {[
            ["Como funciona o agendamento online?", "Você seleciona o serviço desejado, a data no calendário e o horário de sua preferência. Sua conta é criada automaticamente e você recebe as confirmações diretas no seu e-mail e WhatsApp."],
            ["É necessário chegar com antecedência?", "Recomendamos chegar de 5 a 10 minutos antes do seu horário agendado para desfrutar de um drink de boas-vindas no nosso lounge."],
            ["Posso reagendar ou cancelar meu horário?", "Sim! Pelo painel Minha Conta você tem total liberdade para gerenciar e visualizar seu histórico de agendamentos."],
          ].map(([question, answer], index) => (
            <AccordionItem key={question} value={`item-${index + 1}`} className="rounded-2xl border border-border bg-card px-5 sm:px-6">
              <AccordionTrigger className="py-5 text-left text-base text-foreground hover:text-gold sm:text-lg">{question}</AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <footer className="border-t border-border bg-card pb-10 pt-14 text-muted-foreground sm:pt-16">
        <div className="mx-auto mb-10 grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div><div className="mb-4 flex items-center gap-2"><img src={logo} alt="BarberBoss" className="h-10" /><span className="font-display text-2xl font-bold text-foreground">Barber<span className="text-gold">Boss</span></span></div><p className="max-w-xs text-sm leading-relaxed">Tradição, estilo e cuidado pessoal elevado ao mais alto padrão.</p></div>
          <div><h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gold">Navegação</h3><ul className="space-y-2 text-sm"><li><a href="#hero" className="transition-colors hover:text-gold">Início</a></li><li><a href="#servicos" className="transition-colors hover:text-gold">Serviços</a></li><li><a href="#galeria" className="transition-colors hover:text-gold">Galeria</a></li><li><a href="#faq" className="transition-colors hover:text-gold">Perguntas frequentes</a></li></ul></div>
          <div><h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gold">Horário de funcionamento</h3><p className="mb-1 text-sm">Segunda a sábado: 09h00 às 20h00</p><p className="text-sm">Domingo: fechado</p></div>
          <div><h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gold">Contato</h3><p className="mb-2 flex items-center gap-2 text-sm"><Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />(11) 99999-9999</p><p className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />Av. Paulista, 1000 - São Paulo/SP</p></div>
        </div>
        <div className="mx-auto max-w-7xl border-t border-border px-4 pt-6 text-center text-xs sm:px-6 lg:px-8">© {new Date().getFullYear()} BarberBoss CRM. Todos os direitos reservados.</div>
      </footer>

      <QuickActions onOpenSchedule={() => setIsScheduleOpen(true)} />

      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-lg">
          <DialogHeader className="text-center"><img src={logo} alt="BarberBoss" className="mx-auto mb-2 h-14" /><DialogTitle className="font-display text-2xl text-foreground">Agendar <span className="text-gradient-gold">horário</span></DialogTitle><DialogDescription className="text-muted-foreground">Escolha seu serviço e defina a data ideal no calendário.</DialogDescription></DialogHeader>
          <form onSubmit={handleScheduleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2"><Label htmlFor="sched-name">Nome completo *</Label><Input id="sched-name" name="client_name" placeholder="Seu nome completo" className="border-border bg-background" required /></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="sched-phone">WhatsApp *</Label><Input id="sched-phone" name="client_phone" type="tel" placeholder="(00) 00000-0000" className="border-border bg-background" required /></div><div className="space-y-2"><Label htmlFor="sched-email">Email *</Label><Input id="sched-email" name="client_email" type="email" placeholder="seu@email.com" className="border-border bg-background" required /></div></div>
            <div className="space-y-2"><Label htmlFor="sched-password">Senha para sua conta *</Label><Input id="sched-password" name="password" type="password" placeholder="Mínimo 6 caracteres" className="border-border bg-background" required /></div>
            <div className="space-y-2"><Label>Serviço *</Label><Select value={selectedService} onValueChange={setSelectedService}><SelectTrigger className="border-border bg-background"><SelectValue placeholder="Escolha o serviço" /></SelectTrigger><SelectContent className="border-border bg-card">{services.map((service) => <SelectItem key={service.id} value={service.id}>{service.name} - R$ {service.price.toFixed(2)} ({service.duration_minutes} min)</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Selecione a data *</Label><div className="flex flex-col items-center rounded-xl border border-border bg-background p-2"><Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => { const today = new Date(); today.setHours(0, 0, 0, 0); return date < today; }} locale={ptBR} className="rounded-md border-0" />{selectedDate && <p className="mt-1 text-xs font-semibold text-gold">Data selecionada: {format(selectedDate, "PPP", { locale: ptBR })}</p>}</div></div>
            <div className="space-y-2"><Label>Horário *</Label><Select value={selectedTime} onValueChange={setSelectedTime}><SelectTrigger className="border-border bg-background"><SelectValue placeholder="Escolha o horário" /></SelectTrigger><SelectContent className="border-border bg-card">{timeSlots.map((time) => <SelectItem key={time} value={time}>{time}</SelectItem>)}</SelectContent></Select></div>
            <Button type="submit" variant="gold" className="mt-4 w-full" disabled={scheduleLoading}>{scheduleLoading ? "Processando..." : "Confirmar agendamento"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader className="text-center"><img src={logo} alt="BarberBoss" className="mx-auto mb-2 h-16" /><DialogTitle className="font-display text-2xl text-foreground">Barber<span className="text-gold">Boss</span></DialogTitle><DialogDescription className="text-muted-foreground">Acesse sua conta do sistema.</DialogDescription></DialogHeader>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-background"><TabsTrigger value="login">Login</TabsTrigger><TabsTrigger value="signup">Cadastro</TabsTrigger></TabsList>
            <TabsContent value="login"><form onSubmit={handleLogin} className="space-y-4"><div className="space-y-2"><Label htmlFor="login-email">Email</Label><Input id="login-email" name="email" type="email" placeholder="seu@email.com" className="border-border bg-background" required /></div><div className="space-y-2"><Label htmlFor="login-password">Senha</Label><Input id="login-password" name="password" type="password" placeholder="••••••" className="border-border bg-background" required /></div><Button type="submit" variant="gold" className="w-full" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button></form></TabsContent>
            <TabsContent value="signup"><form onSubmit={handleSignup} className="space-y-4"><div className="space-y-2"><Label htmlFor="signup-name">Nome completo</Label><Input id="signup-name" name="name" placeholder="Seu nome" className="border-border bg-background" required /></div><div className="space-y-2"><Label htmlFor="signup-email">Email</Label><Input id="signup-email" name="email" type="email" placeholder="seu@email.com" className="border-border bg-background" required /></div><div className="space-y-2"><Label htmlFor="signup-phone">Telefone (opcional)</Label><Input id="signup-phone" name="phone" type="tel" placeholder="(00) 00000-0000" className="border-border bg-background" /></div><div className="space-y-2"><Label htmlFor="signup-password">Senha</Label><Input id="signup-password" name="password" type="password" placeholder="••••••" className="border-border bg-background" required /></div><Button type="submit" variant="gold" className="w-full" disabled={loading}>{loading ? "Cadastrando..." : "Criar conta"}</Button></form></TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
