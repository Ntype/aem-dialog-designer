"use client"

import { useState, forwardRef } from "react"
import { useDialogStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderOpen, Save, FilePlus, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Modificar la definición del componente para aceptar la prop onSaveSuccess
export const ProjectMenu = forwardRef<HTMLButtonElement, { onSaveSuccess?: () => void }>((props, ref) => {
  const { toast } = useToast()
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const { currentProject, createProject, loadProject, saveProject, updateProjectName } = useDialogStore()
  const { onSaveSuccess } = props

  // Añadir nuevos estados para los diálogos de confirmación
  const [isConfirmNewProjectDialogOpen, setIsConfirmNewProjectDialogOpen] = useState(false)
  const [isConfirmOpenProjectDialogOpen, setIsConfirmOpenProjectDialogOpen] = useState(false)

  // Añadir un nuevo estado para el diálogo de "Guardar como"
  const [isSaveAsDialogOpen, setIsSaveAsDialogOpen] = useState(false)
  const [saveFileName, setSaveFileName] = useState("")

  // Modificar la función handleNewProject para usar el diálogo personalizado
  const handleNewProject = () => {
    if (projectName.trim() === "") {
      toast({
        title: "Error",
        description: "El nombre del proyecto no puede estar vacío",
        variant: "destructive",
      })
      return
    }

    // Confirmar con el usuario si hay cambios sin guardar
    if (currentProject) {
      setIsConfirmNewProjectDialogOpen(true)
      return
    }

    // Si no hay proyecto actual, crear uno nuevo directamente
    createNewProject()
  }

  // Función para crear un nuevo proyecto después de la confirmación
  const createNewProject = () => {
    createProject(projectName)
    setIsNewProjectDialogOpen(false)
    setIsConfirmNewProjectDialogOpen(false)
    setProjectName("")

    toast({
      title: "Proyecto creado",
      description: `Se ha creado un nuevo proyecto: ${projectName}`,
    })
  }

  // Modificar la función handleOpenProject para usar el diálogo personalizado
  const handleOpenProject = () => {
    // Confirmar con el usuario si hay cambios sin guardar
    if (currentProject) {
      setIsConfirmOpenProjectDialogOpen(true)
      return
    }

    // Si no hay proyecto actual, abrir el selector de archivos directamente
    openProjectFileSelector()
  }

  // Función para abrir el selector de archivos
  const openProjectFileSelector = () => {
    // Crear un input de tipo file
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json,.aem-project.json"

    // Manejar el evento de cambio
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          const projectData = JSON.parse(content)

          // Validar que el archivo tenga la estructura correcta
          if (!projectData.dialogs) {
            throw new Error("El archivo no tiene un formato válido de proyecto")
          }

          // Cargar el proyecto
          loadProject(projectData)
          setIsConfirmOpenProjectDialogOpen(false)

          toast({
            title: "Proyecto abierto",
            description: `Se ha abierto el proyecto: ${projectData.name}`,
          })
        } catch (error) {
          console.error("Error al abrir el proyecto:", error)
          toast({
            title: "Error",
            description: "No se pudo abrir el proyecto. El archivo podría estar dañado o tener un formato incorrecto.",
            variant: "destructive",
          })
        }
      }

      reader.readAsText(file)
    }

    // Simular clic en el input
    input.click()
  }

  // Modificar la función handleSaveProject para usar el diálogo personalizado
  const handleSaveProject = () => {
    try {
      if (!currentProject) {
        toast({
          title: "Error",
          description: "No hay un proyecto activo para guardar",
          variant: "destructive",
        })
        return
      }

      // Abrir el diálogo de "Guardar como"
      setSaveFileName(currentProject.name.replace(/\s+/g, "-").toLowerCase())
      setIsSaveAsDialogOpen(true)
    } catch (error) {
      console.error("Error al preparar el guardado del proyecto:", error)
      toast({
        title: "Error",
        description: "No se pudo preparar el guardado del proyecto",
        variant: "destructive",
      })
    }
  }

  // Añadir una nueva función para guardar el proyecto con el nombre especificado
  const saveProjectWithName = async () => {
    try {
      if (!currentProject) {
        toast({
          title: "Error",
          description: "No hay un proyecto activo para guardar",
          variant: "destructive",
        })
        return
      }

      // Guardar el proyecto y obtener los datos actualizados
      const projectData = saveProject()

      // Convertir a JSON
      const jsonData = JSON.stringify(projectData, null, 2)

      // Crear un blob con los datos
      const blob = new Blob([jsonData], { type: "application/json" })

      // Nombre del archivo con extensión
      const fileName = `${saveFileName}.aem-project.json`

      // Verificar si podemos usar la API File System Access
      const canUseFileSystemAccess =
        "showSaveFilePicker" in window &&
        window.self === window.top && // No estamos en un iframe
        window.location.protocol !== "http:" // Estamos en HTTPS o localhost

      if (canUseFileSystemAccess) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: "Archivo de proyecto AEM",
                accept: { "application/json": [".json"] },
              },
            ],
          })

          const writable = await fileHandle.createWritable()
          await writable.write(blob)
          await writable.close()

          setIsSaveAsDialogOpen(false)

          toast({
            title: "Proyecto guardado",
            description: "El proyecto se ha guardado correctamente",
          })
        } catch (err) {
          console.error("Error al intentar usar File System Access API:", err)

          // Si hay un error con la API, usar el método tradicional
          if ((err as Error).name !== "AbortError") {
            // Usar el método tradicional de descarga
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = fileName
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            setIsSaveAsDialogOpen(false)

            toast({
              title: "Proyecto guardado",
              description: `El proyecto se ha guardado como ${fileName}`,
            })
          }
        }
      } else {
        // Usar el método tradicional de descarga
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setIsSaveAsDialogOpen(false)

        toast({
          title: "Proyecto guardado",
          description: `El proyecto se ha guardado como ${fileName}`,
        })
      }
    } catch (error) {
      console.error("Error al guardar el proyecto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el proyecto",
        variant: "destructive",
      })
    }
  }

  // Añadir una función para guardar rápidamente con el nombre actual
  const quickSaveProject = async (onSaveSuccess?: () => void) => {
    try {
      if (!currentProject) {
        toast({
          title: "Error",
          description: "No hay un proyecto activo para guardar",
          variant: "destructive",
        })
        return
      }

      // Guardar el proyecto y obtener los datos actualizados
      const projectData = saveProject()

      // Convertir a JSON
      const jsonData = JSON.stringify(projectData, null, 2)

      // Crear un blob con los datos
      const blob = new Blob([jsonData], { type: "application/json" })

      const fileName = `${projectData.name.replace(/\s+/g, "-").toLowerCase()}.aem-project.json`

      // Verificar si podemos usar la API File System Access
      const canUseFileSystemAccess =
        "showSaveFilePicker" in window &&
        window.self === window.top && // No estamos en un iframe
        window.location.protocol !== "http:" // Estamos en HTTPS o localhost

      if (canUseFileSystemAccess) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: "Archivo de proyecto AEM",
                accept: { "application/json": [".json"] },
              },
            ],
          })

          const writable = await fileHandle.createWritable()
          await writable.write(blob)
          await writable.close()

          if (onSaveSuccess) onSaveSuccess()
          else {
            toast({
              title: "Proyecto guardado",
              description: "El proyecto se ha guardado correctamente",
            })
          }
        } catch (err) {
          console.error("Error al intentar usar File System Access API:", err)

          // Si hay un error con la API, usar el método tradicional
          if ((err as Error).name !== "AbortError") {
            // Usar el método tradicional de descarga
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = fileName
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            if (onSaveSuccess) onSaveSuccess()
            else {
              toast({
                title: "Proyecto guardado",
                description: `El proyecto se ha guardado como ${fileName}`,
              })
            }
          }
        }
      } else {
        // Usar el método tradicional de descarga
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        if (onSaveSuccess) onSaveSuccess()
        else {
          toast({
            title: "Proyecto guardado",
            description: `El proyecto se ha guardado como ${fileName}`,
          })
        }
      }
    } catch (error) {
      console.error("Error al guardar el proyecto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el proyecto",
        variant: "destructive",
      })
    }
  }

  // Función para renombrar el proyecto
  const handleRenameProject = () => {
    if (!currentProject) return

    const newName = prompt("Introduce el nuevo nombre del proyecto:", currentProject.name)
    if (newName && newName.trim() !== "") {
      updateProjectName(newName)

      toast({
        title: "Proyecto renombrado",
        description: `El proyecto ha sido renombrado a: ${newName}`,
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        {/* Modificar el botón para que siempre muestre "Archivo" en lugar del nombre del proyecto */}
        <DropdownMenuTrigger asChild>
          <Button ref={ref} variant="outline" className="h-10">
            <FileText className="mr-2 h-4 w-4" />
            Archivo
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsNewProjectDialogOpen(true)}>
            <FilePlus className="mr-2 h-4 w-4" />
            Nuevo proyecto
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenProject}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Abrir proyecto
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Modificar la llamada a quickSaveProject en el DropdownMenuItem */}
          <DropdownMenuItem onClick={() => quickSaveProject(onSaveSuccess)} disabled={!currentProject}>
            <Save className="mr-2 h-4 w-4" />
            Guardar proyecto
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRenameProject} disabled={!currentProject}>
            <FilePlus className="mr-2 h-4 w-4" />
            Renombrar proyecto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo proyecto</DialogTitle>
            <DialogDescription>Crea un nuevo proyecto de diálogos AEM</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Mi Proyecto"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewProjectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNewProject}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar la creación de un nuevo proyecto */}
      <Dialog open={isConfirmNewProjectDialogOpen} onOpenChange={setIsConfirmNewProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar nuevo proyecto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de crear un nuevo proyecto? Los cambios no guardados se perderán.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmNewProjectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createNewProject}>Crear nuevo proyecto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar la apertura de un proyecto existente */}
      <Dialog open={isConfirmOpenProjectDialogOpen} onOpenChange={setIsConfirmOpenProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar abrir proyecto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de abrir otro proyecto? Los cambios no guardados se perderán.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmOpenProjectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={openProjectFileSelector}>Abrir proyecto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})

ProjectMenu.displayName = "ProjectMenu"
