"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { FormInputBase, BaseInputProps } from "./FormInputBase";

export interface TextInputProps
  extends BaseInputProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "disabled" | "required" | "placeholder"> {
  type?: "text" | "email" | "tel" | "url" | "search";
}

export const TextInput = ({
  name,
  label,
  placeholder,
  disabled,
  required,
  description,
  error: explicitError,
  className,
  type = "text",
  value,
  onChange,
  ...props
}: TextInputProps) => {
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
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={cn(
          "rounded-xl",
          error && "border-red-500 focus-visible:ring-red-400",
          disabled && "cursor-not-allowed bg-muted",
        )}
        {...registration}
        {...props}
      />
    </FormInputBase>
  );
};
