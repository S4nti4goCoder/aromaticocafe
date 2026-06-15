import type { SystemSettings } from "@/hooks/useSystemSettings";

// Editable system settings (everything the company form can change).
export type CompanyFormData = Omit<
  SystemSettings,
  "id" | "updated_at" | "logo_url"
>;
