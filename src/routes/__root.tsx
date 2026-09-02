import { createRootRouteWithContext, Outlet } from "@tanstack/start";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnimatePresence } from "framer-motion";
import { ThemeContext } from "@/lib/theme-context";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import "@fontsource/inter";
import "@fontsource/playfair-display";

export const Route = createRootRouteWithContext<{
  theme: string;
  isLoadingTheme: boolean;
  themeError: Error | null;
}>()({
  component: RootComponent,
});

function RootComponent() {
  const { theme, isLoadingTheme, themeError } = Route.useContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (themeError) {
      console.error("Erro ao carregar tema:", themeError);
    }
  }, [themeError]);

  if (!mounted) return null;

  return (
    <html lang="pt-BR" className={`${theme === "dark" ? "dark" : ""}`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <AnimatePresence mode="wait">
              <Header />
            </AnimatePresence>

            <main className="flex-1">
              <AnimatePresence mode="wait">
                <Outlet />
              </AnimatePresence>
            </main>

            <AnimatePresence mode="wait">
              <Footer />
            </AnimatePresence>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

function Header() {
  const { theme, isLoadingTheme, setTheme } = ThemeContext.useTheme();

  if (isLoadingTheme) {
    return (
      <header className="h-16 w-full border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="font-serif font-bold text-lg">B</span>
          </div>
          <span className="font-serif font-bold text-xl tracking-tight hidden sm:inline">
            Barbearia
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema"
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button asChild variant="default" className="hidden sm:flex">
            <Link to="/agendar">Agendar</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Barbearia. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Início
            </Link>
            <Link
              to="/sobre"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sobre
            </Link>
            <Link
              to="/contato"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contato
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}