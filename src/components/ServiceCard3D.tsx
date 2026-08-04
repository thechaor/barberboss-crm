import { useState } from "react";
import { Clock, DollarSign, Scissors, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration_minutes: number;
  };
  onSelect: (serviceId: string) => void;
}

export function ServiceCard3D({ service, onSelect }: ServiceCardProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Subtle 3D tilt calculation
    setRotate({
      x: -(y / rect.height) * 15,
      y: (x / rect.width) * 15,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      className="perspective-1000 group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="bg-surface border border-gold/15 rounded-2xl p-6 relative transition-all duration-300 ease-out shadow-lg hover:border-gold/50 hover:shadow-gold-glow flex flex-col justify-between h-full"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Glow Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-gold/10 rounded-2xl transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />

        <div>
          {/* Header Badge & Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
              <Scissors className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold">
              <Sparkles className="w-3 h-3" /> Premium
            </span>
          </div>

          {/* Service Title & Description */}
          <h3 className="font-display text-2xl font-bold text-white mb-2 group-hover:text-gold transition-colors">
            {service.name}
          </h3>
          <p className="text-sm text-gray-400 mb-6 line-clamp-2">
            {service.description || "Atendimento exclusivo com acabamento impecável e toalha quente."}
          </p>
        </div>

        {/* Details & CTA */}
        <div>
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mb-6">
            <div className="flex items-center gap-1.5 text-sm text-gray-300">
              <Clock className="w-4 h-4 text-gold" />
              <span>{service.duration_minutes} min</span>
            </div>
            <div className="flex items-center text-xl font-bold text-gradient-gold">
              <span>R$ {service.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Tooltip trigger button */}
          <div className="relative group/btn">
            <Button
              variant="gold"
              className="w-full shadow-gold-glow font-bold text-sm tracking-wide py-5"
              onClick={() => onSelect(service.id)}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Agendar este Serviço
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}