import { NotificationAdmin } from "@/components/push-notifications/notification-admin";

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1>Panel de Administración</h1>
      <NotificationAdmin /> 
    </div>  
  )
}