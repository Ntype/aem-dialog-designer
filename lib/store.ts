import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"

export type BlockType =
  | "textfield"
  | "textarea"
  | "select"
  | "checkbox"
  | "richtext"
  | "multifield"
  | "pathfield"
  | "fileupload"
  | "custom"

export interface Block {
  id: string
  type: BlockType
  name: string
  label: string
  icon?: string
  properties: Record<string, any>
  xmlTemplate?: string
  tabId: string
}

export interface CustomBlock {
  id: string
  name: string
  imageUrl: string
  xmlTemplate: string
}

export interface Tab {
  id: string
  name: string
}

export interface Dialog {
  id: string
  name: string
  helpPath: string
  tabs: Tab[]
  blocks: Block[]
}

export interface Project {
  id: string
  name: string
  dialogs: Dialog[]
  customBlocks: CustomBlock[]
  lastModified: string
}

// Modificar el store para rastrear cambios
interface DialogState {
  // Proyecto actual
  currentProject: Project | null
  // ID del diálogo activo dentro del proyecto actual
  activeDialogId: string | null
  // Estado temporal para el diálogo activo
  selectedBlockId: string | null
  activeTabId: string | null
  hasUnsavedChanges: boolean

  // Métodos para gestionar proyectos
  createProject: (name: string) => void
  loadProject: (project: Project) => void
  saveProject: () => Project
  updateProjectName: (name: string) => void

  // Métodos para gestionar diálogos
  createDialog: (name: string) => void
  removeDialog: (id: string) => void
  updateDialogName: (id: string, name: string) => void
  setActiveDialog: (id: string) => void
  getActiveDialog: () => Dialog | null

  // Métodos para gestionar bloques
  addBlock: (block: Omit<Block, "id">) => void
  removeBlock: (id: string) => void
  updateBlock: (id: string, updates: Partial<Omit<Block, "id">>) => void
  moveBlock: (fromIndex: number, toIndex: number) => void
  selectBlock: (id: string | null) => void
  clearBlocks: () => void

  // Métodos para gestionar pestañas
  addTab: (name: string) => void
  removeTab: (id: string) => void
  updateTab: (id: string, name: string) => void
  setActiveTab: (id: string) => void

  // Métodos para gestionar bloques personalizados
  addCustomBlock: (block: Omit<CustomBlock, "id">) => void
  removeCustomBlock: (id: string) => void

  // Métodos para gestionar propiedades del diálogo
  setDialogHelpPath: (path: string) => void
  setHasUnsavedChanges: (value: boolean) => void
}

// Función para crear un diálogo vacío
const createEmptyDialog = (name: string): Dialog => ({
  id: uuidv4(),
  name,
  helpPath: "",
  tabs: [{ id: "default", name: "Properties" }],
  blocks: [],
})

// Función para crear un proyecto vacío
const createEmptyProject = (name: string): Project => ({
  id: uuidv4(),
  name,
  dialogs: [createEmptyDialog("Dialog 1")],
  customBlocks: [],
  lastModified: new Date().toISOString(),
})

