import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Scissors, LogIn } from "lucide-react";
import logo from "@/assets/logo.png";

const Index = () => {
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
          <Link to="/agendar">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Agendar Horário
            </Button>
          </Link>
          
          <Link to="/auth">
            <Button 
              size="lg" 
              variant="outline"
              className="bg-transparent border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-lg px-8 py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Login
            </Button>
          </Link>
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
      </div>
    </div>
  );
};

export default Index;
