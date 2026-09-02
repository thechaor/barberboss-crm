import { createRootRouteWithContext, Outlet } from "@tanstack/start";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnimatePresence, motion } from "framer-motion";
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
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>

            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}