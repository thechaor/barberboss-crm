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
    <div className="flex min-h-screen bg-[#0D1117] text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-surface text-gray-200 border-r border-gold/15 flex flex-col shadow-xl">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <img src={logo} alt="BarberBoss" className="h-10" />
          <h1 className="text-xl font-display font-bold text-white">
            Barber<span className="text-gradient-gold">Boss</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-300 hover:text-white hover:bg-white/5"
              activeClassName="bg-gradient-to-r from-gold/20 to-gold/5 text-gold border border-gold/30 font-semibold shadow-gold-glow"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#0D1117]/50">
          {user && (
            <div className="px-4 py-2 text-xs text-gray-400 truncate">
              {user.email}
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-white/10"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="font-medium">Sair</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#0D1117]">
        {children}
      </main>
    </div>
  );
};

export default Layout;
