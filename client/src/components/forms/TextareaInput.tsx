"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/shared/lib/utils";
import { FormInputBase, BaseInputProps } from "./FormInputBase";

export interface TextareaInputProps
  extends BaseInputProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "disabled" | "required" | "placeholder"> {}

export const TextareaInput = ({
  name,
  label,
  placeholder,
  disabled,
  required,
  description,
  error: explicitError,
  className,
  rows = 3,
  value,
  onChange,
  ...props
}: TextareaInputProps) => {
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
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full resize-y rounded-xl border border-border bg-background p-3 text-sm outline-none transition-colors focus:border-primary",
          error && "border-red-500 focus:border-red-500",
          disabled && "cursor-not-allowed bg-muted",
        )}
        {...registration}
        {...props}
      />
    </FormInputBase>
  );
};
