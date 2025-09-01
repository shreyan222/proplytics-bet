
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30",
        secondary:
          "border-transparent bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30",
        destructive:
          "border-transparent bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30",
        outline: "border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        demon:
          "border-transparent bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30",
        goblin:
          "border-transparent bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30",
        standard:
          "border-transparent bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

    function Badge({ className, variant, ...props }: BadgeProps) {
      if (variant === "goblin" || variant === "demon") {
        const src = {
          goblin: "goblin_updated.png",
          demon: "demon.png",
        }[variant];
    
        return (
          <div className={cn("inline-flex items-center", className)} {...props}>
            <img src={src} alt={variant} className="h-8 w-8" />
          </div>
        );
      }
    
      return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
      );
    }
    

export { Badge, badgeVariants }
