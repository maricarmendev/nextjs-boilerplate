'use client';

import { useState } from 'react';
import { sendNotification } from '@/lib/actions/send-notification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export function NotificationAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    
    try {
      const response = await sendNotification(formData);
      
      if (response.success) {
        const sent = response.data?.sent || 0;
        toast.success(`Notificación enviada exitosamente a ${sent} usuario${sent !== 1 ? 's' : ''}`);
        // Limpiar formulario
        (document.getElementById('notification-form') as HTMLFormElement)?.reset();
      } else {
        toast.error(response.error?.message || 'Error al enviar notificación');
      }
    } catch {
      toast.error('Error inesperado al enviar notificación');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Enviar Notificación Push</CardTitle>
        <CardDescription>
          Envía notificaciones a todos los usuarios suscritos
        </CardDescription>
      </CardHeader>
      
      <form id="notification-form" action={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ej: Nueva actualización disponible"
              required
              maxLength={100}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Describe el contenido de la notificación..."
              required
              maxLength={300}
              rows={4}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL de destino (opcional)</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://ejemplo.com/pagina"
              disabled={isLoading}
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Enviando...' : 'Enviar Notificación'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}