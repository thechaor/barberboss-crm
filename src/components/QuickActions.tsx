import { useState } from "react";
import { Plus, MessageCircle, Calendar, MapPin, Phone } from "lucide-react";

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
            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-xl transition-all hover:scale-105 border border-emerald-400/30 group"
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
            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-[#0D1117] font-bold text-sm shadow-gold-glow transition-all hover:scale-105 border border-gold/40 group"
          >
            <span>Agendar Horário</span>
            <div className="w-8 h-8 rounded-full bg-[#0D1117] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gold" />
            </div>
          </button>

          {/* Localização */}
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-surface border border-gold/20 text-gray-200 hover:text-gold font-medium text-sm shadow-xl transition-all hover:scale-105 group"
          >
            <span>Como Chegar</span>
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
              <MapPin className="w-4 h-4" />
            </div>
          </a>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-300 via-gold to-gold-600 text-[#0D1117] flex items-center justify-center shadow-gold-glow hover:scale-110 transition-all duration-300 border-2 border-white/20 group"
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