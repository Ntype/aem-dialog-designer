"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { blockDefinitions } from "@/components/blocks/block-definitions"
import type { Block } from "@/lib/store"
import { DraggableBlockItem } from "@/components/ui/draggable-block-item"
import { useDialogStore } from "@/lib/store"
import { Separator } from "@/components/ui/separator"

export function BlockPalette() {
  const { currentProject } = useDialogStore()
  const customBlocks = currentProject?.customBlocks || []

  const standardBlocks = useMemo(
    () =>
      blockDefinitions.map((block) => ({
        id: block.type,
        type: block.type,
        name: block.name,
        label: block.label,
        icon: block.icon,
        properties: block.defaultProperties,
        xmlTemplate: block.xmlTemplate,
      })),
    [],
  )

  // Convertir los bloques personalizados al formato necesario para DraggableBlockItem
  const customBlocksFormatted = useMemo(
    () =>
      customBlocks.map((block) => ({
        id: block.id,
        type: "custom",
        name: block.name.toLowerCase().replace(/\s+/g, "-"),
        label: block.name,
        properties: { fieldLabel: block.name },
        xmlTemplate: block.xmlTemplate,
        customImage: block.imageUrl,
      })),
    [customBlocks],
  )

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Componentes</CardTitle>
        <CardDescription>Arrastra componentes al área de diseño</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {standardBlocks.map((block) => (
            <DraggableBlockItem key={block.id} block={block as Block} />
          ))}

          {customBlocksFormatted.length > 0 && (
            <>
              <Separator className="my-2" />
              <h3 className="text-sm font-medium mb-2">Componentes personalizados</h3>

              {customBlocksFormatted.map((block) => (
                <DraggableBlockItem key={block.id} block={block as Block} customImage={block.customImage} />
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
