"use client";

import { MapPinIcon, RotateCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProvincesQuery } from "@/hooks/use-provinces-query";

type ProvinceSelectProps = {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  ref: React.Ref<HTMLButtonElement>;
  invalid: boolean;
  describedBy?: string;
  disabled?: boolean;
};

/** Province picker fed by GET /provinces. */
export function ProvinceSelect({
  id,
  name,
  value,
  onChange,
  onBlur,
  ref,
  invalid,
  describedBy,
  disabled,
}: ProvinceSelectProps) {
  const t = useTranslations("auth.signup");
  const provinces = useProvincesQuery();
  const [open, setOpen] = useState(false);

  const items = (provinces.data ?? []).map((province) => ({
    value: province.id,
    label: province.name,
  }));

  const placeholder = provinces.isPending
    ? t("provincesLoading")
    : t("provincePlaceholder");

  return (
    <>
      <Select
        name={name}
        items={items}
        value={value || null}
        onValueChange={(next) => onChange(next ?? "")}
        // Opening the list moves focus into the popup, which would blur the
        // trigger and show "required" before a choice is made. Mark the field
        // as touched when the list closes instead.
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onBlur();
        }}
        disabled={disabled || provinces.isPending || provinces.isError}
      >
        <SelectTrigger
          id={id}
          ref={ref}
          onBlur={() => {
            if (!open) onBlur();
          }}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="h-11 w-full gap-2 rounded-lg pr-3 pl-3 text-base data-[size=default]:h-11 md:text-sm"
        >
          <MapPinIcon aria-hidden className="text-muted-foreground" />
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value} className="py-2">
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {provinces.isError && (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          {t("provincesError")}
          <button
            type="button"
            onClick={() => provinces.refetch()}
            className="inline-flex cursor-pointer items-center gap-1 rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <RotateCwIcon aria-hidden className="size-4" />
            {t("retry")}
          </button>
        </p>
      )}
    </>
  );
}
