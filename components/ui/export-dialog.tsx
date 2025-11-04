"use client"

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
import { useDialogStore } from "@/lib/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ExportDialog() {
  const { toast } = useToast()
  const { getActiveDialog } = useDialogStore()
  const [open, setOpen] = useState(false)

  const activeDialog = getActiveDialog()

  // Mejorar la función generateXML para manejar mejor los caracteres especiales
  const generateXML = () => {
    if (!activeDialog) return "<!-- No hay un diálogo activo -->"

    const { name: dialogTitle, helpPath: dialogHelpPath, tabs, blocks } = activeDialog

    // Función auxiliar para escapar caracteres especiales en XML
    const escapeXml = (unsafe) => {
      if (typeof unsafe !== "string") return unsafe
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
    }

    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:granite="http://www.adobe.com/jcr/granite/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
jcr:primaryType="nt:unstructured"
jcr:title="${escapeXml(dialogTitle)}"${
      dialogHelpPath
        ? `
helpPath="${escapeXml(dialogHelpPath)}"`
        : ""
    }
sling:resourceType="cq/gui/components/authoring/dialog">
<content
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/container">
    <items jcr:primaryType="nt:unstructured">`

    const xmlFooter = `
    </items>
</content>
</jcr:root>`

    // Generar secciones para cada pestaña
    const tabsXML = tabs
      .map((tab) => {
        const tabBlocks = blocks.filter((block) => block.tabId === tab.id)

        if (tabBlocks.length === 0) return ""

        const safeTabName = tab.name.toLowerCase().replace(/\s+/g, "")

        return `
        <${safeTabName}
            jcr:primaryType="nt:unstructured"
            jcr:title="${escapeXml(tab.name)}"
            sling:resourceType="granite/ui/components/coral/foundation/container">
            <items jcr:primaryType="nt:unstructured">
${processBlocksXML(tabBlocks)}
            </items>
        </${safeTabName}>`
      })
      .join("")

    return xmlHeader + tabsXML + xmlFooter
  }

  const processBlocksXML = (blocks) => {
    return blocks
      .map((block) => {
        try {
          // Generar XML para el bloque
          const xml = generateBlockXML(block)

          // Agregar indentación adecuada
          return xml
            .split("\n")
            .map((line) => `                    ${line}`)
            .join("\n")
        } catch (error) {
          console.error("Error generating XML for block:", block, error)
          return `                    <!-- Error generating XML for ${block.type}: ${block.name} -->`
        }
      })
      .join("\n")
  }

  // Mejorar la función generateBlockXML para manejar mejor los caracteres especiales
  const generateBlockXML = (block) => {
    // Función auxiliar para escapar caracteres especiales en XML
    const escapeXml = (unsafe) => {
      if (typeof unsafe !== "string") return unsafe
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
    }

    // Iniciar el XML con la etiqueta de apertura y atributos básicos
    let xml = `<${block.name}
jcr:primaryType="nt:unstructured"
`

    // Agregar el tipo de recurso según el tipo de bloque
    switch (block.type) {
      case "textfield":
        xml += `sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
`
        break
      case "textarea":
        xml += `sling:resourceType="granite/ui/components/coral/foundation/form/textarea"
`
        break
      case "select":
        xml += `sling:resourceType="granite/ui/components/coral/foundation/form/select"
`
        break
      case "checkbox":
        xml += `sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
`
        break
      case "heading":
        xml += `sling:resourceType="granite/ui/components/coral/foundation/heading"
`
        break
      case "richtext":
        xml += `sling:resourceType="cq/gui/components/authoring/dialog/richtext"
`
        break
      default:
        if (block.type === "custom") {
          // Para bloques personalizados, usar la plantilla XML tal cual
          return block.xmlTemplate || ""
        }
    }

    // Agregar atributos comunes según el tipo
    if (block.type !== "heading" && block.type !== "checkbox") {
      if (block.properties.fieldLabel) {
        xml += `fieldLabel="${escapeXml(block.properties.fieldLabel)}"
`
      }
    }

    // Agregar nombre del campo - ahora usando el nombre real del componente
    xml += `name="./${escapeXml(block.name)}"
`

    // Agregar atributos específicos según el tipo y propiedades
    if (block.properties.required === true) {
      xml += `required="{Boolean}true"
`
    }

    if (block.properties.fieldDescription) {
      xml += `fieldDescription="${escapeXml(block.properties.fieldDescription)}"
`
    }

    if (block.type === "textfield" && block.properties.defaultValue) {
      xml += `value="${escapeXml(block.properties.defaultValue)}"
`
    }

    if (block.type === "textarea" && block.properties.rows) {
      xml += `rows="${block.properties.rows}"
`
    }

    if (block.type === "checkbox") {
      if (block.properties.text) {
        xml += `text="${escapeXml(block.properties.text)}"
`
      }
      if (block.properties.checked === true) {
        xml += `checked="{Boolean}true"
`
      }
    }

    if (block.type === "heading") {
      if (block.properties.text) {
        xml += `text="${escapeXml(block.properties.text)}"
`
      }
      if (block.properties.level) {
        xml += `level="${block.properties.level}"
`
      }
    }

    if (block.type === "richtext" && block.properties.useFixedInlineToolbar !== undefined) {
      xml += `useFixedInlineToolbar="{Boolean}${block.properties.useFixedInlineToolbar}"
`
    }

    // Cerrar la etiqueta o agregar elementos hijos según el tipo
    if (block.type === "select") {
      xml += `>
`
      // Agregar opciones para el selector
      if (block.properties.options && Array.isArray(block.properties.options)) {
        block.properties.options.forEach((option) => {
          xml += `  <option jcr:primaryType="nt:unstructured" text="${escapeXml(option.text)}" value="${escapeXml(option.value)}"/>
`
        })
      }
      xml += `</${block.name}>`
    } else if (block.type === "richtext") {
      xml += `>
`
      // Agregar plugins RTE
      xml += `<rtePlugins jcr:primaryType="nt:unstructured">
`

      if (block.properties.rtePlugins) {
        // Format plugin
        if (block.properties.rtePlugins.format && block.properties.rtePlugins.format.features.length > 0) {
          xml += `  <format jcr:primaryType="nt:unstructured" features="${block.properties.rtePlugins.format.features.join(",")}"/>
`
        }

        // Justify plugin
        if (block.properties.rtePlugins.justify && block.properties.rtePlugins.justify.features.length > 0) {
          xml += `  <justify jcr:primaryType="nt:unstructured" features="${block.properties.rtePlugins.justify.features.join(",")}"/>
`
        }

        // Links plugin
        if (block.properties.rtePlugins.links && block.properties.rtePlugins.links.features.length > 0) {
          xml += `  <links jcr:primaryType="nt:unstructured" features="${block.properties.rtePlugins.links.features.join(",")}"/>
`
        }

        // Lists plugin
        if (block.properties.rtePlugins.lists && block.properties.rtePlugins.lists.features.length > 0) {
          xml += `  <lists jcr:primaryType="nt:unstructured" features="${block.properties.rtePlugins.lists.features.join(",")}"/>
`
        }

        // Paraformat plugin
        if (block.properties.rtePlugins.paraformat && block.properties.rtePlugins.paraformat.features.length > 0) {
          xml += `  <paraformat jcr:primaryType="nt:unstructured" features="${block.properties.rtePlugins.paraformat.features.join(",")}"/>
`
        }
      }

      xml += `</rtePlugins>
`
      xml += `</${block.name}>`
    } else {
      xml += `/>`
    }

    return xml
  }

  const handleDownload = () => {
    if (!activeDialog) {
      toast({
        title: "Error",
        description: "No hay un diálogo activo para exportar",
        variant: "destructive",
      })
      return
    }

    try {
      const xml = generateXML()

      // Crear un Blob con el contenido XML y el tipo MIME correcto
      const blob = new Blob([xml], { type: "application/xml;charset=utf-8" })

      // Crear una URL para el blob
      const url = URL.createObjectURL(blob)

      // Crear un elemento de enlace para la descarga
      const link = document.createElement("a")
      link.href = url
      link.download = `${activeDialog.name.replace(/\s+/g, "-").toLowerCase()}.xml`

      // Añadir el enlace al documento, hacer clic y luego eliminarlo
      document.body.appendChild(link)
      link.click()

      // Pequeño retraso antes de limpiar para asegurar que la descarga comience
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        setOpen(false)

        toast({
          title: "XML exportado",
          description: `El diálogo "${activeDialog.name}" ha sido exportado como XML`,
        })
      }, 100)
    } catch (error) {
      console.error("Error al exportar XML:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al exportar el XML. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="h-10" disabled={!activeDialog}>
          <Download className="mr-2 h-4 w-4" />
          Exportar XML
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Exportar Diálogo como XML</DialogTitle>
          <DialogDescription>Vista previa del código XML generado para tu diálogo AEM</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap">{generateXML()}</pre>
          </ScrollArea>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleDownload} className="h-10">
            <Download className="mr-2 h-4 w-4" />
            Descargar XML
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
