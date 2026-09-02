ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "onboarding_states" ADD CONSTRAINT "onboarding_user_step_unique" UNIQUE("user_id","step_code");--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id");