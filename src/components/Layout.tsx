import { ReactNode } from "react";
import { LayoutDashboard, Calendar, Users, MessageSquare, Scissors, LogOut } from "lucide-react";
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
    { title: "Serviços", path: "/servicos", icon: Scissors },
    { title: "Relacionamento", path: "/relacionamento", icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground border-r border-border/50 flex flex-col">
        <div className="p-6 border-b border-border/50 flex items-center gap-3">
          <img src={logo} alt="BarberBoss" className="h-10" />
          <h1 className="text-xl font-display font-bold">
            Barber<span className="text-gold">Boss</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-white/10"
              activeClassName="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border/50 space-y-3">
          {user && (
            <div className="px-4 py-2 text-sm text-primary-foreground/70">
              {user.email}
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-primary-foreground hover:bg-white/10"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
