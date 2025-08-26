ALTER TABLE "user" ADD COLUMN "role" text NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;