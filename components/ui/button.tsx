import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-in-out [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none touch-target",
  {
    variants: {
      variant: {
        default: "bg-[#3B82F6] text-white hover:bg-[#2563EB] active:bg-[#1D4ED8] focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:bg-[#9CA3AF] disabled:text-[#D1D5DB] disabled:pointer-events-none disabled:cursor-not-allowed",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 disabled:bg-[#9CA3AF] disabled:text-[#D1D5DB] disabled:pointer-events-none",
        outline:
          "border border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB] hover:border-[#9CA3AF] active:bg-[#F3F4F6] focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:border-[#E5E7EB] disabled:pointer-events-none",
        secondary:
          "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] active:bg-[#D1D5DB] focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2 disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:pointer-events-none",
        ghost:
          "bg-transparent text-[#374151] hover:bg-[#F3F4F6] active:bg-[#E5E7EB] focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2 disabled:text-[#9CA3AF] disabled:pointer-events-none",
        link: "text-[#3B82F6] underline-offset-4 hover:underline hover:text-[#2563EB] active:text-[#1D4ED8] focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:text-[#9CA3AF] disabled:no-underline disabled:pointer-events-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3 mobile-device:h-11 mobile-device:px-5 mobile-device:py-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 mobile-device:h-10 mobile-device:px-4",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4 mobile-device:h-12 mobile-device:px-7",
        icon: "size-9 rounded-md mobile-device:size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
