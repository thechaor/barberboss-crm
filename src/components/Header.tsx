import { useState, useEffect } from "react";
import { Scissors, Menu, X, Calendar, LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

interface HeaderProps {
  onOpenSchedule: () => void;
  onOpenLogin: () => void;
}

export function Header({ onOpenSchedule, onOpenLogin }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Início", href: "#hero" },
    { label: "Serviços", href: "#servicos" },
    { label: "Trabalhos", href: "#galeria" },
    { label: "Depoimentos", href: "#depoimentos" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0D1117]/90 backdrop-blur-xl border-b border-gold/20 shadow-neon-gold py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-300 via-gold to-gold-600 flex items-center justify-center shadow-gold-glow transform group-hover:rotate-12 transition-transform duration-300">
              <Scissors className="w-5 h-5 text-[#0D1117]" />
            </div>
            <span className="corner-glow" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold text-white tracking-wide leading-none">
              Barber<span className="text-gradient-gold">Boss</span>
            </span>
            <span className="text-[10px] text-gold/70 tracking-[0.2em] uppercase font-medium mt-1">
              Premium Barbershop
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-gray-300 hover:text-gold transition-colors relative py-1 group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gold-300 to-gold group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenLogin}
            className="border-gold/30 text-white hover:bg-gold/10 hover:border-gold"
          >
            <LogIn className="w-4 h-4 mr-2 text-gold" />
            Login
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={onOpenSchedule}
            className="shadow-gold-glow hover:scale-105 transition-transform"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Agendar Horário
          </Button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:text-gold focus:outline-none"
          aria-label="Alternar Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-[#0D1117]/95 backdrop-blur-2xl border-b border-gold/20 p-6 flex flex-col gap-4 animate-fade-in z-50">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-gray-200 hover:text-gold py-2 border-b border-white/5"
            >
              {item.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="gold"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSchedule();
              }}
              className="w-full justify-center shadow-gold-glow"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Horário
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full justify-center border-gold/30 text-white"
            >
              <LogIn className="w-4 h-4 mr-2 text-gold" />
              Entrar na Conta
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}