"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface CountryInfo {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  dialCode: string;
  format?: string;
}

export const COUNTRIES: CountryInfo[] = [
  { code: "BO", name: "Bolivia", dialCode: "+591", format: "7123 4567" },
  { code: "AR", name: "Argentina", dialCode: "+54", format: "9 11 1234 5678" },
  { code: "CL", name: "Chile", dialCode: "+56", format: "9 1234 5678" },
  { code: "PE", name: "Perú", dialCode: "+51", format: "912 345 678" },
  { code: "CO", name: "Colombia", dialCode: "+57", format: "300 123 4567" },
  { code: "MX", name: "México", dialCode: "+52", format: "55 1234 5678" },
  { code: "BR", name: "Brasil", dialCode: "+55", format: "11 91234-5678" },
  { code: "UY", name: "Uruguay", dialCode: "+598", format: "99 123 456" },
  { code: "PY", name: "Paraguay", dialCode: "+595", format: "981 123 456" },
  { code: "EC", name: "Ecuador", dialCode: "+593", format: "99 123 4567" },
  { code: "VE", name: "Venezuela", dialCode: "+58", format: "412 123 4567" },
  { code: "ES", name: "España", dialCode: "+34", format: "612 34 56 78" },
  { code: "US", name: "Estados Unidos", dialCode: "+1", format: "(555) 123-4567" },
  { code: "CA", name: "Canadá", dialCode: "+1", format: "(555) 123-4567" },
  { code: "GB", name: "Reino Unido", dialCode: "+44", format: "7123 456789" },
  { code: "DE", name: "Alemania", dialCode: "+49", format: "151 12345678" },
  { code: "FR", name: "Francia", dialCode: "+33", format: "6 12 34 56 78" },
  { code: "IT", name: "Italia", dialCode: "+39", format: "312 345 6789" },
];

export interface CountryFlagProps {
  code: string;
  className?: string;
}

