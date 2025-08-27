'use client';

import { useState } from 'react';
import { SendNotificationData, sendNotification } from '@/lib/actions/send-notification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export function NotificationAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SendNotificationData | null>(null);
  
  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    const response = await sendNotification(formData);
    
    if (!response.success) {
      setError(response.error?.message || 'Error al enviar notificación');
      setIsLoading(false);
      return;
    }

    setResult(response.data || null);
    setIsLoading(false);
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Enviar Notificación Push</CardTitle>
        <CardDescription>
          Envía notificaciones a todos los usuarios suscritos
        </CardDescription>
      </CardHeader>
      
      <form action={handleSubmit}>
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
          
          {result && (
            <Alert>
              <AlertDescription>
                ✅ Notificación enviada exitosamente a {result.sent} usuario{result.sent !== 1 ? 's' : ''}
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
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