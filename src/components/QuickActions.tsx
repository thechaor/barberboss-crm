import { useState } from "react";
import { Plus, MessageCircle, Calendar, MapPin } from "lucide-react";

interface QuickActionsProps {
  onOpenSchedule: () => void;
}

export function QuickActions({ onOpenSchedule }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = "5511999999999";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Gostaria de mais informações sobre os serviços da BarberBoss."
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex flex-col gap-3 animate-fade-in-up">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-lg transition-all hover:scale-105"
          >
            <span>Falar no WhatsApp</span>
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
          </a>

          {/* Agendamento */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenSchedule();
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-gold text-gold-foreground font-bold text-sm shadow-lg transition-all hover:scale-105"
          >
            <span>Agendar Horário</span>
            <div className="w-8 h-8 rounded-full bg-gold-foreground flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gold" />
            </div>
          </button>

          {/* Localização */}
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-card border border-border text-foreground hover:text-gold font-medium text-sm shadow-lg transition-all hover:scale-105"
          >
            <span>Como Chegar</span>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-gold">
              <MapPin className="w-4 h-4" />
            </div>
          </a>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gold text-gold-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
        aria-label="Ações Rápidas"
      >
        <Plus
          className={`w-7 h-7 font-bold transition-transform duration-300 ${
            isOpen ? "rotate-45" : "rotate-0"
          }`}
        />
      </button>
    </div>
  );
}
