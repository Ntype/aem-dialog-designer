"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useDialogStore, type Block, blocks } from "@/lib/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash } from "lucide-react"

export function PropertiesPanel() {
  const { selectedBlockId, updateBlock } = useDialogStore()
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [activeTab, setActiveTab] = useState("general")
  const [activeRteTab, setActiveRteTab] = useState("format")

  // Obtener todos los bloques
  const allBlocks = blocks() || []

  useEffect(() => {
    if (selectedBlockId) {
      const block = allBlocks.find((b) => b.id === selectedBlockId) || null
      setSelectedBlock(block)
    } else {
      setSelectedBlock(null)
    }
  }, [selectedBlockId, allBlocks])

  const handlePropertyChange = (key: string, value: any) => {
    if (selectedBlock) {
      updateBlock(selectedBlock.id, {
        properties: {
          ...selectedBlock.properties,
          [key]: value,
        },
      })
    }
  }

  const handleNestedPropertyChange = (parentKey: string, key: string, value: any) => {
    if (selectedBlock) {
      const parentValue = { ...selectedBlock.properties[parentKey] }
      parentValue[key] = value

      updateBlock(selectedBlock.id, {
        properties: {
          ...selectedBlock.properties,
          [parentKey]: parentValue,
        },
      })
    }
  }

  const handleArrayPropertyChange = (parentKey: string, childKey: string, index: number, value: any) => {
    if (selectedBlock) {
      const parentValue = { ...selectedBlock.properties[parentKey] }
      const childValue = { ...parentValue[childKey] }
      const features = [...childValue.features]
      features[index] = value

      childValue.features = features
      parentValue[childKey] = childValue

      updateBlock(selectedBlock.id, {
        properties: {
          ...selectedBlock.properties,
          [parentKey]: parentValue,
        },
      })
    }
  }

  const handleNameChange = (name: string) => {
    if (selectedBlock) {
      updateBlock(selectedBlock.id, { name })
    }
  }

  const handleNestedComponentChange = (index: number, field: string, value: any) => {
    if (selectedBlock && selectedBlock.properties.nestedComponents) {
      const nestedComponents = [...selectedBlock.properties.nestedComponents]
      nestedComponents[index] = {
        ...nestedComponents[index],
        [field]: value,
      }

      handlePropertyChange("nestedComponents", nestedComponents)
    }
  }

  const addNestedComponent = () => {
    if (selectedBlock) {
      const nestedComponents = selectedBlock.properties.nestedComponents || []
      handlePropertyChange("nestedComponents", [
        ...nestedComponents,
        {
          type: "textfield",
          name: `field${nestedComponents.length + 1}`,
          fieldLabel: `Campo ${nestedComponents.length + 1}`,
          required: false,
        },
      ])
    }
  }

  const removeNestedComponent = (index: number) => {
    if (selectedBlock && selectedBlock.properties.nestedComponents) {
      const nestedComponents = [...selectedBlock.properties.nestedComponents]
      nestedComponents.splice(index, 1)
      handlePropertyChange("nestedComponents", nestedComponents)
    }
  }

  const handleMimeTypeChange = (index: number, value: string) => {
    if (selectedBlock && selectedBlock.properties.mimeTypes) {
      const mimeTypes = [...selectedBlock.properties.mimeTypes]
      mimeTypes[index] = value
      handlePropertyChange("mimeTypes", mimeTypes)
    }
  }

  const addMimeType = () => {
    if (selectedBlock) {
      const mimeTypes = selectedBlock.properties.mimeTypes || []
      handlePropertyChange("mimeTypes", [...mimeTypes, "image/jpeg"])
    }
  }

  const removeMimeType = (index: number) => {
    if (selectedBlock && selectedBlock.properties.mimeTypes) {
      const mimeTypes = [...selectedBlock.properties.mimeTypes]
      mimeTypes.splice(index, 1)
      handlePropertyChange("mimeTypes", mimeTypes)
    }
  }

  if (!selectedBlock) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Propiedades</CardTitle>
          <CardDescription>Selecciona un componente para editar sus propiedades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[calc(100vh-15rem)] text-center p-8">
            <p className="text-muted-foreground">No hay ningún componente seleccionado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Propiedades</CardTitle>
        <CardDescription>Edita las propiedades del componente seleccionado</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-13rem)] pr-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="component-name">Nombre del componente</Label>
              <Input
                id="component-name"
                value={selectedBlock.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-3">Propiedades específicas</h3>

              {selectedBlock.type === "textfield" && (
                <>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-label">Etiqueta del campo</Label>
                    <Input
                      id="field-label"
                      value={selectedBlock.properties.fieldLabel}
                      onChange={(e) => handlePropertyChange("fieldLabel", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-description">Descripción del campo</Label>
                    <Textarea
                      id="field-description"
                      value={selectedBlock.properties.fieldDescription || ""}
                      onChange={(e) => handlePropertyChange("fieldDescription", e.target.value)}
                      placeholder="Texto de ayuda que aparecerá al pasar el cursor sobre el icono de información"
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="default-value">Valor por defecto</Label>
                    <Input
                      id="default-value"
                      value={selectedBlock.properties.defaultValue}
                      onChange={(e) => handlePropertyChange("defaultValue", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="required"
                      checked={selectedBlock.properties.required}
                      onCheckedChange={(checked) => handlePropertyChange("required", checked)}
                    />
                    <Label htmlFor="required">Requerido</Label>
                  </div>
                </>
              )}

              {selectedBlock.type === "textarea" && (
                <>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-label">Etiqueta del campo</Label>
                    <Input
                      id="field-label"
                      value={selectedBlock.properties.fieldLabel}
                      onChange={(e) => handlePropertyChange("fieldLabel", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-description">Descripción del campo</Label>
                    <Textarea
                      id="field-description"
                      value={selectedBlock.properties.fieldDescription || ""}
                      onChange={(e) => handlePropertyChange("fieldDescription", e.target.value)}
                      placeholder="Texto de ayuda que aparecerá al pasar el cursor sobre el icono de información"
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="rows">Filas</Label>
                    <Input
                      id="rows"
                      type="number"
                      value={selectedBlock.properties.rows}
                      onChange={(e) => handlePropertyChange("rows", Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="required"
                      checked={selectedBlock.properties.required}
                      onCheckedChange={(checked) => handlePropertyChange("required", checked)}
                    />
                    <Label htmlFor="required">Requerido</Label>
                  </div>
                </>
              )}

              {selectedBlock.type === "select" && (
                <>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-label">Etiqueta del campo</Label>
                    <Input
                      id="field-label"
                      value={selectedBlock.properties.fieldLabel}
                      onChange={(e) => handlePropertyChange("fieldLabel", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-description">Descripción del campo</Label>
                    <Textarea
                      id="field-description"
                      value={selectedBlock.properties.fieldDescription || ""}
                      onChange={(e) => handlePropertyChange("fieldDescription", e.target.value)}
                      placeholder="Texto de ayuda que aparecerá al pasar el cursor sobre el icono de información"
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label>Opciones</Label>
                    {selectedBlock.properties.options.map((option: any, index: number) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          placeholder="Texto"
                          value={option.text}
                          onChange={(e) => {
                            const newOptions = [...selectedBlock.properties.options]
                            newOptions[index].text = e.target.value
                            handlePropertyChange("options", newOptions)
                          }}
                        />
                        <Input
                          placeholder="Valor"
                          value={option.value}
                          onChange={(e) => {
                            const newOptions = [...selectedBlock.properties.options]
                            newOptions[index].value = e.target.value
                            handlePropertyChange("options", newOptions)
                          }}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newOptions = [...selectedBlock.properties.options]
                            newOptions.splice(index, 1)
                            handlePropertyChange("options", newOptions)
                          }}
                        >
                          <span className="sr-only">Eliminar</span>×
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = [...selectedBlock.properties.options, { text: "", value: "" }]
                        handlePropertyChange("options", newOptions)
                      }}
                    >
                      Añadir opción
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="required"
                      checked={selectedBlock.properties.required}
                      onCheckedChange={(checked) => handlePropertyChange("required", checked)}
                    />
                    <Label htmlFor="required">Requerido</Label>
                  </div>
                </>
              )}

              {selectedBlock.type === "checkbox" && (
                <>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="text">Texto</Label>
                    <Input
                      id="text"
                      value={selectedBlock.properties.text}
                      onChange={(e) => handlePropertyChange("text", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-description">Descripción del campo</Label>
                    <Textarea
                      id="field-description"
                      value={selectedBlock.properties.fieldDescription || ""}
                      onChange={(e) => handlePropertyChange("fieldDescription", e.target.value)}
                      placeholder="Texto de ayuda que aparecerá al pasar el cursor sobre el icono de información"
                    />
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="checked"
                      checked={selectedBlock.properties.checked}
                      onCheckedChange={(checked) => handlePropertyChange("checked", checked)}
                    />
                    <Label htmlFor="checked">Marcado por defecto</Label>
                  </div>
                </>
              )}

              {selectedBlock.type === "pathfield" && (
                <>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-label">Etiqueta del campo</Label>
                    <Input
                      id="field-label"
                      value={selectedBlock.properties.fieldLabel}
                      onChange={(e) => handlePropertyChange("fieldLabel", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-description">Descripción del campo</Label>
                    <Textarea
                      id="field-description"
                      value={selectedBlock.properties.fieldDescription || ""}
                      onChange={(e) => handlePropertyChange("fieldDescription", e.target.value)}
                      placeholder="Texto de ayuda que aparecerá al pasar el cursor sobre el icono de información"
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="root-path">Ruta raíz</Label>
                    <Input
                      id="root-path"
                      value={selectedBlock.properties.rootPath}
                      onChange={(e) => handlePropertyChange("rootPath", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="required"
                      checked={selectedBlock.properties.required}
                      onCheckedChange={(checked) => handlePropertyChange("required", checked)}
                    />
                    <Label htmlFor="required">Requerido</Label>
                  </div>
                </>
              )}

              {selectedBlock.type === "fileupload" && (
                <>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-label">Etiqueta del campo</Label>
                    <Input
                      id="field-label"
                      value={selectedBlock.properties.fieldLabel}
                      onChange={(e) => handlePropertyChange("fieldLabel", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-description">Descripción del campo</Label>
                    <Textarea
                      id="field-description"
                      value={selectedBlock.properties.fieldDescription || ""}
                      onChange={(e) => handlePropertyChange("fieldDescription", e.target.value)}
                      placeholder="Texto de ayuda que aparecerá al pasar el cursor sobre el icono de información"
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="upload-url">URL de carga</Label>
                    <Input
                      id="upload-url"
                      value={selectedBlock.properties.uploadUrl}
                      onChange={(e) => handlePropertyChange("uploadUrl", e.target.value)}
                      placeholder="/content/dam"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Ruta en el DAM donde se subirán los archivos</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="size-limit">Límite de tamaño (MB)</Label>
                    <Input
                      id="size-limit"
                      type="number"
                      value={selectedBlock.properties.sizeLimit}
                      onChange={(e) => handlePropertyChange("sizeLimit", Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label>Tipos MIME permitidos</Label>
                    {selectedBlock.properties.mimeTypes.map((type: string, index: number) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          placeholder="Tipo MIME"
                          value={type}
                          onChange={(e) => handleMimeTypeChange(index, e.target.value)}
                        />
                        <Button variant="outline" size="icon" onClick={() => removeMimeType(index)}>
                          <span className="sr-only">Eliminar</span>×
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addMimeType}>
                      Añadir tipo MIME
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Ej: image/jpeg, image/png, application/pdf</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="file-name-parameter">Parámetro de nombre de archivo</Label>
                    <Input
                      id="file-name-parameter"
                      value={selectedBlock.properties.fileNameParameter}
                      onChange={(e) => handlePropertyChange("fileNameParameter", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="file-reference-parameter">Parámetro de referencia de archivo</Label>
                    <Input
                      id="file-reference-parameter"
                      value={selectedBlock.properties.fileReferenceParameter}
                      onChange={(e) => handlePropertyChange("fileReferenceParameter", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="required"
                      checked={selectedBlock.properties.required}
                      onCheckedChange={(checked) => handlePropertyChange("required", checked)}
                    />
                    <Label htmlFor="required">Requerido</Label>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="allow-upload"
                      checked={selectedBlock.properties.allowUpload}
                      onCheckedChange={(checked) => handlePropertyChange("allowUpload", checked)}
                    />
                    <Label htmlFor="allow-upload">Permitir carga</Label>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="auto-start"
                      checked={selectedBlock.properties.autoStart}
                      onCheckedChange={(checked) => handlePropertyChange("autoStart", checked)}
                    />
                    <Label htmlFor="auto-start">Iniciar carga automáticamente</Label>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="use-html5"
                      checked={selectedBlock.properties.useHTML5}
                      onCheckedChange={(checked) => handlePropertyChange("useHTML5", checked)}
                    />
                    <Label htmlFor="use-html5">Usar HTML5</Label>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="upload-pretty-name"
                      checked={selectedBlock.properties.uploadPrettyName}
                      onCheckedChange={(checked) => handlePropertyChange("uploadPrettyName", checked)}
                    />
                    <Label htmlFor="upload-pretty-name">Usar nombre bonito</Label>
                  </div>
                </>
              )}

              {selectedBlock.type === "richtext" && (
                <>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-label">Etiqueta del campo</Label>
                    <Input
                      id="field-label"
                      value={selectedBlock.properties.fieldLabel}
                      onChange={(e) => handlePropertyChange("fieldLabel", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-description">Descripción del campo</Label>
                    <Textarea
                      id="field-description"
                      value={selectedBlock.properties.fieldDescription || ""}
                      onChange={(e) => handlePropertyChange("fieldDescription", e.target.value)}
                      placeholder="Texto de ayuda que aparecerá al pasar el cursor sobre el icono de información"
                    />
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="required"
                      checked={selectedBlock.properties.required}
                      onCheckedChange={(checked) => handlePropertyChange("required", checked)}
                    />
                    <Label htmlFor="required">Requerido</Label>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="useFixedInlineToolbar"
                      checked={selectedBlock.properties.useFixedInlineToolbar}
                      onCheckedChange={(checked) => handlePropertyChange("useFixedInlineToolbar", checked)}
                    />
                    <Label htmlFor="useFixedInlineToolbar">Usar barra de herramientas fija</Label>
                  </div>

                  <div className="pt-2 mb-4">
                    <Label className="mb-2 block">Plugins RTE</Label>

                    <div className="mb-2">
                      <Select value={activeRteTab} onValueChange={setActiveRteTab}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar plugin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="format">Formato</SelectItem>
                          <SelectItem value="justify">Alineación</SelectItem>
                          <SelectItem value="links">Enlaces</SelectItem>
                          <SelectItem value="lists">Listas</SelectItem>
                          <SelectItem value="paraformat">Párrafos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border rounded-md p-4">
                      {activeRteTab === "format" && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium mb-2">Formato de texto</h4>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="format-bold"
                              checked={selectedBlock.properties.rtePlugins.format.features.includes("bold")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.format.features]
                                if (checked) {
                                  if (!features.includes("bold")) features.push("bold")
                                } else {
                                  const index = features.indexOf("bold")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "format", { features })
                              }}
                            />
                            <Label htmlFor="format-bold">Negrita</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="format-italic"
                              checked={selectedBlock.properties.rtePlugins.format.features.includes("italic")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.format.features]
                                if (checked) {
                                  if (!features.includes("italic")) features.push("italic")
                                } else {
                                  const index = features.indexOf("italic")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "format", { features })
                              }}
                            />
                            <Label htmlFor="format-italic">Cursiva</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="format-underline"
                              checked={selectedBlock.properties.rtePlugins.format.features.includes("underline")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.format.features]
                                if (checked) {
                                  if (!features.includes("underline")) features.push("underline")
                                } else {
                                  const index = features.indexOf("underline")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "format", { features })
                              }}
                            />
                            <Label htmlFor="format-underline">Subrayado</Label>
                          </div>
                        </div>
                      )}

                      {activeRteTab === "justify" && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium mb-2">Alineación de texto</h4>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="justify-left"
                              checked={selectedBlock.properties.rtePlugins.justify.features.includes("justifyleft")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.justify.features]
                                if (checked) {
                                  if (!features.includes("justifyleft")) features.push("justifyleft")
                                } else {
                                  const index = features.indexOf("justifyleft")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "justify", { features })
                              }}
                            />
                            <Label htmlFor="justify-left">Alinear izquierda</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="justify-center"
                              checked={selectedBlock.properties.rtePlugins.justify.features.includes("justifycenter")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.justify.features]
                                if (checked) {
                                  if (!features.includes("justifycenter")) features.push("justifycenter")
                                } else {
                                  const index = features.indexOf("justifycenter")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "justify", { features })
                              }}
                            />
                            <Label htmlFor="justify-center">Centrar</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="justify-right"
                              checked={selectedBlock.properties.rtePlugins.justify.features.includes("justifyright")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.justify.features]
                                if (checked) {
                                  if (!features.includes("justifyright")) features.push("justifyright")
                                } else {
                                  const index = features.indexOf("justifyright")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "justify", { features })
                              }}
                            />
                            <Label htmlFor="justify-right">Alinear derecha</Label>
                          </div>
                        </div>
                      )}

                      {activeRteTab === "links" && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium mb-2">Enlaces</h4>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="links-modify"
                              checked={selectedBlock.properties.rtePlugins.links.features.includes("modifylink")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.links.features]
                                if (checked) {
                                  if (!features.includes("modifylink")) features.push("modifylink")
                                } else {
                                  const index = features.indexOf("modifylink")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "links", { features })
                              }}
                            />
                            <Label htmlFor="links-modify">Modificar enlace</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="links-unlink"
                              checked={selectedBlock.properties.rtePlugins.links.features.includes("unlink")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.links.features]
                                if (checked) {
                                  if (!features.includes("unlink")) features.push("unlink")
                                } else {
                                  const index = features.indexOf("unlink")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "links", { features })
                              }}
                            />
                            <Label htmlFor="links-unlink">Quitar enlace</Label>
                          </div>
                        </div>
                      )}

                      {activeRteTab === "lists" && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium mb-2">Listas</h4>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="lists-bullet"
                              checked={selectedBlock.properties.rtePlugins.lists.features.includes("bullet")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.lists.features]
                                if (checked) {
                                  if (!features.includes("bullet")) features.push("bullet")
                                } else {
                                  const index = features.indexOf("bullet")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "lists", { features })
                              }}
                            />
                            <Label htmlFor="lists-bullet">Lista con viñetas</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="lists-numbered"
                              checked={selectedBlock.properties.rtePlugins.lists.features.includes("numbered")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.lists.features]
                                if (checked) {
                                  if (!features.includes("numbered")) features.push("numbered")
                                } else {
                                  const index = features.indexOf("numbered")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "lists", { features })
                              }}
                            />
                            <Label htmlFor="lists-numbered">Lista numerada</Label>
                          </div>
                        </div>
                      )}

                      {activeRteTab === "paraformat" && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium mb-2">Formato de párrafos</h4>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="paraformat-default"
                              checked={selectedBlock.properties.rtePlugins.paraformat.features.includes("default")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.paraformat.features]
                                if (checked) {
                                  if (!features.includes("default")) features.push("default")
                                } else {
                                  const index = features.indexOf("default")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "paraformat", { features })
                              }}
                            />
                            <Label htmlFor="paraformat-default">Párrafo</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="paraformat-h1"
                              checked={selectedBlock.properties.rtePlugins.paraformat.features.includes("h1")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.paraformat.features]
                                if (checked) {
                                  if (!features.includes("h1")) features.push("h1")
                                } else {
                                  const index = features.indexOf("h1")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "paraformat", { features })
                              }}
                            />
                            <Label htmlFor="paraformat-h1">Encabezado 1</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="paraformat-h2"
                              checked={selectedBlock.properties.rtePlugins.paraformat.features.includes("h2")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.paraformat.features]
                                if (checked) {
                                  if (!features.includes("h2")) features.push("h2")
                                } else {
                                  const index = features.indexOf("h2")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "paraformat", { features })
                              }}
                            />
                            <Label htmlFor="paraformat-h2">Encabezado 2</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="paraformat-h3"
                              checked={selectedBlock.properties.rtePlugins.paraformat.features.includes("h3")}
                              onCheckedChange={(checked) => {
                                const features = [...selectedBlock.properties.rtePlugins.paraformat.features]
                                if (checked) {
                                  if (!features.includes("h3")) features.push("h3")
                                } else {
                                  const index = features.indexOf("h3")
                                  if (index !== -1) features.splice(index, 1)
                                }
                                handleNestedPropertyChange("rtePlugins", "paraformat", { features })
                              }}
                            />
                            <Label htmlFor="paraformat-h3">Encabezado 3</Label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {selectedBlock.type === "multifield" && (
                <>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-label">Etiqueta del campo</Label>
                    <Input
                      id="field-label"
                      value={selectedBlock.properties.fieldLabel}
                      onChange={(e) => handlePropertyChange("fieldLabel", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label htmlFor="field-description">Descripción del campo</Label>
                    <Textarea
                      id="field-description"
                      value={selectedBlock.properties.fieldDescription || ""}
                      onChange={(e) => handlePropertyChange("fieldDescription", e.target.value)}
                      placeholder="Texto de ayuda que aparecerá al pasar el cursor sobre el icono de información"
                    />
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="required"
                      checked={selectedBlock.properties.required}
                      onCheckedChange={(checked) => handlePropertyChange("required", checked)}
                    />
                    <Label htmlFor="required">Requerido</Label>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="composite"
                      checked={selectedBlock.properties.composite}
                      onCheckedChange={(checked) => handlePropertyChange("composite", checked)}
                    />
                    <Label htmlFor="composite">Compuesto (múltiples campos)</Label>
                  </div>

                  <div className="space-y-4 mb-4">
                    <Label>Componentes anidados</Label>
                    {selectedBlock.properties.nestedComponents &&
                      selectedBlock.properties.nestedComponents.map((comp: any, index: number) => (
                        <div key={index} className="border rounded-md p-3 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium">Componente {index + 1}</h4>
                            <Button variant="ghost" size="icon" onClick={() => removeNestedComponent(index)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Tipo de componente</Label>
                              <Select
                                value={comp.type}
                                onValueChange={(value) => handleNestedComponentChange(index, "type", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="textfield">Campo de texto</SelectItem>
                                  <SelectItem value="textarea">Área de texto</SelectItem>
                                  <SelectItem value="select">Selector</SelectItem>
                                  <SelectItem value="pathfield">Campo de ruta</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Nombre del campo</Label>
                              <Input
                                value={comp.name}
                                onChange={(e) => handleNestedComponentChange(index, "name", e.target.value)}
                                placeholder="Nombre único para el campo"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Etiqueta del campo</Label>
                              <Input
                                value={comp.fieldLabel}
                                onChange={(e) => handleNestedComponentChange(index, "fieldLabel", e.target.value)}
                                placeholder="Etiqueta visible"
                              />
                            </div>

                            {comp.type === "pathfield" && (
                              <div className="space-y-1">
                                <Label className="text-xs">Ruta raíz</Label>
                                <Input
                                  value={comp.rootPath || "/content"}
                                  onChange={(e) => handleNestedComponentChange(index, "rootPath", e.target.value)}
                                  placeholder="/content"
                                />
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`comp-required-${index}`}
                                checked={comp.required}
                                onCheckedChange={(checked) => handleNestedComponentChange(index, "required", checked)}
                              />
                              <Label htmlFor={`comp-required-${index}`} className="text-xs">
                                Requerido
                              </Label>
                            </div>
                          </div>
                        </div>
                      ))}

                    <Button variant="outline" size="sm" onClick={addNestedComponent} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir componente
                    </Button>
                  </div>
                </>
              )}

              {selectedBlock.xmlTemplate && (
                <div className="space-y-2 mt-6 pt-4 border-t">
                  <Label htmlFor="xml-template">Plantilla XML</Label>
                  <Textarea
                    id="xml-template"
                    value={selectedBlock.xmlTemplate}
                    onChange={(e) => updateBlock(selectedBlock.id, { xmlTemplate: e.target.value })}
                    className="font-mono text-xs h-40"
                  />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