export const CountryFlag = ({ code, className }: CountryFlagProps) => {
  const upperCode = code.toUpperCase();

  switch (upperCode) {
    case "BO": // Bolivia
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#d52b1e" d="M0 0h640v160H0z" />
          <path fill="#fcd116" d="M0 160h640v160H0z" />
          <path fill="#007934" d="M0 320h640v160H0z" />
        </svg>
      );
    case "AR": // Argentina
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#74acdf" d="M0 0h640v160H0z" />
          <path fill="#ffffff" d="M0 160h640v160H0z" />
          <path fill="#74acdf" d="M0 320h640v160H0z" />
          <circle cx="320" cy="240" r="30" fill="#f6b40e" />
        </svg>
      );
    case "CL": // Chile
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#ffffff" d="M0 0h640v240H0z" />
          <path fill="#d52b1e" d="M0 240h640v240H0z" />
          <path fill="#0039a6" d="M0 0h240v240H0z" />
          <polygon fill="#ffffff" points="120,50 142,118 214,118 156,160 178,228 120,186 62,228 84,160 26,118 98,118" />
        </svg>
      );
    case "PE": // Perú
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#d52b1e" d="M0 0h213v480H0z" />
          <path fill="#ffffff" d="M213 0h214v480H213z" />
          <path fill="#d52b1e" d="M427 0h213v480H427z" />
        </svg>
      );
    case "CO": // Colombia
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#fcd116" d="M0 0h640v240H0z" />
          <path fill="#003893" d="M0 240h640v120H0z" />
          <path fill="#ce1126" d="M0 360h640v120H0z" />
        </svg>
      );
    case "MX": // México
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#006847" d="M0 0h213v480H0z" />
          <path fill="#ffffff" d="M213 0h214v480H213z" />
          <path fill="#ce1126" d="M427 0h213v480H427z" />
          <circle cx="320" cy="240" r="28" fill="#8B5A2B" />
        </svg>
      );
    case "BR": // Brasil
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#009c3b" d="M0 0h640v480H0z" />
          <polygon fill="#fedf00" points="320,40 600,240 320,440 40,240" />
          <circle cx="320" cy="240" r="100" fill="#002776" />
        </svg>
      );
    case "UY": // Uruguay
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#ffffff" d="M0 0h640v480H0z" />
          <path fill="#0038a8" d="M0 53h640v53H0zM0 160h640v53H0zM0 267h640v53H0zM0 373h640v53H0z" />
          <path fill="#ffffff" d="M0 0h240v240H0z" />
          <circle cx="120" cy="120" r="45" fill="#fcd116" />
        </svg>
      );
    case "PY": // Paraguay
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#d52b1e" d="M0 0h640v160H0z" />
          <path fill="#ffffff" d="M0 160h640v160H0z" />
          <path fill="#0038a8" d="M0 320h640v160H0z" />
          <circle cx="320" cy="240" r="25" fill="#0038a8" />
        </svg>
      );
    case "EC": // Ecuador
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#ffd100" d="M0 0h640v240H0z" />
          <path fill="#003893" d="M0 240h640v120H0z" />
          <path fill="#ce1126" d="M0 360h640v120H0z" />
          <circle cx="320" cy="240" r="26" fill="#8B5A2B" />
        </svg>
      );
    case "VE": // Venezuela
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#fcd116" d="M0 0h640v160H0z" />
          <path fill="#003893" d="M0 160h640v160H0z" />
          <path fill="#ce1126" d="M0 320h640v160H0z" />
        </svg>
      );
    case "ES": // España
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#aa151b" d="M0 0h640v120H0z" />
          <path fill="#f1bf00" d="M0 120h640v240H0z" />
          <path fill="#aa151b" d="M0 360h640v120H0z" />
        </svg>
      );
    case "US": // Estados Unidos
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#b22234" d="M0 0h640v480H0z" />
          <path stroke="#fff" strokeWidth="37" d="M0,55H640 M0,129H640 M0,203H640 M0,277H640 M0,351H640 M0,425H640" />
          <path fill="#3c3b6e" d="M0 0h260v260H0z" />
        </svg>
      );
    case "CA": // Canadá
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#d52b1e" d="M0 0h160v480H0zM480 0h160v480H480z" />
          <path fill="#ffffff" d="M160 0h320v480H160z" />
          <polygon fill="#d52b1e" points="320,100 340,190 410,180 360,230 390,300 320,260 250,300 280,230 230,180 300,190" />
        </svg>
      );
    case "GB": // Reino Unido
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#012169" d="M0 0h640v480H0z" />
          <path stroke="#fff" strokeWidth="60" d="M0,0 L640,480 M640,0 L0,480" />
          <path stroke="#c8102e" strokeWidth="40" d="M0,0 L640,480 M640,0 L0,480" />
          <path stroke="#fff" strokeWidth="100" d="M320,0v480 M0,240h640" />
          <path stroke="#c8102e" strokeWidth="60" d="M320,0v480 M0,240h640" />
        </svg>
      );
    case "DE": // Alemania
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#000000" d="M0 0h640v160H0z" />
          <path fill="#dd0000" d="M0 160h640v160H0z" />
          <path fill="#ffce00" d="M0 320h640v160H0z" />
        </svg>
      );
    case "FR": // Francia
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#002654" d="M0 0h213v480H0z" />
          <path fill="#ffffff" d="M213 0h214v480H213z" />
          <path fill="#ce1126" d="M427 0h213v480H427z" />
        </svg>
      );
    case "IT": // Italia
      return (
        <svg viewBox="0 0 640 480" className={cn("overflow-hidden inline-block", className)}>
          <path fill="#009246" d="M0 0h213v480H0z" />
          <path fill="#ffffff" d="M213 0h214v480H213z" />
          <path fill="#ce2b37" d="M427 0h213v480H427z" />
        </svg>
      );
    default:
      return (
        <span className={cn("text-xs font-bold font-mono bg-muted text-foreground px-1 py-0.5 rounded", className)}>
          {upperCode}
        </span>
      );
  }
};

