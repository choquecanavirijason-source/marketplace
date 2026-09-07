"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/shared/lib/utils";
import { BaseInputProps } from "./FormInputBase";

export interface SwitchInputProps extends BaseInputProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const SwitchInput = ({
  name,
  label,
  description,
  disabled,
  required,
  error: explicitError,
  className,
  checked,
  onCheckedChange,
}: SwitchInputProps) => {
  const formContext = useFormContext();
  const formError = formContext?.formState?.errors?.[name]?.message as string | undefined;
  const error = explicitError ?? formError;

  const isControlled = checked !== undefined || onCheckedChange !== undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between rounded-xl border border-border p-3">
        <div className="space-y-0.5">
          {label && (
            <label htmlFor={name} className="text-sm font-medium text-foreground cursor-pointer">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {isControlled ? (
          <Switch
            id={name}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
          />
        ) : formContext ? (
          <Controller
            control={formContext.control}
            name={name}
            render={({ field }) => (
              <Switch
                id={name}
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
        ) : (
          <Switch id={name} disabled={disabled} />
        )}
      </div>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};
