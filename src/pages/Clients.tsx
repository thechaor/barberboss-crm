import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Phone, Calendar, Award, Users } from "lucide-react";
import { mockClients } from "@/data/mockClients";
import { Client } from "@/types/client";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "birthday" | "inactive" | "vip">("all");

  const getFilteredClients = (): Client[] => {
    let filtered = [...mockClients];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
      );
    }

    // Apply filters
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case "birthday":
        filtered = filtered.filter(c => {
          if (!c.birthday) return false;
          const nextBirthday = new Date(now.getFullYear(), c.birthday.getMonth(), c.birthday.getDate());
          if (nextBirthday < now) {
            nextBirthday.setFullYear(now.getFullYear() + 1);
          }
          const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil <= 7;
        });
        break;
      case "inactive":
        filtered = filtered.filter(c => c.lastVisit && c.lastVisit < thirtyDaysAgo);
        break;
      case "vip":
        filtered = filtered.filter(c => c.isVip);
        break;
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  };

  const filteredClients = getFilteredClients();

  const getClientBadges = (client: Client) => {
    const badges = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (client.isVip) {
      badges.push({ label: "VIP", variant: "gold" as const });
    }

    if (client.birthday) {
      const nextBirthday = new Date(now.getFullYear(), client.birthday.getMonth(), client.birthday.getDate());
      if (nextBirthday < now) {
        nextBirthday.setFullYear(now.getFullYear() + 1);
      }
      const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 7) {
        badges.push({ label: "Aniversário", variant: "red" as const });
      }
    }

    if (client.lastVisit && client.lastVisit < thirtyDaysAgo) {
      badges.push({ label: "30+ dias", variant: "navy" as const });
    }

    return badges;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display mb-2">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
        <Button variant="gold" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "gold" : "secondary"}
            onClick={() => setFilter("all")}
          >
            Todos
          </Button>
          <Button
            variant={filter === "birthday" ? "gold" : "secondary"}
            onClick={() => setFilter("birthday")}
          >
            Aniversariantes
          </Button>
          <Button
            variant={filter === "inactive" ? "gold" : "secondary"}
            onClick={() => setFilter("inactive")}
          >
            30+ dias
          </Button>
          <Button
            variant={filter === "vip" ? "gold" : "secondary"}
            onClick={() => setFilter("vip")}
          >
            VIP
          </Button>
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const badges = getClientBadges(client);
          return (
            <Card key={client.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-display mb-1">{client.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </div>
                </div>
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-end">
                    {badges.map((badge, idx) => (
                      <Badge key={idx} variant={badge.variant}>
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Última visita: {client.lastVisit?.toLocaleDateString('pt-BR') || "Nunca"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="w-4 h-4" />
                  {client.visitCount} visitas
                </div>
              </div>

              {client.notes && (
                <p className="mt-4 text-sm text-muted-foreground border-t pt-3">
                  {client.notes}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">Nenhum cliente encontrado</p>
        </div>
      )}
    </div>
  );
};

export default Clients;
