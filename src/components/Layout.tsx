import { ReactNode } from "react";
import { LayoutDashboard, Calendar, Users, MessageSquare, Scissors, LogOut, ImageIcon } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  
  const menuItems = [
    { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { title: "Agenda", path: "/agenda", icon: Calendar },
    { title: "Clientes", path: "/clientes", icon: Users },
    { title: "Barbeiros", path: "/barbeiros", icon: Users },
    { title: "Serviços", path: "/servicos", icon: Scissors },
    { title: "Galeria", path: "/galeria", icon: ImageIcon },
    { title: "Relacionamento", path: "/relacionamento", icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar - mobile: hidden, desktop: visible */}
      <aside className="hidden lg:flex w-64 bg-card text-foreground border-r border-border flex-col fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <img src={logo} alt="BarberBoss" className="h-10" />
          <h1 className="text-xl font-display font-bold text-foreground">
            Barber<span className="text-gold">Boss</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground hover:bg-muted"
              activeClassName="bg-muted text-foreground font-medium"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border space-y-3">
          {user && (
            <div className="px-4 py-2 text-xs text-muted-foreground truncate">
              {user.email}
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="font-medium">Sair</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-card border-b border-border flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={logo} alt="BarberBoss" className="h-8" />
          <span className="text-lg font-display font-bold text-foreground">
            Barber<span className="text-gold">Boss</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="ml-1 text-sm">Sair</span>
        </Button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border flex justify-around py-2 px-1">
        {menuItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            activeClassName="text-gold"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background lg:ml-64 pt-14 lg:pt-0 pb-16 lg:pb-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;
