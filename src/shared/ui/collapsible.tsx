"use client"

import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { cn } from "@/shared/lib/utils"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden",
        "data-[state=open]:animate-collapsible-down",
        // fill-mode-forwards только на закрытии: иначе после анимации высота
        // вернётся к auto (полной) на кадр перед unmount — контент моргнёт.
        "data-[state=closed]:animate-collapsible-up data-[state=closed]:fill-mode-forwards",
        className,
      )}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