// En la definición del store
export const useDialogStore = create<DialogState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      activeDialogId: null,
      selectedBlockId: null,
      activeTabId: null,
      hasUnsavedChanges: false,
      setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),

      // Métodos para gestionar proyectos
      createProject: (name) => {
        const newProject = createEmptyProject(name)
        set({
          currentProject: newProject,
          activeDialogId: newProject.dialogs[0].id,
          activeTabId: newProject.dialogs[0].tabs[0].id,
          selectedBlockId: null,
        })
      },

      loadProject: (project) => {
        set({
          currentProject: project,
          activeDialogId: project.dialogs[0]?.id || null,
          activeTabId: project.dialogs[0]?.tabs[0]?.id || null,
          selectedBlockId: null,
        })
      },

      // Modificar saveProject para resetear hasUnsavedChanges
      saveProject: () => {
        const { currentProject } = get()
        if (!currentProject) throw new Error("No hay un proyecto activo")

        // Actualizar la fecha de última modificación
        const updatedProject = {
          ...currentProject,
          lastModified: new Date().toISOString(),
        }

        set({
          currentProject: updatedProject,
          hasUnsavedChanges: false,
        })
        return updatedProject
      },

      updateProjectName: (name) => {
        const { currentProject } = get()
        if (!currentProject) return

        set({
          currentProject: {
            ...currentProject,
            name,
            lastModified: new Date().toISOString(),
          },
        })
      },

      // Métodos para gestionar diálogos
      createDialog: (name) => {
        const { currentProject } = get()
        if (!currentProject) return

        const newDialog = createEmptyDialog(name)

        set({
          currentProject: {
            ...currentProject,
            dialogs: [...currentProject.dialogs, newDialog],
            lastModified: new Date().toISOString(),
          },
          activeDialogId: newDialog.id,
          activeTabId: newDialog.tabs[0].id,
          selectedBlockId: null,
          hasUnsavedChanges: true,
        })
      },

      removeDialog: (id) => {
        const { currentProject, activeDialogId } = get()
        if (!currentProject) return

        // No permitir eliminar el último diálogo
        if (currentProject.dialogs.length <= 1) return

        const updatedDialogs = currentProject.dialogs.filter((dialog) => dialog.id !== id)

        // Si se elimina el diálogo activo, activar el primero
        const newActiveDialogId = activeDialogId === id ? updatedDialogs[0].id : activeDialogId

        set({
          currentProject: {
            ...currentProject,
            dialogs: updatedDialogs,
            lastModified: new Date().toISOString(),
          },
          activeDialogId: newActiveDialogId,
          activeTabId: updatedDialogs.find((d) => d.id === newActiveDialogId)?.tabs[0].id || null,
          selectedBlockId: null,
          hasUnsavedChanges: true,
        })
      },

      updateDialogName: (id, name) => {
        const { currentProject } = get()
        if (!currentProject) return

        set({
          currentProject: {
            ...currentProject,
            dialogs: currentProject.dialogs.map((dialog) => (dialog.id === id ? { ...dialog, name } : dialog)),
            lastModified: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        })
      },

      setActiveDialog: (id) => {
        const { currentProject } = get()
        if (!currentProject) return

        const dialog = currentProject.dialogs.find((d) => d.id === id)
        if (!dialog) return

        set({
          activeDialogId: id,
          activeTabId: dialog.tabs[0].id,
          selectedBlockId: null,
        })
      },

      getActiveDialog: () => {
        const { currentProject, activeDialogId } = get()
        if (!currentProject || !activeDialogId) return null

        return currentProject.dialogs.find((dialog) => dialog.id === activeDialogId) || null
      },

      // Modificar las funciones que cambian el estado para actualizar hasUnsavedChanges
      addBlock: (block) => {
        const { currentProject, activeDialogId, activeTabId } = get()
        if (!currentProject || !activeDialogId || !activeTabId) return

        const newBlock = {
          ...block,
          id: uuidv4(),
          tabId: activeTabId,
        }

        set({
          currentProject: {
            ...currentProject,
            dialogs: currentProject.dialogs.map((dialog) =>
              dialog.id === activeDialogId ? { ...dialog, blocks: [...dialog.blocks, newBlock] } : dialog,
            ),
            lastModified: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        })
      },

      removeBlock: (id) => {
        const { currentProject, activeDialogId, selectedBlockId } = get()
        if (!currentProject || !activeDialogId) return

        set({
          currentProject: {
            ...currentProject,
            dialogs: currentProject.dialogs.map((dialog) =>
              dialog.id === activeDialogId
                ? {
                    ...dialog,
                    blocks: dialog.blocks.filter((block) => block.id !== id),
                  }
                : dialog,
            ),
            lastModified: new Date().toISOString(),
          },
          selectedBlockId: selectedBlockId === id ? null : selectedBlockId,
          hasUnsavedChanges: true,
        })
      },

      updateBlock: (id, updates) => {
        const { currentProject, activeDialogId } = get()
        if (!currentProject || !activeDialogId) return

        set({
          currentProject: {
            ...currentProject,
            dialogs: currentProject.dialogs.map((dialog) =>
              dialog.id === activeDialogId
                ? {
                    ...dialog,
                    blocks: dialog.blocks.map((block) => (block.id === id ? { ...block, ...updates } : block)),
                  }
                : dialog,
            ),
            lastModified: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        })
      },

      moveBlock: (fromIndex, toIndex) => {
        const { currentProject, activeDialogId } = get()
        if (!currentProject || !activeDialogId) return

        const activeDialog = currentProject.dialogs.find((d) => d.id === activeDialogId)
        if (!activeDialog) return

        const newBlocks = [...activeDialog.blocks]
        const [movedBlock] = newBlocks.splice(fromIndex, 1)
        newBlocks.splice(toIndex, 0, movedBlock)

        set({
          currentProject: {
            ...currentProject,
            dialogs: currentProject.dialogs.map((dialog) =>
              dialog.id === activeDialogId ? { ...dialog, blocks: newBlocks } : dialog,
            ),
            lastModified: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        })
      },

      selectBlock: (id) => set({ selectedBlockId: id }),

      clearBlocks: () => {
        const { currentProject, activeDialogId } = get()
        if (!currentProject || !activeDialogId) return

        set({
          currentProject: {
            ...currentProject,
            dialogs: currentProject.dialogs.map((dialog) =>
              dialog.id === activeDialogId ? { ...dialog, blocks: [] } : dialog,
            ),
            lastModified: new Date().toISOString(),
          },
          selectedBlockId: null,
          hasUnsavedChanges: true,
        })
      },

      // Métodos para gestionar pestañas
      addTab: (name) => {
        const { currentProject, activeDialogId } = get()
        if (!currentProject || !activeDialogId) return

        const newTabId = uuidv4()

        set({
          currentProject: {
            ...currentProject,
            dialogs: currentProject.dialogs.map((dialog) =>
              dialog.id === activeDialogId
                ? {
                    ...dialog,
                    tabs: [...dialog.tabs, { id: newTabId, name }],
                  }
                : dialog,
            ),
            lastModified: new Date().toISOString(),
          },
          activeTabId: newTabId,
          hasUnsavedChanges: true,
        })
      },

      removeTab: (id) => {
        const { currentProject, activeDialogId, activeTabId } = get()
        if (!currentProject || !activeDialogId) return

        const activeDialog = currentProject.dialogs.find((d) => d.id === activeDialogId)
        if (!activeDialog) return

        // No permitir eliminar la última pestaña
        if (activeDialog.tabs.length <= 1) return

        // Si se elimina la pestaña activa, activar la primera
        const newActiveTabId =
          activeTabId === id ? activeDialog.tabs.find((tab) => tab.id !== id)?.id || "default" : activeTabId

        set({
          currentProject: {
            ...currentProject,
            dialogs: currentProject.dialogs.map((dialog) =>
              dialog.id === activeDialogId
                ? {
                    ...dialog,
                    tabs: dialog.tabs.filter((tab) => tab.id !== id),
                    blocks: dialog.blocks.filter((block) => block.tabId !== id),
                  }
                : dialog,
            ),
            lastModified: new Date().toISOString(),
          },
          activeTabId: newActiveTabId,
          hasUnsavedChanges: true,
        })
      },

      updateTab: (id, name) => {
        const { currentProject, activeDialogId } = get()
        if (!currentProject || !activeDialogId) return

        set({
          currentProject: {
            ...currentProject,
            dialogs: currentProject.dialogs.map((dialog) =>
              dialog.id === activeDialogId
                ? {
                    ...dialog,
                    tabs: dialog.tabs.map((tab) => (tab.id === id ? { ...tab, name } : tab)),
                  }
                : dialog,
            ),
            lastModified: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        })
      },

      setActiveTab: (id) => set({ activeTabId: id }),

      // Métodos para gestionar bloques personalizados
      addCustomBlock: (block) => {
        const { currentProject } = get()
        if (!currentProject) return

        set({
          currentProject: {
            ...currentProject,
            customBlocks: [...currentProject.customBlocks, { ...block, id: uuidv4() }],
            lastModified: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        })
      },

      removeCustomBlock: (id) => {
        const { currentProject } = get()
        if (!currentProject) return

        set({
          currentProject: {
            ...currentProject,
            customBlocks: currentProject.customBlocks.filter((block) => block.id !== id),
            lastModified: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        })
      },

      // Métodos para gestionar propiedades del diálogo
      setDialogHelpPath: (path) => {
        const { currentProject, activeDialogId } = get()
        if (!currentProject || !activeDialogId) return

        set({
          currentProject: {
            ...currentProject,
            dialogs: currentProject.dialogs.map((dialog) =>
              dialog.id === activeDialogId ? { ...dialog, helpPath: path } : dialog,
            ),
            lastModified: new Date().toISOString(),
          },
          hasUnsavedChanges: true,
        })
      },
    }),
    {
      name: "aem-dialog-designer",
    },
  ),
)

// Funciones auxiliares para compatibilidad con el código existente
export const dialogTitle = () => {
  const activeDialog = useDialogStore.getState().getActiveDialog()
  return activeDialog?.name || "Dialog Title"
}

export const dialogHelpPath = () => {
  const activeDialog = useDialogStore.getState().getActiveDialog()
  return activeDialog?.helpPath || ""
}

export const blocks = () => {
  const activeDialog = useDialogStore.getState().getActiveDialog()
  return activeDialog?.blocks || []
}

export const tabs = () => {
  const activeDialog = useDialogStore.getState().getActiveDialog()
  return activeDialog?.tabs || []
}

export const activeTabId = () => {
  return useDialogStore.getState().activeTabId || "default"
}

export const customBlocks = () => {
  const currentProject = useDialogStore.getState().currentProject
  return currentProject?.customBlocks || []
}
