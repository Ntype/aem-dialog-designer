"use client"

import { useState } from "react"
import { useDialogStore, tabs, activeTabId } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit2, X } from "lucide-react"

export function TabManager() {
  const { getActiveDialog, addTab, removeTab, updateTab, setActiveTab } = useDialogStore()
  const [open, setOpen] = useState(false)
  const [newTabName, setNewTabName] = useState("")
  const [editingTabId, setEditingTabId] = useState<string | null>(null)

  // Obtener el diálogo activo y sus datos
  const activeDialog = getActiveDialog()
  const allTabs = tabs() || []
  const currentActiveTabId = activeTabId()

  const handleAddTab = () => {
    if (newTabName.trim() && activeDialog) {
      addTab(newTabName.trim())
      setNewTabName("")
      setOpen(false)
    }
  }

  const handleUpdateTab = () => {
    if (editingTabId && newTabName.trim() && activeDialog) {
      updateTab(editingTabId, newTabName.trim())
      setEditingTabId(null)
      setNewTabName("")
      setOpen(false)
    }
  }

  const openEditDialog = (tabId: string, name: string) => {
    setEditingTabId(tabId)
    setNewTabName(name)
    setOpen(true)
  }

  // Si no hay diálogo activo, no mostrar nada
  if (!activeDialog) {
    return null
  }

  return (
    <div className="flex items-center">
      <div className="flex overflow-x-auto">
        {allTabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center px-4 py-2 border-r dark:border-[#333333] cursor-pointer ${
              currentActiveTabId === tab.id
                ? "bg-white dark:bg-gray-900 border-b-2 border-b-blue-600 dark:border-b-blue-400"
                : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="text-sm">{tab.name}</span>
            {allTabs.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-2"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTab(tab.id)
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Eliminar pestaña</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-1"
              onClick={(e) => {
                e.stopPropagation()
                openEditDialog(tab.id, tab.name)
              }}
            >
              <Edit2 className="h-3 w-3" />
              <span className="sr-only">Editar pestaña</span>
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 ml-1">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Añadir pestaña</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTabId ? "Editar pestaña" : "Añadir nueva pestaña"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="tab-name" className="text-right">
                Nombre
              </label>
              <Input
                id="tab-name"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={editingTabId ? handleUpdateTab : handleAddTab}>
              {editingTabId ? "Actualizar" : "Añadir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
