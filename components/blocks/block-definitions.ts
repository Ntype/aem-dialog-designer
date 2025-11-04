import type { BlockType } from "@/lib/store"

export interface BlockDefinition {
  type: BlockType
  name: string
  label: string
  icon: string
  defaultProperties: Record<string, any>
  xmlTemplate: string
}

export const blockDefinitions: BlockDefinition[] = [
  {
    type: "textfield",
    name: "textfield",
    label: "Campo de Texto",
    icon: "text-cursor",
    defaultProperties: {
      required: false,
      fieldLabel: "Texto",
      fieldDescription: "Descripción del campo de texto",
      defaultValue: "",
    },
    xmlTemplate: `<textfield
  jcr:primaryType="nt:unstructured"
  sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
  fieldLabel="\${fieldLabel}"
  name="./\${name}"
  \${required ? 'required="{Boolean}true"' : ''}
  \${fieldDescription ? 'fieldDescription="' + fieldDescription + '"' : ''}
  \${defaultValue ? 'value="' + defaultValue + '"' : ''}
/>`,
  },
  {
    type: "textarea",
    name: "textarea",
    label: "Área de Texto",
    icon: "pilcrow",
    defaultProperties: {
      required: false,
      fieldLabel: "Área de Texto",
      fieldDescription: "Descripción del área de texto",
      rows: 5,
    },
    xmlTemplate: `<textarea
  jcr:primaryType="nt:unstructured"
  sling:resourceType="granite/ui/components/coral/foundation/form/textarea"
  fieldLabel="\${fieldLabel}"
  name="./\${name}"
  \${required ? 'required="{Boolean}true"' : ''}
  \${fieldDescription ? 'fieldDescription="' + fieldDescription + '"' : ''}
  rows="\${rows}"
/>`,
  },
  {
    type: "select",
    name: "select",
    label: "Selector",
    icon: "list",
    defaultProperties: {
      required: false,
      fieldLabel: "Selector",
      fieldDescription: "Descripción del selector",
      options: [
        { text: "Opción 1", value: "option1" },
        { text: "Opción 2", value: "option2" },
      ],
    },
    xmlTemplate: `<select
  jcr:primaryType="nt:unstructured"
  sling:resourceType="granite/ui/components/coral/foundation/form/select"
  fieldLabel="\${fieldLabel}"
  name="./\${name}"
  \${required ? 'required="{Boolean}true"' : ''}
  \${fieldDescription ? 'fieldDescription="' + fieldDescription + '"' : ''}>
  \${options.map(option => '<option jcr:primaryType="nt:unstructured" text="' + option.text + '" value="' + option.value + '"/>').join('\n')}
</select>`,
  },
  {
    type: "checkbox",
    name: "checkbox",
    label: "Casilla de Verificación",
    icon: "check-square",
    defaultProperties: {
      text: "Activar",
      checked: false,
      fieldDescription: "Descripción de la casilla de verificación",
    },
    xmlTemplate: `<checkbox
  jcr:primaryType="nt:unstructured"
  sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
  text="\${text}"
  name="./\${name}"
  \${checked ? 'checked="{Boolean}true"' : ''}
  \${fieldDescription ? 'fieldDescription="' + fieldDescription + '"' : ''}
/>`,
  },
  {
    type: "richtext",
    name: "richtext",
    label: "Editor de Texto Enriquecido",
    icon: "file-text",
    defaultProperties: {
      required: false,
      fieldLabel: "Texto Enriquecido",
      fieldDescription: "Descripción del editor de texto enriquecido",
      useFixedInlineToolbar: true,
      rtePlugins: {
        format: {
          features: ["bold", "italic", "underline"],
        },
        justify: {
          features: ["justifyleft", "justifycenter", "justifyright"],
        },
        links: {
          features: ["modifylink", "unlink"],
        },
        lists: {
          features: ["bullet", "numbered"],
        },
        paraformat: {
          features: ["default", "h1", "h2", "h3"],
        },
      },
    },
    xmlTemplate: `<richtext
  jcr:primaryType="nt:unstructured"
  sling:resourceType="cq/gui/components/authoring/dialog/richtext"
  fieldLabel="\${fieldLabel}"
  name="./\${name}"
  \${required ? 'required="{Boolean}true"' : ''}
  \${fieldDescription ? 'fieldDescription="' + fieldDescription + '"' : ''}
  useFixedInlineToolbar="{Boolean}\${useFixedInlineToolbar}">
  <rtePlugins jcr:primaryType="nt:unstructured">
    <format jcr:primaryType="nt:unstructured" features="\${rtePlugins.format.features.join(',')}"/>
    <justify jcr:primaryType="nt:unstructured" features="\${rtePlugins.justify.features.join(',')}"/>
    <links jcr:primaryType="nt:unstructured" features="\${rtePlugins.links.features.join(',')}"/>
    <lists jcr:primaryType="nt:unstructured" features="\${rtePlugins.lists.features.join(',')}"/>
    <paraformat jcr:primaryType="nt:unstructured" features="\${rtePlugins.paraformat.features.join(',')}"/>
  </rtePlugins>
</richtext>`,
  },
  {
    type: "multifield",
    name: "multifield",
    label: "Campo Múltiple",
    icon: "layers",
    defaultProperties: {
      required: false,
      fieldLabel: "Campo Múltiple",
      fieldDescription: "Descripción del campo múltiple",
      composite: true,
      nestedComponents: [
        {
          type: "textfield",
          name: "textfield",
          fieldLabel: "Texto",
          required: false,
        },
        {
          type: "pathfield",
          name: "pathfield",
          fieldLabel: "Ruta",
          rootPath: "/content",
          required: false,
        },
      ],
    },
    xmlTemplate: `<\${name}
  jcr:primaryType="nt:unstructured"
  sling:resourceType="granite/ui/components/coral/foundation/form/multifield"
  fieldLabel="\${fieldLabel}"
  \${required ? 'required="{Boolean}true"' : ''}
  \${fieldDescription ? 'fieldDescription="' + fieldDescription + '"' : ''}
  composite="{Boolean}\${composite}">
  <field
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/container"
    name="./\${name}">
    <items jcr:primaryType="nt:unstructured">
      \${nestedComponents.map(comp => {
        const { fieldLabel, required } = comp;
        if (comp.type === 'textfield') {
          return \`&lt;\${comp.name}
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
        fieldLabel="\${fieldLabel}"
        name="./\${comp.name}"
        \${required ? 'required="{Boolean}true"' : ''}
      /&gt;\`;
        } else if (comp.type === 'pathfield') {
          return \`<\${comp.name}
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
        fieldLabel="\${fieldLabel}"
        name="./\${comp.name}"
        rootPath="\${comp.rootPath}"
        \${required ? 'required="{Boolean}true"' : ''}
      />\`;
        } else if (comp.type === 'textarea') {
          return \`<\${comp.name}
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/form/textarea"
        fieldLabel="\${fieldLabel}"
        name="./\${comp.name}"
        \${required ? 'required="{Boolean}true"' : ''}
      />\`;
        } else if (comp.type === 'select') {
          return \`<\${comp.name}
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/form/select"
        fieldLabel="\${fieldLabel}"
        name="./\${comp.name}"
        \${required ? 'required="{Boolean}true"' : ''}
      />\`;
        }
        return '';
      }).join('\n      ')}
    </items>
  </field>
</\${name}>`,
  },
  {
    type: "pathfield",
    name: "pathfield",
    label: "Campo de Ruta",
    icon: "folder",
    defaultProperties: {
      required: false,
      fieldLabel: "Ruta",
      fieldDescription: "Seleccione una ruta",
      rootPath: "/content",
    },
    xmlTemplate: `<pathfield
  jcr:primaryType="nt:unstructured"
  sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
  fieldLabel="\${fieldLabel}"
  name="./\${name}"
  rootPath="\${rootPath}"
  \${required ? 'required="{Boolean}true"' : ''}
  \${fieldDescription ? 'fieldDescription="' + fieldDescription + '"' : ''}
/>`,
  },
  {
    type: "fileupload",
    name: "fileupload",
    label: "Carga de Archivos",
    icon: "upload",
    defaultProperties: {
      required: false,
      fieldLabel: "Imagen",
      fieldDescription: "Seleccione una imagen para subir al DAM",
      allowUpload: true,
      sizeLimit: 2,
      mimeTypes: ["image/jpeg", "image/png", "image/gif"],
      uploadUrl: "/content/dam",
      fileNameParameter: "./fileName",
      fileReferenceParameter: "./fileReference",
      autoStart: true,
      useHTML5: true,
      uploadPrettyName: true,
    },
    xmlTemplate: `<\${name}
  jcr:primaryType="nt:unstructured"
  sling:resourceType="cq/gui/components/authoring/dialog/fileupload"
  fieldLabel="\${fieldLabel}"
  name="./\${name}"
  \${required ? 'required="{Boolean}true"' : ''}
  \${fieldDescription ? 'fieldDescription="' + fieldDescription + '"' : ''}
  allowUpload="{Boolean}\${allowUpload}"
  sizeLimit="\${sizeLimit}"
  mimeTypes="[\${mimeTypes.map(type => '"' + type + '"').join(',')}]"
  uploadUrl="\${uploadUrl}"
  fileNameParameter="\${fileNameParameter}"
  fileReferenceParameter="\${fileReferenceParameter}"
  autoStart="{Boolean}\${autoStart}"
  useHTML5="{Boolean}\${useHTML5}"
  uploadPrettyName="{Boolean}\${uploadPrettyName}"
/>`,
  },
]
