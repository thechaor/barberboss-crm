import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Scissors, LogIn } from "lucide-react";
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

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
        setIsOpen(false);
        
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
        setIsOpen(false);
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
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-6">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-primary-foreground mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            BarberBoss
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
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            asChild
          >
            <Link to="/agendar">
              <Calendar className="mr-2 h-5 w-5" />
              Agendar Horário
            </Link>
          </Button>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              
              <Tabs defaultValue="signup" className="w-full">
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
            <Calendar className="h-8 w-8 text-accent mb-3" />
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
