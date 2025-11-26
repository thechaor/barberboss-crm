import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0, "Preço inválido"),
  duration_minutes: z.number().min(5, "Duração mínima de 5 minutos").max(480),
});

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error loading services:", error);
      toast.error("Erro ao carregar serviços");
    } else {
      setServices(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const duration_minutes = parseInt(formData.get("duration_minutes") as string);

    try {
      const validation = serviceSchema.parse({
        name,
        description: description || undefined,
        price,
        duration_minutes,
      });

      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update({
            name: validation.name,
            description: validation.description || null,
            price: validation.price,
            duration_minutes: validation.duration_minutes,
          })
          .eq("id", editingService.id);

        if (error) throw error;
        toast.success("Serviço atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("services")
          .insert({
            name: validation.name,
            description: validation.description || null,
            price: validation.price,
            duration_minutes: validation.duration_minutes,
          });

        if (error) throw error;
        toast.success("Serviço criado com sucesso!");
      }

      setDialogOpen(false);
      setEditingService(null);
      loadServices();
      e.currentTarget.reset();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error saving service:", error);
        toast.error("Erro ao salvar serviço");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    const { error } = await supabase
      .from("services")
      .update({ is_active: !service.is_active })
      .eq("id", service.id);

    if (error) {
      console.error("Error toggling service:", error);
      toast.error("Erro ao atualizar status");
    } else {
      toast.success(service.is_active ? "Serviço desativado" : "Serviço ativado");
      loadServices();
    }
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingService(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos pela barbearia</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" onClick={() => setEditingService(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
              <DialogDescription>
                Preencha os dados do serviço
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Serviço *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingService?.name}
                  placeholder="Ex: Corte Degradê"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingService?.description || ""}
                  placeholder="Descrição do serviço (opcional)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingService?.price}
                    placeholder="45.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duração (min) *</Label>
                  <Input
                    id="duration_minutes"
                    name="duration_minutes"
                    type="number"
                    min="5"
                    max="480"
                    defaultValue={editingService?.duration_minutes}
                    placeholder="45"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gold" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className={!service.is_active ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {service.name}
                    {!service.is_active && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">Inativo</span>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {service.description || "Sem descrição"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(service)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-gold">R$ {service.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration_minutes} minutos</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Label htmlFor={`active-${service.id}`} className="text-sm cursor-pointer">
                    {service.is_active ? "Ativo" : "Inativo"}
                  </Label>
                  <Switch
                    id={`active-${service.id}`}
                    checked={service.is_active}
                    onCheckedChange={() => toggleServiceStatus(service)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum serviço cadastrado</p>
            <Button variant="gold" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Serviço
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Services;