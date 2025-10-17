import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-base shadow-sm transition-colors",
        "placeholder:text-gray-500",
        "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
        "hover:border-gray-300",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
