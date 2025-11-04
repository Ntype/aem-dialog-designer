"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { GripVertical, X, HelpCircle, Plus, Trash, Folder, Upload, ImageIcon } from "lucide-react"
import { type Block, useDialogStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SortableBlockItemProps {
  block: Block
}

export function SortableBlockItem({ block }: SortableBlockItemProps) {
  const { removeBlock, selectBlock, selectedBlockId } = useDialogStore()
  const [multifieldItems, setMultifieldItems] = useState([{ id: "item-1" }])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  const isSelected = selectedBlockId === block.id

  const addMultifieldItem = () => {
    setMultifieldItems([...multifieldItems, { id: `item-${multifieldItems.length + 1}` }])
  }

  const removeMultifieldItem = (index: number) => {
    const newItems = [...multifieldItems]
    newItems.splice(index, 1)
    setMultifieldItems(newItems)
  }

  // Función para verificar si el bloque tiene propiedades configuradas
  const hasConfiguredProperties = () => {
    // Verificar propiedades específicas según el tipo de bloque
    switch (block.type) {
      case "textfield":
        return (
          block.properties.fieldLabel !== "Texto" ||
          block.properties.fieldDescription !== "Descripción del campo de texto" ||
          block.properties.defaultValue !== "" ||
          block.properties.required === true
        )
      case "textarea":
        return (
          block.properties.fieldLabel !== "Área de Texto" ||
          block.properties.fieldDescription !== "Descripción del área de texto" ||
          block.properties.rows !== 5 ||
          block.properties.required === true
        )
      case "select":
        // Verificar si se han añadido o modificado opciones
        if (block.properties.options.length !== 2) return true
        if (block.properties.options[0].text !== "Opción 1" || block.properties.options[0].value !== "option1")
          return true
        if (block.properties.options[1].text !== "Opción 2" || block.properties.options[1].value !== "option2")
          return true

        return (
          block.properties.fieldLabel !== "Selector" ||
          block.properties.fieldDescription !== "Descripción del selector" ||
          block.properties.required === true
        )
      case "checkbox":
        return (
          block.properties.text !== "Activar" ||
          block.properties.checked !== false ||
          block.properties.fieldDescription !== "Descripción de la casilla de verificación"
        )
      case "richtext":
        // Verificar si se han modificado los plugins o configuraciones
        return (
          block.properties.fieldLabel !== "Texto Enriquecido" ||
          block.properties.fieldDescription !== "Descripción del editor de texto enriquecido" ||
          block.properties.useFixedInlineToolbar !== true ||
          block.properties.required === true
        )
      case "pathfield":
        return (
          block.properties.fieldLabel !== "Ruta" ||
          block.properties.fieldDescription !== "Seleccione una ruta" ||
          block.properties.rootPath !== "/content" ||
          block.properties.required === true
        )
      case "fileupload":
        return (
          block.properties.fieldLabel !== "Imagen" ||
          block.properties.fieldDescription !== "Seleccione una imagen para subir al DAM" ||
          block.properties.required === true
        )
      case "multifield":
        // Verificar si se han añadido o modificado componentes anidados
        if (!block.properties.nestedComponents || block.properties.nestedComponents.length !== 2) return true

        return (
          block.properties.fieldLabel !== "Campo Múltiple" ||
          block.properties.fieldDescription !== "Descripción del campo múltiple" ||
          block.properties.composite !== true ||
          block.properties.required === true
        )
      default:
        return false
    }
  }

  // Función para manejar la eliminación de un bloque
  const handleRemoveBlock = () => {
    if (hasConfiguredProperties()) {
      setIsDeleteDialogOpen(true)
    } else {
      removeBlock(block.id)
    }
  }

  // Función para confirmar la eliminación
  const confirmRemoveBlock = () => {
    removeBlock(block.id)
    setIsDeleteDialogOpen(false)
  }

  const renderField = () => {
    switch (block.type) {
      case "textfield":
        return (
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between">
              <Label htmlFor={block.id} className="text-sm font-medium">
                {block.properties.fieldLabel}
              </Label>
              {block.properties.fieldDescription && (
                <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-transparent">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Input
              id={block.id}
              placeholder="Ingrese un valor"
              className="max-w-xl"
              defaultValue={block.properties.defaultValue}
            />
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between">
              <Label htmlFor={block.id} className="text-sm font-medium">
                {block.properties.fieldLabel}
              </Label>
              {block.properties.fieldDescription && (
                <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-transparent">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Textarea id={block.id} placeholder="Ingrese un texto" className="max-w-xl" rows={block.properties.rows} />
          </div>
        )

      case "select":
        return (
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between">
              <Label htmlFor={block.id} className="text-sm font-medium">
                {block.properties.fieldLabel}
              </Label>
              {block.properties.fieldDescription && (
                <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-transparent">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select>
              <SelectTrigger id={block.id} className="max-w-xl">
                <SelectValue placeholder="Seleccione una opción" />
              </SelectTrigger>
              <SelectContent>
                {block.properties.options.map((option: any, index: number) => (
                  <SelectItem key={index} value={option.value}>
                    {option.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Checkbox id={block.id} defaultChecked={block.properties.checked} />
            <div className="flex items-center justify-between w-full">
              <Label htmlFor={block.id} className="text-sm font-medium">
                {block.properties.text}
              </Label>
              {block.properties.fieldDescription && (
                <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-transparent">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )

      case "heading":
        return (
          <div className="w-full">
            <div className="flex items-center justify-between">
              <h3 className={`text-${"h" + block.properties.level} font-bold`}>{block.properties.text}</h3>
              {block.properties.fieldDescription && (
                <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-transparent">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )

      case "richtext":
        return (
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between">
              <Label htmlFor={block.id} className="text-sm font-medium">
                {block.properties.fieldLabel}
              </Label>
              {block.properties.fieldDescription && (
                <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-transparent">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="border rounded-md p-1 max-w-xl">
              {/* Eliminar la barra de herramientas y mostrar solo el área de contenido */}
              <div className="min-h-[100px] p-2 bg-white dark:bg-gray-800">
                <p className="text-gray-400 dark:text-gray-500">Editor de texto enriquecido</p>
              </div>
            </div>
          </div>
        )

      case "pathfield":
        return (
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between">
              <Label htmlFor={block.id} className="text-sm font-medium">
                {block.properties.fieldLabel}
              </Label>
              {block.properties.fieldDescription && (
                <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-transparent">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex max-w-xl">
              <Input id={block.id} placeholder="Seleccione una ruta" className="rounded-r-none" />
              <Button variant="secondary" className="rounded-l-none">
                <Folder className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Ruta raíz: {block.properties.rootPath}</p>
          </div>
        )

      case "fileupload":
        return (
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between">
              <Label htmlFor={block.id} className="text-sm font-medium">
                {block.properties.fieldLabel}
              </Label>
              {block.properties.fieldDescription && (
                <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-transparent">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="border-2 border-dashed rounded-md p-6 max-w-xl bg-gray-50 flex flex-col items-center justify-center">
              <div className="mb-4 bg-blue-50 rounded-full p-3">
                <ImageIcon className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-sm text-center mb-2">Arrastre una imagen aquí o haga clic para seleccionar</p>
              <p className="text-xs text-gray-500 text-center">
                Formatos permitidos: {block.properties.mimeTypes.map((type: string) => type.split("/")[1]).join(", ")}
              </p>
              <p className="text-xs text-gray-500 text-center">Tamaño máximo: {block.properties.sizeLimit} MB</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar archivo
              </Button>
            </div>
          </div>
        )

      case "multifield":
        return (
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between">
              <Label htmlFor={block.id} className="text-sm font-medium">
                {block.properties.fieldLabel}
              </Label>
              {block.properties.fieldDescription && (
                <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-transparent">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="border rounded-md p-3 max-w-xl">
              {multifieldItems.map((item, index) => (
                <div key={item.id} className="border rounded-md p-3 mb-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Elemento {index + 1}</h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMultifieldItem(index)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>

                  {block.properties.nestedComponents &&
                    block.properties.nestedComponents.map((comp: any, compIndex: number) => (
                      <div key={compIndex} className="mb-3">
                        {comp.type === "textfield" && (
                          <div className="space-y-1">
                            <Label className="text-xs">{comp.fieldLabel}</Label>
                            <Input placeholder="Ingrese un valor" className="h-8 text-sm" />
                          </div>
                        )}

                        {comp.type === "pathfield" && (
                          <div className="space-y-1">
                            <Label className="text-xs">{comp.fieldLabel}</Label>
                            <div className="flex">
                              <Input placeholder="Seleccione una ruta" className="h-8 text-sm rounded-r-none" />
                              <Button variant="secondary" size="sm" className="rounded-l-none h-8">
                                <Folder className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {comp.type === "textarea" && (
                          <div className="space-y-1">
                            <Label className="text-xs">{comp.fieldLabel}</Label>
                            <Textarea placeholder="Ingrese un texto" className="text-sm" rows={2} />
                          </div>
                        )}

                        {comp.type === "select" && (
                          <div className="space-y-1">
                            <Label className="text-xs">{comp.fieldLabel}</Label>
                            <Select>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Seleccione una opción" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="option1">Opción 1</SelectItem>
                                <SelectItem value="option2">Opción 2</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={addMultifieldItem}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir elemento
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "relative bg-background rounded-sm border p-4",
          isSelected && "ring-2 ring-blue-600 dark:ring-blue-400",
        )}
        onClick={() => selectBlock(block.id)}
      >
        <div className="flex items-start gap-4">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none mt-2">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex-1">{renderField()}</div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              handleRemoveBlock()
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
      </div>

      {/* Diálogo de confirmación para eliminar un bloque con propiedades configuradas */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              Este componente tiene propiedades configuradas. ¿Estás seguro de que deseas eliminarlo?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmRemoveBlock}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
