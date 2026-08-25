import { Clock, DollarSign, Scissors, CheckCircle2 } from "lucide-react";
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
  return (
    <div className="group cursor-pointer">
      <div className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:border-gold/50 hover:shadow-lg flex flex-col justify-between h-full">
        <div>
          {/* Header Badge & Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-gold">
              <Scissors className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
              Premium
            </span>
          </div>

          {/* Service Title & Description */}
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            {service.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
            {service.description || "Atendimento exclusivo com acabamento impecável e toalha quente."}
          </p>
        </div>

        {/* Details & CTA */}
        <div>
          <div className="flex items-center justify-between pt-4 border-t border-border mb-6">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-gold" />
              <span>{service.duration_minutes} min</span>
            </div>
            <div className="flex items-center text-xl font-bold text-foreground">
              <span>R$ {service.price.toFixed(2)}</span>
            </div>
          </div>

          <Button
            variant="gold"
            className="w-full font-bold text-sm tracking-wide py-5"
            onClick={() => onSelect(service.id)}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Agendar este Serviço
          </Button>
        </div>
      </div>
    </div>
  );
}
