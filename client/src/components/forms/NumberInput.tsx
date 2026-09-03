"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { FormInputBase, BaseInputProps } from "./FormInputBase";

export interface NumberInputProps
  extends BaseInputProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "disabled" | "required" | "placeholder" | "type"> {
  min?: number;
  max?: number;
  step?: number | string;
}

export const NumberInput = ({
  name,
  label,
  placeholder,
  disabled,
  required,
  description,
  error: explicitError,
  className,
  min,
  max,
  step,
  value,
  onChange,
  ...props
}: NumberInputProps) => {
  const formContext = useFormContext();
  const formError = formContext?.formState?.errors?.[name]?.message as string | undefined;
  const error = explicitError ?? formError;

  const isControlled = value !== undefined || onChange !== undefined;
  const registration = !isControlled && formContext ? formContext.register(name, { valueAsNumber: true }) : {};

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
        type="number"
        min={min}
        max={max}
        step={step}
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
