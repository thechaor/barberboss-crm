import { CalendarDays, PlayCircle, Star, Award, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypeAnimation } from "@/components/TypeAnimation";

interface HeroProps {
  onOpenSchedule: () => void;
}

export function Hero({ onOpenSchedule }: HeroProps) {
  return (
    <section id="hero" className="relative min-h-screen pt-28 pb-16 flex items-center justify-center overflow-hidden">
      {/* Background Decorator & Glows */}
      <div className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 filter blur-xs">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117] via-[#0D1117]/80 to-[#0D1117]" />
      </div>

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Availability Live Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 border border-gold/30 backdrop-blur-md mb-8 shadow-gold-glow animate-fade-in">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <span className="text-xs md:text-sm font-semibold text-gold tracking-wide">
            Agenda aberta para hoje • Atendimento VIP
          </span>
        </div>

        {/* Main Cinema Heading */}
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold text-white leading-[1.08] tracking-tight mb-6 animate-fade-in">
          Eleve Seu <br />
          <span className="text-gradient-gold drop-shadow-md">
            Visual Premium
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
            className="text-xl sm:text-2xl text-gray-300 font-light tracking-wide"
          />
        </div>

        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 font-sans leading-relaxed">
          Viva uma experiência de cuidado pessoal incomparável. Profissionais renomados, ambiente exclusivo e atendimento sob medida.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            size="lg"
            variant="gold"
            onClick={onOpenSchedule}
            className="w-full sm:w-auto px-8 py-6 text-base font-bold shadow-gold-glow hover:scale-105 transition-transform premium-button"
          >
            <CalendarDays className="w-5 h-5 mr-2" />
            Agendar Horário Agora
          </Button>

          <a href="#servicos" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 py-6 text-base border-white/20 text-white hover:bg-white/10"
            >
              <PlayCircle className="w-5 h-5 mr-2 text-gold" />
              Ver Nossos Serviços
            </Button>
          </a>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/10 max-w-3xl mx-auto">
          <div className="p-3">
            <div className="font-display text-3xl md:text-4xl font-bold text-gradient-gold">10+</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mt-1 font-medium">Anos de Tradição</div>
          </div>
          <div className="p-3">
            <div className="font-display text-3xl md:text-4xl font-bold text-gradient-gold">5K+</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mt-1 font-medium">Clientes Atendidos</div>
          </div>
          <div className="p-3">
            <div className="font-display text-3xl md:text-4xl font-bold text-gradient-gold flex items-center justify-center gap-1">
              4.9 <Star className="w-5 h-5 text-gold fill-gold" />
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mt-1 font-medium">Avaliação Média</div>
          </div>
          <div className="p-3">
            <div className="font-display text-3xl md:text-4xl font-bold text-gradient-gold">100%</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mt-1 font-medium">Satisfação Garantida</div>
          </div>
        </div>
      </div>
    </section>
  );
}
