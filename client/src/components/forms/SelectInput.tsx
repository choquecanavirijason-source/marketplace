"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/shared/lib/utils";
import { FormInputBase, BaseInputProps } from "./FormInputBase";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectInputProps
  extends BaseInputProps,
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name" | "disabled" | "required" | "value" | "onChange"> {
  options: SelectOption[];
  emptyOptionLabel?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const SelectInput = ({
  name,
  label,
  options,
  emptyOptionLabel,
  disabled,
  required,
  description,
  error: explicitError,
  className,
  value,
  onChange,
  ...props
}: SelectInputProps) => {
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
      <select
        id={name}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary",
          error && "border-red-500 focus:border-red-500",
          disabled && "cursor-not-allowed bg-muted",
        )}
        {...registration}
        {...props}
      >
        {emptyOptionLabel && <option value="">{emptyOptionLabel}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormInputBase>
  );
};
