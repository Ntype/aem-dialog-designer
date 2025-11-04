"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { useDialogStore, type Block } from "@/lib/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  HelpCircle,
  X,
  Info,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Link,
  List,
  ListOrdered,
  Plus,
  Trash,
  Folder,
  Upload,
  Image,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "next-themes"

export function PreviewPanel({ onDownload }: { onDownload?: () => void }) {
  const { getActiveDialog } = useDialogStore()
  const activeDialog = getActiveDialog()
  const blocks = activeDialog?.blocks || []
  const tabs = activeDialog?.tabs || []
  const activeTabId = useDialogStore.getState().activeTabId
  const dialogTitle = activeDialog?.name || "Dialog Title"
  const dialogHelpPath = activeDialog?.helpPath || ""
  const previewRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  const filteredBlocks = blocks ? blocks.filter((block) => block.tabId === activeTabId) : []

  // Exponemos la referencia al elemento para que pueda ser utilizada desde fuera
  if (onDownload) {
    onDownload["previewRef"] = previewRef
  }

  const handleHelpClick = (e: React.MouseEvent) => {
    if (dialogHelpPath) {
      // En un entorno real, esto abriría el enlace
      // Aquí solo mostramos un mensaje para simular la funcionalidad
      e.preventDefault()
      window.alert(`Abriendo enlace de ayuda: ${dialogHelpPath}`)
    }
  }

  return (
    <div className="relative">
      <div ref={previewRef} className={`aem-dialog ${theme === "dark" ? "dark" : ""}`}>
        <Card className="border-0 shadow-none">
          <div className="aem-dialog-header">
            <h2 className="aem-dialog-title">{dialogTitle}</h2>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {dialogHelpPath ? (
                      <a
                        href={dialogHelpPath}
                        className="aem-icon p-1 hover:bg-secondary rounded inline-flex"
                        onClick={handleHelpClick}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </a>
                    ) : (
                      <button className="aem-icon p-1 hover:bg-secondary rounded">
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {dialogHelpPath ? "Haz clic para abrir la ayuda" : "No hay enlace de ayuda configurado"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <button className="aem-icon p-1 hover:bg-secondary rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="aem-tabs">
            {tabs &&
              tabs.map((tab) => (
                <div key={tab.id} className={`aem-tab ${activeTabId === tab.id ? "aem-tab-active" : ""}`}>
                  {tab.name}
                </div>
              ))}
          </div>

          <ScrollArea className="h-[calc(100vh-13rem)]">
            <div className="p-6 space-y-6">
              {filteredBlocks.length === 0 ? (
                <div className="text-center text-muted-foreground">No hay componentes para previsualizar</div>
              ) : (
                filteredBlocks.map((block) => <PreviewBlock key={block.id} block={block} />)
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}

function PreviewBlock({ block }: { block: Block }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [editorState, setEditorState] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: "left",
    format: "p",
  })
  const [multifieldItems, setMultifieldItems] = useState([{ id: "item-1" }])
  const editorRef = useRef<HTMLDivElement>(null)

  const renderFieldHelp = (description?: string) => {
    if (!description) return null

    return (
      <TooltipProvider>
        <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
          <TooltipTrigger asChild>
            <button
              className="absolute right-0 top-0"
              onClick={(e) => {
                e.preventDefault()
                setShowTooltip(!showTooltip)
              }}
            >
              <Info className="h-4 w-4 text-[#707070] dark:text-[#a0a0a0]" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs p-2 max-w-xs">
            {description}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const addMultifieldItem = () => {
    setMultifieldItems([...multifieldItems, { id: `item-${multifieldItems.length + 1}` }])
  }

  const removeMultifieldItem = (index: number) => {
    const newItems = [...multifieldItems]
    newItems.splice(index, 1)
    setMultifieldItems(newItems)
  }

  // Función para aplicar formato al texto seleccionado
  const applyFormat = (format: string) => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    document.execCommand(format, false)

    // Actualizar estado según el formato aplicado
    if (format === "bold") setEditorState((prev) => ({ ...prev, bold: !prev.bold }))
    if (format === "italic") setEditorState((prev) => ({ ...prev, italic: !prev.italic }))
    if (format === "underline") setEditorState((prev) => ({ ...prev, underline: !prev.underline }))
  }

  // Función para aplicar alineación
  const applyAlignment = (alignment: string) => {
    if (!editorRef.current) return

    document.execCommand(`justify${alignment}`, false)
    setEditorState((prev) => ({ ...prev, align: alignment }))
  }

  // Función para aplicar formato de párrafo
  const applyParagraphFormat = (format: string) => {
    if (!editorRef.current) return

    if (format === "p") {
      document.execCommand("formatBlock", false, "p")
    } else if (format.startsWith("h")) {
      document.execCommand("formatBlock", false, format)
    }

    setEditorState((prev) => ({ ...prev, format }))
  }

  // Función para insertar lista
  const insertList = (type: "bullet" | "numbered") => {
    if (!editorRef.current) return

    if (type === "bullet") {
      document.execCommand("insertUnorderedList", false)
    } else {
      document.execCommand("insertOrderedList", false)
    }
  }

  // Función para manejar enlaces
  const handleLink = (action: "create" | "remove") => {
    if (!editorRef.current) return

    if (action === "create") {
      const url = prompt("Ingrese la URL del enlace:", "https://")
      if (url) {
        document.execCommand("createLink", false, url)
      }
    } else {
      document.execCommand("unlink", false)
    }
  }

  // Efecto para inicializar el editor
  useEffect(() => {
    if (editorRef.current) {
      // Inicializar con contenido de ejemplo
      if (!editorRef.current.innerHTML || editorRef.current.innerHTML === "") {
        editorRef.current.innerHTML = "<p>Haga clic aquí para editar el contenido...</p>"
      }
    }
  }, [])

  // Función para actualizar el estado de los botones según la selección actual
  const updateButtonStates = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    try {
      setEditorState((prev) => ({
        ...prev,
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      }))
    } catch (e) {
      // Ignorar errores de comandos no soportados
    }
  }

  switch (block.type) {
    case "textfield":
      return (
        <div className="space-y-2">
          <div className="relative pr-6">
            <label className="aem-field-label">{block.properties.fieldLabel}</label>
            {renderFieldHelp(block.properties.fieldDescription)}
          </div>
          <input
            type="text"
            className="aem-field"
            placeholder="Ingrese un valor"
            defaultValue={block.properties.defaultValue}
          />
        </div>
      )

    case "textarea":
      return (
        <div className="space-y-2">
          <div className="relative pr-6">
            <label className="aem-field-label">{block.properties.fieldLabel}</label>
            {renderFieldHelp(block.properties.fieldDescription)}
          </div>
          <textarea className="aem-field" placeholder="Ingrese un texto" rows={block.properties.rows} />
        </div>
      )

    case "select":
      return (
        <div className="space-y-2">
          <div className="relative pr-6">
            <label className="aem-field-label">{block.properties.fieldLabel}</label>
            {renderFieldHelp(block.properties.fieldDescription)}
          </div>
          <select className="aem-field">
            <option value="">Seleccione una opción</option>
            {block.properties.options.map((option: any, index: number) => (
              <option key={index} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      )

    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <input type="checkbox" className="aem-checkbox" defaultChecked={block.properties.checked} />
          <div className="relative pr-6 flex-1">
            <label className="aem-field-label">{block.properties.text}</label>
            {renderFieldHelp(block.properties.fieldDescription)}
          </div>
        </div>
      )

    case "pathfield":
      return (
        <div className="space-y-2">
          <div className="relative pr-6">
            <label className="aem-field-label">{block.properties.fieldLabel}</label>
            {renderFieldHelp(block.properties.fieldDescription)}
          </div>
          <div className="flex">
            <input type="text" className="aem-field flex-1 rounded-r-none" placeholder="Seleccione una ruta" />
            <button className="bg-gray-100 dark:bg-gray-800 border border-l-0 border-[var(--aem-field-border)] px-3 rounded-r-md">
              <Folder className="h-4 w-4 text-[#707070] dark:text-[#a0a0a0]" />
            </button>
          </div>
          <p className="text-xs text-[#707070] dark:text-[#a0a0a0]">Ruta raíz: {block.properties.rootPath}</p>
        </div>
      )

    case "fileupload":
      return (
        <div className="space-y-2">
          <div className="relative pr-6">
            <label className="aem-field-label">{block.properties.fieldLabel}</label>
            {renderFieldHelp(block.properties.fieldDescription)}
          </div>
          <div className="border-2 border-dashed rounded-md p-6 bg-gray-50 dark:bg-gray-800/30 flex flex-col items-center justify-center">
            <div className="mb-4 bg-gray-100 dark:bg-gray-800 rounded-full p-3">
              <Image className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-sm text-center mb-2">Arrastre una imagen aquí o haga clic para seleccionar</p>
            <p className="text-xs text-[#707070] dark:text-[#a0a0a0] text-center">
              Formatos permitidos: {block.properties.mimeTypes.map((type: string) => type.split("/")[1]).join(", ")}
            </p>
            <p className="text-xs text-[#707070] dark:text-[#a0a0a0] text-center">
              Tamaño máximo: {block.properties.sizeLimit} MB
            </p>
            <button className="mt-4 px-3 py-1 border rounded-md bg-white dark:bg-gray-800 text-sm flex items-center">
              <Upload className="h-4 w-4 mr-2 text-[#707070] dark:text-[#a0a0a0]" />
              Seleccionar archivo
            </button>
          </div>
        </div>
      )

    case "richtext":
      return (
        <div className="space-y-2">
          <div className="relative pr-6">
            <label className="aem-field-label">{block.properties.fieldLabel}</label>
            {renderFieldHelp(block.properties.fieldDescription)}
          </div>
          <div className="border rounded-md overflow-hidden">
            {block.properties.useFixedInlineToolbar && (
              <div className="bg-gray-100 dark:bg-gray-800 border-b p-2 flex flex-wrap gap-1 items-center">
                {/* Formato de texto */}
                {block.properties.rtePlugins.format.features.includes("bold") && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editorState.bold ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() => applyFormat("bold")}
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                )}
                {block.properties.rtePlugins.format.features.includes("italic") && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editorState.italic ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() => applyFormat("italic")}
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                )}
                {block.properties.rtePlugins.format.features.includes("underline") && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editorState.underline ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() => applyFormat("underline")}
                  >
                    <Underline className="h-4 w-4" />
                  </button>
                )}

                {/* Separador */}
                {block.properties.rtePlugins.justify.features.length > 0 && (
                  <div className="h-6 mx-1 w-px bg-gray-300 dark:bg-gray-600"></div>
                )}

                {/* Alineación */}
                {block.properties.rtePlugins.justify.features.includes("justifyleft") && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editorState.align === "left" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() => applyAlignment("left")}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </button>
                )}
                {block.properties.rtePlugins.justify.features.includes("justifycenter") && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editorState.align === "center" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() => applyAlignment("center")}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </button>
                )}
                {block.properties.rtePlugins.justify.features.includes("justifyright") && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editorState.align === "right" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                    onClick={() => applyAlignment("right")}
                  >
                    <AlignRight className="h-4 w-4" />
                  </button>
                )}

                {/* Separador */}
                {block.properties.rtePlugins.links.features.length > 0 && (
                  <div className="h-6 mx-1 w-px bg-gray-300 dark:bg-gray-600"></div>
                )}

                {/* Enlaces */}
                {block.properties.rtePlugins.links.features.includes("modifylink") && (
                  <button
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => handleLink("create")}
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                )}
                {block.properties.rtePlugins.links.features.includes("unlink") && (
                  <button
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => handleLink("remove")}
                  >
                    <Link className="h-4 w-4" />
                  </button>
                )}

                {/* Separador */}
                {block.properties.rtePlugins.lists.features.length > 0 && (
                  <div className="h-6 mx-1 w-px bg-gray-300 dark:bg-gray-600"></div>
                )}

                {/* Listas */}
                {block.properties.rtePlugins.lists.features.includes("bullet") && (
                  <button
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => insertList("bullet")}
                  >
                    <List className="h-4 w-4" />
                  </button>
                )}
                {block.properties.rtePlugins.lists.features.includes("numbered") && (
                  <button
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => insertList("numbered")}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </button>
                )}

                {/* Separador */}
                {block.properties.rtePlugins.paraformat.features.length > 0 && (
                  <div className="h-6 mx-1 w-px bg-gray-300 dark:bg-gray-600"></div>
                )}

                {/* Formato de párrafo */}
                {block.properties.rtePlugins.paraformat.features.length > 0 && (
                  <select
                    className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 bg-transparent dark:bg-transparent border border-gray-300 dark:border-gray-600 text-sm"
                    value={editorState.format}
                    onChange={(e) => applyParagraphFormat(e.target.value)}
                  >
                    {block.properties.rtePlugins.paraformat.features.includes("default") && (
                      <option value="p">Párrafo</option>
                    )}
                    {block.properties.rtePlugins.paraformat.features.includes("h1") && (
                      <option value="h1">Encabezado 1</option>
                    )}
                    {block.properties.rtePlugins.paraformat.features.includes("h2") && (
                      <option value="h2">Encabezado 2</option>
                    )}
                    {block.properties.rtePlugins.paraformat.features.includes("h3") && (
                      <option value="h3">Encabezado 3</option>
                    )}
                  </select>
                )}
              </div>
            )}
            <div
              ref={editorRef}
              className="min-h-[150px] p-3 bg-white dark:bg-gray-900"
              contentEditable={true}
              onKeyUp={updateButtonStates}
              onMouseUp={updateButtonStates}
            />
          </div>
        </div>
      )

    case "multifield":
      return (
        <div className="space-y-2">
          <div className="relative pr-6">
            <label className="aem-field-label">{block.properties.fieldLabel}</label>
            {renderFieldHelp(block.properties.fieldDescription)}
          </div>
          <div className="border rounded-md p-3">
            {multifieldItems.map((item, index) => (
              <div key={item.id} className="border rounded-md p-3 mb-3 bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Elemento {index + 1}</h4>
                  <button
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
                    onClick={() => removeMultifieldItem(index)}
                  >
                    <Trash className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {block.properties.nestedComponents &&
                  block.properties.nestedComponents.map((comp: any, compIndex: number) => (
                    <div key={compIndex} className="mb-3">
                      {comp.type === "textfield" && (
                        <div className="space-y-1">
                          <label className="text-xs font-medium">{comp.fieldLabel}</label>
                          <input type="text" className="aem-field text-sm h-8" placeholder="Ingrese un valor" />
                        </div>
                      )}

                      {comp.type === "pathfield" && (
                        <div className="space-y-1">
                          <label className="text-xs font-medium">{comp.fieldLabel}</label>
                          <div className="flex">
                            <input
                              type="text"
                              className="aem-field text-sm h-8 flex-1 rounded-r-none"
                              placeholder="Seleccione una ruta"
                            />
                            <button className="bg-gray-100 dark:bg-gray-800 border border-l-0 border-[var(--aem-field-border)] px-2 rounded-r-md h-8">
                              <Folder className="h-3 w-3 text-[#707070] dark:text-[#a0a0a0]" />
                            </button>
                          </div>
                        </div>
                      )}

                      {comp.type === "textarea" && (
                        <div className="space-y-1">
                          <label className="text-xs font-medium">{comp.fieldLabel}</label>
                          <textarea className="aem-field text-sm" rows={2} placeholder="Ingrese un texto"></textarea>
                        </div>
                      )}

                      {comp.type === "select" && (
                        <div className="space-y-1">
                          <label className="text-xs font-medium">{comp.fieldLabel}</label>
                          <select className="aem-field text-sm h-8">
                            <option value="">Seleccione una opción</option>
                            <option value="option1">Opción 1</option>
                            <option value="option2">Opción 2</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ))}
            <button
              className="mt-2 p-2 w-full border border-dashed rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center"
              onClick={addMultifieldItem}
            >
              <Plus className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Añadir elemento</span>
            </button>
          </div>
        </div>
      )

    default:
      return null
  }
}
