import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    allowedHosts: [
      't-2595402647---duetto-jhnckzprfa-de.a.run.app',
      // Allow any Firebase App Hosting domain
      /.*\.a\.run\.app$/
    ]
  }
})
