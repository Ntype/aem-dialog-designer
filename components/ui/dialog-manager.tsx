"use client"

import { useState, forwardRef } from "react"
import { useDialogStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, Plus, Edit2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export const DialogManager = forwardRef<HTMLButtonElement>((props, ref) => {
  const { toast } = useToast()
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [dialogName, setDialogName] = useState("")
  const [dialogToRename, setDialogToRename] = useState<string | null>(null)

  // Añadir un nuevo estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [dialogToDelete, setDialogToDelete] = useState<string | null>(null)

  const {
    currentProject,
    activeDialogId,
    createDialog,
    removeDialog,
    updateDialogName,
    setActiveDialog,
    getActiveDialog,
  } = useDialogStore()

  const activeDialog = getActiveDialog()

  const handleCreateDialog = () => {
    if (dialogName.trim() === "") {
      toast({
        title: "Error",
        description: "El nombre del diálogo no puede estar vacío",
        variant: "destructive",
      })
      return
    }

    createDialog(dialogName)
    setIsNewDialogOpen(false)
    setDialogName("")

    toast({
      title: "Diálogo creado",
      description: `Se ha creado un nuevo diálogo: ${dialogName}`,
    })
  }

  const handleRenameDialog = () => {
    if (!dialogToRename || dialogName.trim() === "") {
      toast({
        title: "Error",
        description: "El nombre del diálogo no puede estar vacío",
        variant: "destructive",
      })
      return
    }

    updateDialogName(dialogToRename, dialogName)
    setIsRenameDialogOpen(false)
    setDialogName("")
    setDialogToRename(null)

    toast({
      title: "Diálogo renombrado",
      description: `El diálogo ha sido renombrado a: ${dialogName}`,
    })
  }

  const openRenameDialog = (id: string, name: string) => {
    setDialogToRename(id)
    setDialogName(name)
    setIsRenameDialogOpen(true)
  }

  // Reemplazar la función handleRemoveDialog para usar el diálogo personalizado
  const handleRemoveDialog = (id: string) => {
    setDialogToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Añadir una nueva función para confirmar la eliminación
  const confirmDeleteDialog = () => {
    if (dialogToDelete) {
      removeDialog(dialogToDelete)
      setDialogToDelete(null)
      setIsDeleteDialogOpen(false)

      toast({
        title: "Diálogo eliminado",
        description: "El diálogo ha sido eliminado correctamente",
      })
    }
  }

  if (!currentProject) {
    return (
      <Button variant="outline" disabled className="h-10">
        No hay proyecto activo
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button ref={ref} variant="outline" className="h-10">
            {activeDialog?.name || "Seleccionar diálogo"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {currentProject.dialogs.map((dialog) => (
            <DropdownMenuItem
              key={dialog.id}
              className="flex items-center justify-between"
              onSelect={() => setActiveDialog(dialog.id)}
            >
              <span className={activeDialogId === dialog.id ? "font-bold" : ""}>{dialog.name}</span>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    openRenameDialog(dialog.id, dialog.name)
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="sr-only">Renombrar</span>
                </Button>
                {currentProject.dialogs.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveDialog(dialog.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsNewDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo diálogo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo para crear un nuevo diálogo */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo diálogo</DialogTitle>
            <DialogDescription>Crea un nuevo diálogo en el proyecto actual</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dialog-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="dialog-name"
                value={dialogName}
                onChange={(e) => setDialogName(e.target.value)}
                placeholder="Mi Diálogo"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateDialog}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para renombrar un diálogo */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar diálogo</DialogTitle>
            <DialogDescription>Cambia el nombre del diálogo seleccionado</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dialog-rename" className="text-right">
                Nombre
              </Label>
              <Input
                id="dialog-rename"
                value={dialogName}
                onChange={(e) => setDialogName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRenameDialog}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este diálogo? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteDialog}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})

DialogManager.displayName = "DialogManager"
