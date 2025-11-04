"use client"

import { useDraggable } from "@dnd-kit/core"
import { Button } from "@/components/ui/button"
import type { Block } from "@/lib/store"
import type { LucideIcon } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"

// Importación dinámica de los iconos de Lucide
const DynamicIcon = ({ icon }: { icon: string }) => {
  const LucideIcon = dynamic(
    () =>
      import("lucide-react").then((mod) => {
        // Convertir el nombre del icono a PascalCase para coincidir con los nombres de los componentes de Lucide
        const iconName = icon
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("")
        return mod[iconName as keyof typeof mod] as LucideIcon
      }),
    { ssr: false, loading: () => <div className="w-4 h-4" /> },
  )

  return <LucideIcon className="h-4 w-4" />
}

interface DraggableBlockItemProps {
  block: Block
  customImage?: string
}

export function DraggableBlockItem({ block, customImage }: DraggableBlockItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `draggable-${block.id}`,
    data: {
      type: "block",
      block,
    },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
      <Button variant="outline" className="w-full justify-start gap-2 h-auto py-2 bg-background">
        {customImage ? (
          <div className="w-5 h-5 relative">
            <Image src={customImage || "/placeholder.svg"} alt={block.label} fill className="object-contain" />
          </div>
        ) : (
          <DynamicIcon icon={block.icon || "square"} />
        )}
        <span className="truncate">{block.properties.fieldLabel || block.name}</span>
      </Button>
    </div>
  )
}
