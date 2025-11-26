import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Phone, Calendar, Award, Users, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  phone: string | null;
  birthday: string | null;
  created_at: string;
}

interface ClientNote {
  id: string;
  client_id: string;
  author_id: string;
  note: string;
  created_at: string;
  author: {
    name: string;
  };
}

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "birthday">("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [noteText, setNoteText] = useState("");
  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Client[];
    },
  });

  // Fetch notes for selected client
  const { data: clientNotes = [] } = useQuery({
    queryKey: ["client-notes", selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return [];

      const { data, error } = await supabase
        .from("client_notes")
        .select(`
          *,
          author:profiles!client_notes_author_id_fkey(name)
        `)
        .eq("client_id", selectedClient.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ClientNote[];
    },
    enabled: !!selectedClient,
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ clientId, note }: { clientId: string; note: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("client_notes")
        .insert([{ client_id: clientId, author_id: user.id, note }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-notes"] });
      setNoteText("");
      toast.success("Nota adicionada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao adicionar nota");
    },
  });

  const getFilteredClients = (): Client[] => {
    let filtered = [...clients];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
      );
    }

    // Apply filters
    const now = new Date();

    switch (filter) {
      case "birthday":
        filtered = filtered.filter(c => {
          if (!c.birthday) return false;
          const birthday = new Date(c.birthday);
          const nextBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
          if (nextBirthday < now) {
            nextBirthday.setFullYear(now.getFullYear() + 1);
          }
          const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil <= 7;
        });
        break;
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  };

  const filteredClients = getFilteredClients();

  const getClientBadges = (client: Client) => {
    const badges = [];
    const now = new Date();

    if (client.birthday) {
      const birthday = new Date(client.birthday);
      const nextBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
      if (nextBirthday < now) {
        nextBirthday.setFullYear(now.getFullYear() + 1);
      }
      const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 7) {
        badges.push({ label: "Aniversário", variant: "destructive" as const });
      }
    }

    return badges;
  };

  const handleAddNote = () => {
    if (!selectedClient || !noteText.trim()) return;
    addNoteMutation.mutate({ clientId: selectedClient.id, note: noteText.trim() });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display mb-2">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
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
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const badges = getClientBadges(client);
          return (
            <Card key={client.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-display mb-1">{client.name}</h3>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </div>
                  )}
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
                {client.birthday && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Aniversário: {new Date(client.birthday).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>

              {/* Client Notes Section */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => setSelectedClient(client)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Notas
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Notas sobre {client.name}</DialogTitle>
                  </DialogHeader>
                  
                  {/* Add Note Form */}
                  <div className="space-y-4 border-b pb-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="note">Adicionar Nova Nota</Label>
                      <Textarea
                        id="note"
                        placeholder="Ex: É um cliente animado. Gosta de falar sobre futebol."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <Button 
                      onClick={handleAddNote}
                      disabled={!noteText.trim() || addNoteMutation.isPending}
                      variant="gold"
                    >
                      {addNoteMutation.isPending ? "Salvando..." : "Adicionar Nota"}
                    </Button>
                  </div>

                  {/* Display Notes */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Histórico de Notas</h3>
                    {clientNotes.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhuma nota registrada ainda
                      </p>
                    ) : (
                      clientNotes.map((note) => (
                        <Card key={note.id} className="p-4">
                          <p className="text-sm mb-2">{note.note}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Por: {note.author.name}</span>
                            <span>{new Date(note.created_at).toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
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
