import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Phone, Mail, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Barber {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
}

const Barbers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    photo_url: "",
  });

  const { data: barbers, isLoading } = useQuery({
    queryKey: ["barbers-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("barbers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Barber[];
    },
  });

  const createBarber = useMutation({
    mutationFn: async (newBarber: typeof formData) => {
      const { error } = await supabase.from("barbers").insert([newBarber]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbers-admin"] });
      toast({ title: "Barbeiro adicionado com sucesso!" });
      setIsDialogOpen(false);
      setFormData({ name: "", phone: "", email: "", photo_url: "" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar barbeiro", variant: "destructive" });
    },
  });

  const toggleBarber = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("barbers")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbers-admin"] });
      toast({ title: "Status atualizado!" });
    },
  });

  const deleteBarber = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("barbers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbers-admin"] });
      toast({ title: "Barbeiro removido" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast({ title: "Preencha nome e telefone", variant: "destructive" });
      return;
    }
    createBarber.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Barbeiros</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Barbeiro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Barbeiro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">WhatsApp *</Label>
                <Input
                  id="phone"
                  placeholder="5511999999999"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="photo">URL da Foto</Label>
                <Input
                  id="photo"
                  value={formData.photo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, photo_url: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full" variant="gold">
                Adicionar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers?.map((barber) => (
          <Card key={barber.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{barber.name}</span>
                <Switch
                  checked={barber.is_active}
                  onCheckedChange={(checked) =>
                    toggleBarber.mutate({ id: barber.id, is_active: checked })
                  }
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {barber.photo_url && (
                <img
                  src={barber.photo_url}
                  alt={barber.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Phone className="mr-2 h-4 w-4" />
                  {barber.phone}
                </div>
                {barber.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4" />
                    {barber.email}
                  </div>
                )}
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full mt-4"
                onClick={() => deleteBarber.mutate(barber.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {barbers?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum barbeiro cadastrado ainda.
        </div>
      )}
    </div>
  );
};

export default Barbers;
