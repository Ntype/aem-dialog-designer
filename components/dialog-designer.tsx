"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { BlockPalette } from "@/components/ui/block-palette"
import { DesignArea } from "@/components/ui/design-area"
import { PropertiesPanel } from "@/components/ui/properties-panel"
import { PreviewPanel } from "@/components/ui/preview-panel"
import { ExportDialog } from "@/components/ui/export-dialog"
import { CustomBlocksDialog } from "@/components/ui/custom-blocks-dialog"
import { ProjectMenu } from "@/components/ui/project-menu"
import { DialogManager } from "@/components/ui/dialog-manager"
import { useDialogStore, blocks, activeTabId, dialogTitle } from "@/lib/store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, AlertCircle, FilePlus, FolderOpen } from "lucide-react"
import html2canvas from "html2canvas"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/toaster"
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
import { useToast } from "@/hooks/use-toast"

export function DialogDesigner() {
  const { toast } = useToast()
  const { currentProject, getActiveDialog, createProject, loadProject } = useDialogStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"design" | "preview">("design")
  const previewCallbackRef = useRef<any>({})
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const [lastAddedBlock, setLastAddedBlock] = useState<string | null>(null)
  const [showMultiAddMessage, setShowMultiAddMessage] = useState(false)

  // Estados para los diálogos
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false)
  const [projectName, setProjectName] = useState("")

  // Añadir un nuevo estado para rastrear si hay cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Obtener los bloques y el ID de la pestaña activa
  const allBlocks = blocks() || []
  const currentActiveTabId = activeTabId()
  const currentDialogTitle = dialogTitle()
  const activeDialog = getActiveDialog()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  )

  // Detectar cuando se presiona la tecla Control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        setIsCtrlPressed(true)
        setShowMultiAddMessage(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        setIsCtrlPressed(false)
        setShowMultiAddMessage(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Ocultar el mensaje después de 5 segundos
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (showMultiAddMessage) {
      timeout = setTimeout(() => {
        if (isCtrlPressed) {
          setShowMultiAddMessage(false)
        }
      }, 5000)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [showMultiAddMessage, isCtrlPressed])

  // Añadir un efecto para configurar el evento beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Mensaje estándar que mostrará el navegador
        const message = "Hay cambios sin guardar. ¿Estás seguro de que quieres salir?"
        e.returnValue = message
        return message
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  // Añadir un efecto para detectar cambios en el proyecto
  useEffect(() => {
    if (currentProject) {
      setHasUnsavedChanges(true)
    }
  }, [currentProject, allBlocks.length, activeDialog?.name])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const filteredBlocks = allBlocks.filter((block) => block.tabId === currentActiveTabId)
        const activeIndex = filteredBlocks.findIndex((block) => block.id === active.id)
        const overIndex = filteredBlocks.findIndex((block) => block.id === over.id)

        if (activeIndex !== -1 && overIndex !== -1) {
          // Encontrar los índices reales en el array completo
          const realActiveIndex = allBlocks.findIndex((block) => block.id === active.id)
          const realOverIndex = allBlocks.findIndex((block) => block.id === over.id)

          useDialogStore.getState().moveBlock(realActiveIndex, realOverIndex)
        }
      }

      setActiveId(null)
    },
    [allBlocks, currentActiveTabId],
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event

      if (!over) return

      // Si estamos arrastrando desde la paleta al área de diseño
      if (active.id.toString().startsWith("draggable-") && over.id === "design-area") {
        const blockData = active.data.current?.block

        if (blockData) {
          // Verificar si podemos añadir el bloque
          const blockTypeId = blockData.type

          // Si no está presionada la tecla Control y ya hemos añadido un bloque de este tipo recientemente
          if (!isCtrlPressed && lastAddedBlock === blockTypeId) {
            // No permitir añadir otro bloque del mismo tipo
            return
          }

          // Añadir el bloque y registrar que se ha añadido
          useDialogStore.getState().addBlock({
            type: blockData.type,
            name: blockData.name,
            label: blockData.label,
            properties: { ...blockData.properties },
            xmlTemplate: blockData.xmlTemplate,
            tabId: currentActiveTabId,
          })

          // Registrar el último tipo de bloque añadido
          setLastAddedBlock(blockTypeId)

          // Si la tecla Control está presionada, no actualizar lastAddedBlock para permitir múltiples adiciones
          if (isCtrlPressed) {
            setLastAddedBlock(null)
          }
        }
      }
    },
    [isCtrlPressed, lastAddedBlock, currentActiveTabId],
  )

  // Resetear el último bloque añadido cuando se suelta el ratón
  useEffect(() => {
    const handleMouseUp = () => {
      if (!isCtrlPressed) {
        setLastAddedBlock(null)
      }
    }

    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isCtrlPressed])

  const handleDownloadJpg = async () => {
    const previewRef = previewCallbackRef.current?.previewRef
    if (!previewRef?.current) return

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const image = canvas.toDataURL("image/jpeg", 0.9)
      const link = document.createElement("a")
      link.href = image
      link.download = `${currentDialogTitle.replace(/\s+/g, "-").toLowerCase()}-preview.jpg`
      link.click()
    } catch (error) {
      console.error("Error al generar la imagen:", error)
    }
  }

  // Función para crear un nuevo proyecto
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
      if (!window.confirm("¿Estás seguro de crear un nuevo proyecto? Los cambios no guardados se perderán.")) {
        return
      }
    }

    // Crear nuevo proyecto
    createProject(projectName)
    setIsNewProjectDialogOpen(false)
    setProjectName("")

    toast({
      title: "Proyecto creado",
      description: `Se ha creado un nuevo proyecto: ${projectName}`,
    })
  }

  // Función para abrir un proyecto existente
  const handleOpenProject = () => {
    // Confirmar con el usuario si hay cambios sin guardar
    if (currentProject) {
      if (!window.confirm("¿Estás seguro de abrir otro proyecto? Los cambios no guardados se perderán.")) {
        return
      }
    }

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

  // Modificar la función quickSaveProject en ProjectMenu para resetear el estado de cambios sin guardar
  const handleProjectSaved = () => {
    setHasUnsavedChanges(false)
    toast({
      title: "Proyecto guardado",
      description: "El proyecto se ha guardado correctamente",
    })
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <div className="flex flex-col h-screen w-full">
        <header className="border-b p-4 bg-background w-full">
          <div className="w-full flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Diseñador de Diálogos AEM</h1>
              {currentProject && (
                <span className="text-lg font-semibold text-primary border-l-2 border-primary pl-2 ml-2">
                  {currentProject.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ProjectMenu onSaveSuccess={handleProjectSaved} />
              {currentProject && <DialogManager />}
              <CustomBlocksDialog />
              {viewMode === "preview" && (
                <Button variant="default" onClick={handleDownloadJpg} className="h-10" disabled={!activeDialog}>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar JPG
                </Button>
              )}
              <ExportDialog />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {showMultiAddMessage && (
          <Alert className="mx-4 mt-2 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-600">
              Tecla Control detectada: Puede añadir múltiples componentes del mismo tipo.
            </AlertDescription>
          </Alert>
        )}

        {!currentProject ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <h2 className="text-2xl font-bold mb-4">Bienvenido al Diseñador de Diálogos AEM</h2>
              <p className="mb-6 text-muted-foreground">Para comenzar, crea un nuevo proyecto o abre uno existente.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setIsNewProjectDialogOpen(true)}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Crear proyecto
                </Button>
                <Button variant="outline" onClick={handleOpenProject}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Abrir proyecto
                </Button>
              </div>
            </div>
          </div>
        ) : !activeDialog ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <h2 className="text-2xl font-bold mb-4">Selecciona o crea un diálogo</h2>
              <p className="mb-6 text-muted-foreground">
                Para comenzar a diseñar, selecciona un diálogo existente o crea uno nuevo utilizando el menú "Diálogo"
                en la parte superior.
              </p>
              <Button
                onClick={() => {
                  const dialogButton = document.querySelector("button:has(.lucide-chevron-down)") as HTMLButtonElement
                  if (dialogButton) dialogButton.click()
                }}
              >
                Gestionar diálogos
              </Button>
            </div>
          </div>
        ) : (
          <main className="flex-1 w-full px-4 py-6">
            <div className="grid grid-cols-12 gap-6 h-full w-full">
              <div className="col-span-12 md:col-span-3">
                <BlockPalette />
              </div>

              <div className="col-span-12 md:col-span-6">
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "design" | "preview")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="design">Diseño</TabsTrigger>
                    <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                  </TabsList>
                  <TabsContent value="design" className="mt-4">
                    <DesignArea />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-4">
                    <PreviewPanel onDownload={previewCallbackRef.current} />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="col-span-12 md:col-span-3">
                <PropertiesPanel />
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Diálogo para crear un nuevo proyecto */}
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

      <Toaster />
    </DndContext>
  )
}
