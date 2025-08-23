"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Check, X } from "lucide-react";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-0 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#3B82F6] data-[state=unchecked]:bg-[#A5B4FC]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none relative flex size-6 items-center justify-center rounded-full bg-white shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[1.375rem] data-[state=unchecked]:translate-x-0.5",
        )}
      >
        <Check className="absolute h-3 w-3 text-[#3B82F6] transition-opacity data-[state=unchecked]:opacity-0 data-[state=checked]:opacity-100" />
        <X className="absolute h-3 w-3 text-[#A5B4FC] transition-opacity data-[state=checked]:opacity-0 data-[state=unchecked]:opacity-100" />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export { Switch };
