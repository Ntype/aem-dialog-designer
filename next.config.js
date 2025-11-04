/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: ["./styles"],
  },
  output: 'export',            // para next export
  basePath: '/aem-dialog-designer',    // reemplaza NOMBRE_REPO con tu repo
  trailingSlash: true   
}

module.exports = nextConfig
