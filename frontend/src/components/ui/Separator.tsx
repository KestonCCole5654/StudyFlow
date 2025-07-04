import * as React from "react"

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`shrink-0 bg-gray-700 h-[1px] w-full ${className}`}
    {...props}
  />
))
Separator.displayName = "Separator"

export { Separator } 