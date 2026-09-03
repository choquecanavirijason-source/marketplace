import React, { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export interface BaseInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  description?: string;
  error?: string;
  className?: string;
}

interface FormInputBaseProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export const FormInputBase = ({
  name,
  label,
  required,
  description,
  error,
  className,
  children,
}: FormInputBaseProps) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {description && !error && (
        <p className="text-[11px] text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};
