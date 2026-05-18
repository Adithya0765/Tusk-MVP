import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-r before:from-violet-400 before:via-purple-400 before:to-indigo-400 before:opacity-0 before:transition-opacity hover:before:opacity-100 before:-z-10",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border border-purple-500/30 bg-purple-500/5 text-purple-300 shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:bg-purple-500/10 hover:border-purple-400/50 hover:shadow-[0_0_25px_rgba(139,92,246,0.2)] hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm",
        secondary:
          "bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm",
        ghost:
          "text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)]",
        link: "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300",
        cosmic: "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white rounded-xl px-8 py-3 text-base font-semibold hover:shadow-[0_0_40px_rgba(139,92,246,0.6),0_0_80px_rgba(139,92,246,0.3)] hover:scale-[1.05] active:scale-[0.95] before:absolute before:inset-0 before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] before:bg-[length:250%_250%] before:animate-shimmer",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        xs: "h-7 gap-1.5 rounded-lg px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-lg gap-2 px-3.5 has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-8 text-base has-[>svg]:px-6",
        icon: "size-10 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
