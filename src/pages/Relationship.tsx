import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Copy, ExternalLink } from "lucide-react";
import { mockClients } from "@/data/mockClients";
import { toast } from "@/hooks/use-toast";

const Relationship = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Birthday clients (next 7 days)
  const birthdayClients = mockClients.filter(c => {
    if (!c.birthday) return false;
    const nextBirthday = new Date(now.getFullYear(), c.birthday.getMonth(), c.birthday.getDate());
    if (nextBirthday < now) {
      nextBirthday.setFullYear(now.getFullYear() + 1);
    }
    const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7;
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Inactive clients (30+ days)
  const inactiveClients = mockClients
    .filter(c => c.lastVisit && c.lastVisit < thirtyDaysAgo)
    .sort((a, b) => a.name.localeCompare(b.name));

  // VIP clients
  const vipClients = mockClients
    .filter(c => c.isVip)
    .sort((a, b) => a.name.localeCompare(b.name));

  const templates = {
    birthday: (name: string) =>
      `Fala, ${name}! Parabéns pelo seu aniversário! 🎉 Quando vier cortar o cabelo essa semana, você ganha 15% de desconto.`,
    inactive: (name: string) =>
      `Oi, ${name}! Tudo bem? Vi aqui que faz um tempinho que você não vem dar um tapa no visual. Quer agendar um horário essa semana?`,
    vip: (name: string) =>
      `Fala, ${name}! Você é um dos nossos clientes VIPs. Quando quiser marcar, me chama aqui e vejo o melhor horário pra você 😉`,
  };

  const copyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    toast({
      title: "Copiado!",
      description: "Mensagem copiada para a área de transferência",
    });
  };

  const sendWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const ClientList = ({ 
    clients, 
    template, 
    badgeVariant, 
    badgeLabel 
  }: { 
    clients: typeof mockClients;
    template: (name: string) => string;
    badgeVariant: "gold" | "navy" | "red";
    badgeLabel: string;
  }) => (
    <div className="space-y-3">
      {clients.map(client => {
        const message = template(client.name.split(" ")[0]);
        return (
          <Card key={client.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{client.name}</h3>
                  <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{client.phone}</p>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  {message}
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyMessage(message)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => sendWhatsApp(client.phone, message)}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-display mb-2">Relacionamento</h1>
        <p className="text-muted-foreground">
          Mantenha contato com seus clientes usando mensagens personalizadas
        </p>
      </div>

      <div className="space-y-8">
        {/* Birthday Section */}
        {birthdayClients.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-destructive" />
              <h2 className="text-2xl font-display">
                Aniversariantes ({birthdayClients.length})
              </h2>
            </div>
            <ClientList
              clients={birthdayClients}
              template={templates.birthday}
              badgeVariant="red"
              badgeLabel="Aniversário"
            />
          </div>
        )}

        {/* Inactive Section */}
        {inactiveClients.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-navy" />
              <h2 className="text-2xl font-display">
                Clientes Inativos ({inactiveClients.length})
              </h2>
            </div>
            <ClientList
              clients={inactiveClients}
              template={templates.inactive}
              badgeVariant="navy"
              badgeLabel="30+ dias"
            />
          </div>
        )}

        {/* VIP Section */}
        {vipClients.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-gold" />
              <h2 className="text-2xl font-display">
                Clientes VIP ({vipClients.length})
              </h2>
            </div>
            <ClientList
              clients={vipClients}
              template={templates.vip}
              badgeVariant="gold"
              badgeLabel="VIP"
            />
          </div>
        )}

        {birthdayClients.length === 0 && inactiveClients.length === 0 && vipClients.length === 0 && (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">
              Nenhum cliente para contatar no momento
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Relationship;
