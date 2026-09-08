CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"guest_token" varchar(120),
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"currency" varchar(10) DEFAULT 'ARS' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"seller_id" uuid,
	"product_name" varchar(255) NOT NULL,
	"product_image" text,
	"unit_price" numeric(12, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_timeline_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"event_type" varchar(80) NOT NULL,
	"actor_type" varchar(50) NOT NULL,
	"actor_id" uuid,
	"description" text NOT NULL,
	"metadata" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"buyer_id" uuid NOT NULL,
	"status" varchar(40) DEFAULT 'pendiente' NOT NULL,
	"payment_status" varchar(40) DEFAULT 'pending' NOT NULL,
	"currency" varchar(10) DEFAULT 'ARS' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0' NOT NULL,
	"shipping_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"shipping_name" varchar(200),
	"shipping_phone" varchar(50),
	"shipping_address" varchar(300),
	"shipping_city" varchar(120),
	"shipping_province" varchar(120),
	"shipping_zip" varchar(30),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "escrow_holds" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"payment_id" integer NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"status" varchar(30) DEFAULT 'held' NOT NULL,
	"auto_release_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_ledger_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_id" integer,
	"order_id" integer,
	"type" varchar(50) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"balance_after" numeric(14, 2) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'ARS' NOT NULL,
	"status" varchar(40) DEFAULT 'pending' NOT NULL,
	"provider" varchar(50) DEFAULT 'simulator' NOT NULL,
	"provider_payment_id" varchar(150),
	"payment_method" varchar(50) DEFAULT 'card' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "shipment_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"shipment_id" integer NOT NULL,
	"status" varchar(40) NOT NULL,
	"location" varchar(150) NOT NULL,
	"description" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"carrier" varchar(80) DEFAULT 'Correo Express' NOT NULL,
	"tracking_code" varchar(120) NOT NULL,
	"status" varchar(40) DEFAULT 'pendiente_preparacion' NOT NULL,
	"service_type" varchar(60) DEFAULT 'estandar' NOT NULL,
	"shipping_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"estimated_delivery_at" timestamp with time zone,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"destination_address" text NOT NULL,
	"destination_city" varchar(120) NOT NULL,
	"receiver_name" varchar(150) NOT NULL,
	"receiver_phone" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shipments_tracking_code_unique" UNIQUE("tracking_code")
);
--> statement-breakpoint
CREATE TABLE "seller_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"store_name" varchar(150) NOT NULL,
	"store_slug" varchar(180) NOT NULL,
	"description" text,
	"logo_url" text,
	"banner_url" text,
	"tax_id" varchar(60),
	"rating" numeric(3, 2) DEFAULT '5.00' NOT NULL,
	"total_sales" numeric(12, 2) DEFAULT '0' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seller_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "seller_profiles_store_slug_unique" UNIQUE("store_slug")
);
--> statement-breakpoint
CREATE TABLE "crm_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"company" varchar(150),
	"source" varchar(80) DEFAULT 'web' NOT NULL,
	"status" varchar(40) DEFAULT 'nuevo' NOT NULL,
	"score" integer DEFAULT 10 NOT NULL,
	"notes" text,
	"assigned_to_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"lead_id" integer,
	"stage" varchar(50) DEFAULT 'prospeccion' NOT NULL,
	"expected_value" numeric(12, 2) DEFAULT '0' NOT NULL,
	"probability_pct" integer DEFAULT 20 NOT NULL,
	"close_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_type" varchar(30) NOT NULL,
	"sender_id" uuid,
	"body" text NOT NULL,
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"channel" varchar(50) DEFAULT 'webchat' NOT NULL,
	"status" varchar(40) DEFAULT 'open' NOT NULL,
	"customer_id" uuid,
	"assigned_agent_id" uuid,
	"subject" varchar(250) NOT NULL,
	"priority" varchar(30) DEFAULT 'medium' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"live_event_id" integer NOT NULL,
	"user_name" varchar(120) NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(250) NOT NULL,
	"slug" varchar(280) NOT NULL,
	"description" text,
	"seller_id" uuid,
	"stream_url" text,
	"status" varchar(30) DEFAULT 'scheduled' NOT NULL,
	"viewer_count" integer DEFAULT 0 NOT NULL,
	"pinned_product_id" integer,
	"scheduled_at" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "live_events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "storage_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" integer NOT NULL,
	"url" text NOT NULL,
	"storage_key" varchar(350) NOT NULL,
	"bucket" varchar(100) DEFAULT 'ferromax-media' NOT NULL,
	"visibility" varchar(30) DEFAULT 'public' NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"uploaded_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "storage_assets_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_timeline_events" ADD CONSTRAINT "order_timeline_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_holds" ADD CONSTRAINT "escrow_holds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_holds" ADD CONSTRAINT "escrow_holds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_ledger_entries" ADD CONSTRAINT "financial_ledger_entries_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_ledger_entries" ADD CONSTRAINT "financial_ledger_entries_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_events" ADD CONSTRAINT "shipment_events_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_profiles" ADD CONSTRAINT "seller_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_leads" ADD CONSTRAINT "crm_leads_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunities" ADD CONSTRAINT "crm_opportunities_lead_id_crm_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."crm_leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_messages" ADD CONSTRAINT "community_messages_conversation_id_community_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."community_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_messages" ADD CONSTRAINT "community_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_conversations" ADD CONSTRAINT "community_conversations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_conversations" ADD CONSTRAINT "community_conversations_assigned_agent_id_users_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_chat_messages" ADD CONSTRAINT "live_chat_messages_live_event_id_live_events_id_fk" FOREIGN KEY ("live_event_id") REFERENCES "public"."live_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_events" ADD CONSTRAINT "live_events_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_events" ADD CONSTRAINT "live_events_pinned_product_id_products_id_fk" FOREIGN KEY ("pinned_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_assets" ADD CONSTRAINT "storage_assets_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cart_items_cart_id_idx" ON "cart_items" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "cart_items_product_id_idx" ON "cart_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "carts_user_id_idx" ON "carts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "carts_guest_token_idx" ON "carts" USING btree ("guest_token");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_id_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_items_seller_id_idx" ON "order_items" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "order_timeline_events_order_id_idx" ON "order_timeline_events" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_timeline_events_occurred_at_idx" ON "order_timeline_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "orders_buyer_id_idx" ON "orders" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "escrow_order_id_idx" ON "escrow_holds" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "escrow_status_idx" ON "escrow_holds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ledger_payment_id_idx" ON "financial_ledger_entries" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "ledger_order_id_idx" ON "financial_ledger_entries" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "ledger_created_at_idx" ON "financial_ledger_entries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payments_order_id_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_provider_id_idx" ON "payments" USING btree ("provider_payment_id");--> statement-breakpoint
CREATE INDEX "shipment_events_shipment_id_idx" ON "shipment_events" USING btree ("shipment_id");--> statement-breakpoint
CREATE INDEX "shipments_order_id_idx" ON "shipments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "shipments_tracking_code_idx" ON "shipments" USING btree ("tracking_code");--> statement-breakpoint
CREATE INDEX "shipments_status_idx" ON "shipments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "seller_profiles_user_id_idx" ON "seller_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "seller_profiles_slug_idx" ON "seller_profiles" USING btree ("store_slug");--> statement-breakpoint
CREATE INDEX "crm_leads_email_idx" ON "crm_leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "crm_leads_status_idx" ON "crm_leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crm_opps_stage_idx" ON "crm_opportunities" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "comm_msg_conversation_id_idx" ON "community_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "comm_conv_channel_idx" ON "community_conversations" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "comm_conv_status_idx" ON "community_conversations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "live_chat_event_id_idx" ON "live_chat_messages" USING btree ("live_event_id");--> statement-breakpoint
CREATE INDEX "live_events_status_idx" ON "live_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "live_events_slug_idx" ON "live_events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "storage_assets_status_idx" ON "storage_assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "storage_assets_key_idx" ON "storage_assets" USING btree ("storage_key");