import { CalendarDays, PlayCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypeAnimation } from "@/components/TypeAnimation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface HeroProps {
  onOpenSchedule: () => void;
}

export function Hero({ onOpenSchedule }: HeroProps) {
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const subtitleOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  if (!mounted) {
    return (
      <section id="hero" className="relative min-h-screen pt-28 pb-16 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-xs md:text-sm font-medium text-muted-foreground">
              Agenda aberta para hoje
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold text-foreground leading-[1.08] tracking-tight mb-6">
            Seu Visual No <br />
            <span className="text-gradient-gold">
              Estilo Premium
            </span>
          </h1>
          <div className="h-12 flex items-center justify-center mb-8">
            <span className="text-lg md:text-xl text-foreground/80 font-medium">
              Transformamos sua aparência
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen pt-28 pb-16 flex items-center justify-center overflow-hidden"
      role="banner"
    >
      {/* Background Decorator with Parallax */}
      <motion.div
        style={{
          y: isReducedMotion ? undefined : backgroundY,
        }}
        className="absolute inset-0 bg-gradient-to-b from-background via-background to-card"
      />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Availability Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs md:text-sm font-medium text-muted-foreground">
              Agenda aberta para hoje
            </span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          style={{ opacity: titleOpacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="font-display text-5xl sm:text-7xl md:text-8xl font-bold text-foreground leading-[1.08] tracking-tight mb-6"
        >
          Seu Visual No <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 animate-gradient-x">
            Estilo Premium
          </span>
        </motion.h1>

        {/* Subtitle with TypeAnimation */}
        <motion.div
          style={{ opacity: subtitleOpacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="h-12 flex items-center justify-center mb-8"
        >
          <TypeAnimation
            sequence={[
              "Transformamos sua aparência",
              2000,
              "Estilo que inspira confiança",
              2000,
              "Atendimento premium com qualidade",
              2000,
            ]}
            className="text-lg md:text-xl text-foreground/80 font-medium"
          />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            onClick={onOpenSchedule}
            className="h-12 px-8 text-base rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20"
          >
            <CalendarDays className="mr-2 h-5 w-5" />
            Agendar Agora
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-card border-2 border-background flex items-center justify-center overflow-hidden"
                >
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
              ))}
            </div>
            <span className="text-xs">+1200 clientes satisfeitos</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
