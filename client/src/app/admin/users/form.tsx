"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  TextInput,
  PasswordInput,
  SelectInput,
} from "@/components/forms";

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio"),
  lastName: z.string().trim().min(1, "El apellido es obligatorio"),
  email: z.string().trim().email("Formato de correo electrónico inválido"),
  phone: z.string().trim().optional().nullable(),
  role: z.string().min(1, "Selecciona un rol"),
  status: z.string().min(1, "Selecciona un estado"),
  kycLevel: z.coerce.number().min(0).max(3),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const editUserSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio"),
  lastName: z.string().trim().min(1, "El apellido es obligatorio"),
  email: z.string().trim().email("Formato de correo electrónico inválido"),
  phone: z.string().trim().optional().nullable(),
  role: z.string().min(1, "Selecciona un rol"),
  status: z.string().min(1, "Selecciona un estado"),
  kycLevel: z.coerce.number().min(0).max(3),
  password: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.password && data.password.trim().length > 0 && data.password.trim().length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La nueva contraseña debe tener al menos 8 caracteres",
      path: ["password"],
    });
  }
});

export type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  kycLevel: number;
  password?: string;
};

interface UserFormProps {
  initialData?: User | null;
  onSubmit: (values: UserFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ROLE_OPTIONS = [
  { value: "buyer", label: "Comprador" },
  { value: "seller_individual", label: "Vendedor Individual" },
  { value: "seller_empresa", label: "Vendedor Empresa" },
  { value: "admin", label: "Administrador" },
  { value: "superadmin", label: "Super Admin" },
  { value: "support", label: "Soporte Operativo" },
  { value: "finance", label: "Finanzas & Riesgo" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Activa" },
  { value: "pending", label: "Pendiente" },
  { value: "restricted", label: "Restringida" },
  { value: "suspended", label: "Suspendida" },
  { value: "in_review", label: "En Revisión" },
  { value: "rejected", label: "Rechazada" },
  { value: "logically_deleted", label: "Eliminada" },
];

const KYC_OPTIONS = [
  { value: 0, label: "Nivel 0 (Sin verificar)" },
  { value: 1, label: "Nivel 1 (Básico)" },
  { value: 2, label: "Nivel 2 (Verificado)" },
  { value: 3, label: "Nivel 3 (Empresa)" },
];

export const UserForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UserFormProps) => {
  const isEditing = Boolean(initialData);

  const methods = useForm<UserFormValues>({
    resolver: zodResolver(isEditing ? editUserSchema : createUserSchema) as any,
    defaultValues: {
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      role: (initialData?.role ?? "buyer").toLowerCase(),
      status: (initialData?.status ?? "active").toLowerCase(),
      kycLevel: initialData?.kycLevel ?? 0,
      password: "",
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInput
            name="firstName"
            label="Nombre"
            placeholder="Juan"
            required
          />
          <TextInput
            name="lastName"
            label="Apellido"
            placeholder="Pérez"
            required
          />
        </div>

        <TextInput
          name="email"
          type="email"
          label="Correo Electrónico"
          placeholder="juan.perez@marketplace.com"
          disabled={isEditing}
          required
        />

        <PasswordInput
          name="password"
          label={isEditing ? "Nueva Contraseña (opcional)" : "Contraseña"}
          placeholder={
            isEditing
              ? "Dejar en blanco para mantener la contraseña actual"
              : "Mínimo 8 caracteres"
          }
          required={!isEditing}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInput
            name="phone"
            label="Teléfono (opcional)"
            placeholder="+54 9 11 1234-5678"
          />

          <SelectInput
            name="role"
            label="Rol de Usuario"
            options={ROLE_OPTIONS}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectInput
            name="status"
            label="Estado de Cuenta"
            options={STATUS_OPTIONS}
            required
          />

          <SelectInput
            name="kycLevel"
            label="Nivel KYC"
            options={KYC_OPTIONS}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl"
          >
            {isSubmitting
              ? "Guardando…"
              : isEditing
              ? "Guardar Cambios"
              : "Crear Usuario"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
