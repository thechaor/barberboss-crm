import { CalendarDays, PlayCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypeAnimation } from "@/components/TypeAnimation";

interface HeroProps {
  onOpenSchedule: () => void;
}

export function Hero({ onOpenSchedule }: HeroProps) {
  return (
    <section id="hero" className="relative min-h-screen pt-28 pb-16 flex items-center justify-center overflow-hidden">
      {/* Background Decorator */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Availability Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-xs md:text-sm font-medium text-muted-foreground">
            Agenda aberta para hoje
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold text-foreground leading-[1.08] tracking-tight mb-6">
          Seu Visual No <br />
          <span className="text-gradient-gold">
            Estilo Premium
          </span>
        </h1>

        {/* Subtitle with TypeAnimation */}
        <div className="h-12 flex items-center justify-center mb-8">
          <TypeAnimation
            sequence={[
              "Cortes Clássicos Reimaginados",
              2500,
              "Barba Noiva & Navalha Tradicional",
              2500,
              "Estilo, Sofisticação e Tradição",
              2500,
            ]}
            speed={40}
            className="text-xl sm:text-2xl text-muted-foreground font-light tracking-wide"
          />
        </div>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 font-sans leading-relaxed">
          Viva uma experiência de cuidado pessoal incomparável. Profissionais renomados, ambiente exclusivo e atendimento sob medida.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            size="lg"
            variant="gold"
            onClick={onOpenSchedule}
            className="w-full sm:w-auto px-8 py-6 text-base font-bold"
          >
            <CalendarDays className="w-5 h-5 mr-2" />
            Agendar Horário Agora
          </Button>

          <a href="#servicos" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 py-6 text-base border-border text-foreground hover:bg-muted"
            >
              <PlayCircle className="w-5 h-5 mr-2 text-gold" />
              Ver Nossos Serviços
            </Button>
          </a>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-border max-w-3xl mx-auto">
          <div className="p-3">
            <div className="font-display text-3xl md:text-4xl font-bold text-foreground">10+</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1 font-medium">Anos de Tradição</div>
          </div>
          <div className="p-3">
            <div className="font-display text-3xl md:text-4xl font-bold text-foreground">5K+</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1 font-medium">Clientes Atendidos</div>
          </div>
          <div className="p-3">
            <div className="font-display text-3xl md:text-4xl font-bold text-foreground flex items-center justify-center gap-1">
              4.9 <Star className="w-5 h-5 text-gold fill-gold" />
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1 font-medium">Avaliação Média</div>
          </div>
          <div className="p-3">
            <div className="font-display text-3xl md:text-4xl font-bold text-foreground">100%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1 font-medium">Satisfação Garantida</div>
          </div>
        </div>
      </div>
    </section>
  );
}
