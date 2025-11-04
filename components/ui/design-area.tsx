"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDialogStore, blocks, activeTabId } from "@/lib/store"
import { SortableBlockItem } from "@/components/ui/sortable-block-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { TabManager } from "@/components/ui/tab-manager"
import { HelpCircle, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function DesignArea() {
  const { getActiveDialog, setDialogHelpPath } = useDialogStore()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState("")
  const [helpPathInput, setHelpPathInput] = useState("")
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const endOfListRef = useRef<HTMLDivElement>(null)

  const { setNodeRef } = useDroppable({
    id: "design-area",
  })

  // Obtener el diálogo activo y sus datos
  const activeDialog = getActiveDialog()
  const currentActiveTabId = activeTabId()

  // Asegurarse de que tenemos bloques para trabajar (array vacío si no hay)
  const allBlocks = blocks() || []
  const filteredBlocks = allBlocks.filter((block) => block.tabId === currentActiveTabId)
  const blockIds = filteredBlocks.map((block) => block.id)

  // Actualizar los inputs cuando cambia el diálogo activo
  useEffect(() => {
    if (activeDialog) {
      setTitleInput(activeDialog.name)
      setHelpPathInput(activeDialog.helpPath)
    }
  }, [activeDialog])

  const handleTitleSave = () => {
    if (activeDialog && titleInput.trim() !== "") {
      useDialogStore.getState().updateDialogName(activeDialog.id, titleInput)
      setIsEditingTitle(false)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave()
    }
  }

  const handleHelpPathSave = () => {
    if (activeDialog) {
      setDialogHelpPath(helpPathInput)
      setIsHelpDialogOpen(false)
    }
  }

  // Asegurar que siempre haya espacio visible al final de la lista
  useEffect(() => {
    // Esperar a que se complete el renderizado
    const timer = setTimeout(() => {
      if (endOfListRef.current && scrollAreaRef.current) {
        // Asegurar que el área de espacio vacío sea visible
        const scrollArea = scrollAreaRef.current
        const endOfList = endOfListRef.current

        // Verificar si el espacio vacío está fuera de la vista
        const scrollAreaRect = scrollArea.getBoundingClientRect()
        const endOfListRect = endOfList.getBoundingClientRect()

        // Si hay muchos componentes y el espacio vacío no es visible
        if (
          filteredBlocks.length > 5 &&
          (endOfListRect.bottom > scrollAreaRect.bottom || endOfListRect.top < scrollAreaRect.top)
        ) {
          // Hacer scroll para mostrar el espacio vacío
          endOfList.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [filteredBlocks.length])

  // Si no hay diálogo activo, mostrar un mensaje
  if (!activeDialog) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <h3 className="text-lg font-medium mb-2">No hay diálogo seleccionado</h3>
            <p className="text-muted-foreground mb-4">Selecciona o crea un diálogo para comenzar a diseñar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-t-8 border-t-blue-600 dark:border-t-gray-600">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 dark:bg-[#1e1e1e]">
        {isEditingTitle ? (
          <Input
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            className="h-8 w-48"
            autoFocus
          />
        ) : (
          <h2
            className="text-sm font-medium cursor-pointer hover:text-blue-600 dark:hover:text-gray-300"
            onClick={() => {
              setIsEditingTitle(true)
              setTitleInput(activeDialog.name)
            }}
          >
            {activeDialog.name}
          </h2>
        )}
        <div className="flex items-center gap-1">
          <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                    <HelpCircle className="h-4 w-4" />
                    <span className="sr-only">Ayuda</span>
                    <DialogTrigger asChild>
                      <button
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Editar enlace de ayuda"
                      />
                    </DialogTrigger>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Inserta el enlace de ayuda al componente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enlace de ayuda</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <label htmlFor="help-path" className="block text-sm font-medium mb-2">
                  URL de ayuda
                </label>
                <Input
                  id="help-path"
                  value={helpPathInput}
                  onChange={(e) => setHelpPathInput(e.target.value)}
                  placeholder="Ej: /content/help/es/component-help.html"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Este enlace aparecerá en el XML como helpPath y será accesible desde el icono de ayuda en el diálogo.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleHelpPathSave}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="w-full bg-gray-50 dark:bg-[#1e1e1e] border-b dark:border-[#333333]">
        <TabManager />
      </div>

      <CardContent className="p-0">
        <ScrollArea ref={scrollAreaRef} className="h-[calc(100vh-15rem)]">
          <div ref={setNodeRef} className="min-h-[calc(100vh-15rem)] p-6 flex flex-col gap-4">
            {filteredBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <p className="text-muted-foreground">Arrastra componentes aquí para comenzar a diseñar tu diálogo</p>
              </div>
            ) : (
              <>
                <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
                  {filteredBlocks.map((block) => (
                    <SortableBlockItem key={block.id} block={block} />
                  ))}
                </SortableContext>

                {/* Espacio adicional para arrastrar nuevos componentes */}
                <div
                  ref={endOfListRef}
                  className="min-h-[150px] border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-md flex items-center justify-center mt-4 mb-16 bg-gray-50 dark:bg-gray-800/30"
                >
                  <div className="text-center text-gray-400 dark:text-gray-500 p-6">
                    <PlusCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Arrastre componentes aquí</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
