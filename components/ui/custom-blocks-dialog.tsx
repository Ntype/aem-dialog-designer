"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDialogStore, type CustomBlock } from "@/lib/store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Settings, Trash2, Upload } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export function CustomBlocksDialog() {
  const { toast } = useToast()
  const { currentProject, addCustomBlock, removeCustomBlock } = useDialogStore()
  const [open, setOpen] = useState(false)
  const [newBlock, setNewBlock] = useState<Omit<CustomBlock, "id">>({
    name: "",
    imageUrl: "",
    xmlTemplate: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const customBlocks = currentProject?.customBlocks || []

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Crear una URL para la vista previa de la imagen
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setNewBlock((prev) => ({ ...prev, imageUrl: event.target.result as string }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddBlock = () => {
    if (!currentProject) {
      toast({
        title: "Error",
        description: "No hay un proyecto activo",
        variant: "destructive",
      })
      return
    }

    if (newBlock.name && newBlock.imageUrl && newBlock.xmlTemplate) {
      addCustomBlock(newBlock)
      setNewBlock({
        name: "",
        imageUrl: "",
        xmlTemplate: "",
      })
      setImageFile(null)

      toast({
        title: "Bloque personalizado añadido",
        description: `Se ha añadido el bloque personalizado: ${newBlock.name}`,
      })
    } else {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
    }
  }

  const handleRemoveBlock = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este bloque personalizado?")) {
      removeCustomBlock(id)

      toast({
        title: "Bloque eliminado",
        description: "El bloque personalizado ha sido eliminado",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10" disabled={!currentProject}>
          <Settings className="mr-2 h-4 w-4" />
          Componentes Personalizados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Gestionar Componentes Personalizados</DialogTitle>
          <DialogDescription>
            Añade y gestiona tus propios componentes personalizados para el diseñador de diálogos
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Añadir Nuevo Componente</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="block-name">Nombre del Componente</Label>
                  <Input
                    id="block-name"
                    value={newBlock.name}
                    onChange={(e) => setNewBlock((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Mi Componente Personalizado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="block-image">Imagen del Componente</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 border rounded-md flex items-center justify-center overflow-hidden">
                      {newBlock.imageUrl ? (
                        <Image
                          src={newBlock.imageUrl || "/placeholder.svg"}
                          alt="Vista previa"
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      ) : (
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <Input id="block-image" type="file" accept="image/*" onChange={handleImageChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="block-xml">Plantilla XML</Label>
                  <Textarea
                    id="block-xml"
                    value={newBlock.xmlTemplate}
                    onChange={(e) => setNewBlock((prev) => ({ ...prev, xmlTemplate: e.target.value }))}
                    placeholder="<mycomponent jcr:primaryType='nt:unstructured' sling:resourceType='my/component' />"
                    className="font-mono text-xs h-40"
                  />
                </div>

                <Button
                  onClick={handleAddBlock}
                  disabled={!newBlock.name || !newBlock.imageUrl || !newBlock.xmlTemplate}
                  className="h-10"
                >
                  Añadir Componente
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Componentes Existentes</h3>
              <ScrollArea className="h-[400px]">
                {customBlocks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay componentes personalizados. Añade uno nuevo para empezar.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {customBlocks.map((block) => (
                      <Card key={block.id}>
                        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 border rounded-md flex items-center justify-center overflow-hidden">
                              <Image
                                src={block.imageUrl || "/placeholder.svg"}
                                alt={block.name}
                                width={40}
                                height={40}
                                className="object-contain"
                              />
                            </div>
                            <h4 className="font-medium">{block.name}</h4>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveBlock(block.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-xs font-mono bg-muted p-2 rounded-md max-h-20 overflow-auto">
                            {block.xmlTemplate}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
