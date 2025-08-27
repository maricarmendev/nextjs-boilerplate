// db/schema.ts
import { pgTable, text, timestamp, serial, boolean } from 'drizzle-orm/pg-core';

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id'), // Si tienes usuarios autenticados
  endpoint: text('endpoint').notNull().unique(), // URL única del Push Service
  p256dh: text('p256dh').notNull(), // Clave de encriptación
  auth: text('auth').notNull(), // Clave de autenticación
  userAgent: text('user_agent'), // Para identificar el dispositivo
  isActive: boolean('is_active').default(true), // Para desactivar suscripciones inválidas
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
