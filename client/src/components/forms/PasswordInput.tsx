"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { FormInputBase, BaseInputProps } from "./FormInputBase";

export interface PasswordInputProps
  extends BaseInputProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "disabled" | "required" | "placeholder" | "type"> {}

export const PasswordInput = ({
  name,
  label,
  placeholder,
  disabled,
  required,
  description,
  error: explicitError,
  className,
  value,
  onChange,
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const formContext = useFormContext();
  const formError = formContext?.formState?.errors?.[name]?.message as string | undefined;
  const error = explicitError ?? formError;

  const isControlled = value !== undefined || onChange !== undefined;
  const registration = !isControlled && formContext ? formContext.register(name) : {};

  return (
    <FormInputBase
      name={name}
      label={label}
      required={required}
      description={description}
      error={error}
      className={className}
    >
      <div className="relative">
        <Input
          id={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          className={cn(
            "rounded-xl pr-10",
            error && "border-red-500 focus-visible:ring-red-400",
            disabled && "cursor-not-allowed bg-muted",
          )}
          {...registration}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </FormInputBase>
  );
};
