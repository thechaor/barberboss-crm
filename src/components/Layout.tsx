import { ReactNode } from "react";
import { LayoutDashboard, Calendar, Users, MessageSquare } from "lucide-react";
import { NavLink } from "@/components/NavLink";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const menuItems = [
    { title: "Dashboard", path: "/", icon: LayoutDashboard },
    { title: "Agenda", path: "/agenda", icon: Calendar },
    { title: "Clientes", path: "/clientes", icon: Users },
    { title: "Relacionamento", path: "/relacionamento", icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground border-r border-border/50">
        <div className="p-6 border-b border-border/50">
          <h1 className="text-2xl font-display font-bold">
            Barber<span className="text-gold">Boss</span>
          </h1>
        </div>
        
        <nav className="p-4 space-y-2">
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