export interface PhoneCountryInputProps {
  id?: string;
  value?: string;
  defaultCountry?: string;
  countryCode?: string;
  onChange?: (fullPhone: string, countryCode: string, countryName: string) => void;
  onCountryChange?: (countryCode: string, countryName: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export const PhoneCountryInput = ({
  id = "phone-input",
  value = "",
  defaultCountry = "BO",
  countryCode,
  onChange,
  onCountryChange,
  disabled = false,
  required = false,
  placeholder,
  className,
}: PhoneCountryInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const findCountryFromValue = (val: string): CountryInfo | undefined => {
    if (!val || !val.startsWith("+")) return undefined;
    const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    return sorted.find((c) => val.startsWith(c.dialCode));
  };

  const initialCountry = useMemo(() => {
    if (countryCode) {
      const match = COUNTRIES.find(
        (c) =>
          c.code.toUpperCase() === countryCode.toUpperCase() ||
          c.name.toLowerCase() === countryCode.toLowerCase()
      );
      if (match) return match;
    }
    const fromVal = findCountryFromValue(value);
    if (fromVal) return fromVal;
    return COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0];
  }, [countryCode, defaultCountry]);

  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(initialCountry);

  const getNationalNumber = (val: string, country: CountryInfo): string => {
    if (!val) return "";
    if (val.startsWith(country.dialCode)) {
      return val.slice(country.dialCode.length).trim();
    }
    const match = findCountryFromValue(val);
    if (match) {
      return val.slice(match.dialCode.length).trim();
    }
    return val.trim();
  };

  const [nationalNumber, setNationalNumber] = useState<string>(() =>
    getNationalNumber(value, initialCountry)
  );

  useEffect(() => {
    const fromVal = findCountryFromValue(value);
    if (fromVal && fromVal.code !== selectedCountry.code) {
      setSelectedCountry(fromVal);
      setNationalNumber(getNationalNumber(value, fromVal));
    } else if (value !== undefined) {
      setNationalNumber(getNationalNumber(value, selectedCountry));
    }
  }, [value]);

  useEffect(() => {
    if (countryCode) {
      const match = COUNTRIES.find(
        (c) =>
          c.code.toUpperCase() === countryCode.toUpperCase() ||
          c.name.toLowerCase() === countryCode.toLowerCase()
      );
      if (match && match.code !== selectedCountry.code) {
        setSelectedCountry(match);
      }
    }
  }, [countryCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q)
    );
  }, [searchQuery]);

  const handleCountrySelect = (country: CountryInfo) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery("");

    const fullPhone = nationalNumber.trim() ? `${country.dialCode} ${nationalNumber.trim()}` : "";
    if (onChange) {
      onChange(fullPhone, country.code, country.name);
    }
    if (onCountryChange) {
      onCountryChange(country.code, country.name);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    const cleaned = inputVal.replace(/[^\d\s\-()]/g, "");
    setNationalNumber(cleaned);

    const fullPhone = cleaned.trim() ? `${selectedCountry.dialCode} ${cleaned.trim()}` : "";
    if (onChange) {
      onChange(fullPhone, selectedCountry.code, selectedCountry.name);
    }
  };

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          disabled={disabled}
          className={cn(
            "flex items-center gap-2 h-10 px-3 bg-muted/40 hover:bg-muted/70 border border-input border-r-0 rounded-l-xl text-xs font-semibold text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          title={`País: ${selectedCountry.name} (${selectedCountry.dialCode})`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <CountryFlag code={selectedCountry.code} className="w-5 h-3.5 rounded-[2px] shadow-xs border border-border/70 shrink-0" />
          <span className="font-semibold text-xs tracking-wide text-foreground">{selectedCountry.code}</span>
          <span className="font-mono text-xs text-muted-foreground">{selectedCountry.dialCode}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ml-0.5" />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-72 max-h-72 bg-popover bg-card bg-white dark:bg-[#1c1815] border border-border/80 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95">
            <div className="p-2 border-b border-border/60 bg-muted/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar país o prefijo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border/70 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-56 p-1 space-y-0.5" role="listbox">
              {filteredCountries.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No se encontraron países
                </p>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected = c.code === selectedCountry.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleCountrySelect(c)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors text-left gap-2",
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CountryFlag code={c.code} className="w-5 h-3.5 rounded-[2px] shadow-xs border border-border/60 shrink-0" />
                        <span className="truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-muted-foreground text-[11px]">
                          {c.dialCode}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <div className="relative flex-1">
        <input
          id={id}
          type="tel"
          value={nationalNumber}
          onChange={handleNumberChange}
          placeholder={placeholder || selectedCountry.format || "Número local"}
          disabled={disabled}
          required={required}
          className={cn(
            "flex h-10 w-full rounded-r-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono tracking-tight",
            className
          )}
        />
      </div>
    </div>
  );
};
