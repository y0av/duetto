import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    // Allow all hosts - Firebase App Hosting generates new host IDs for each deployment
    host: true,
    allowedHosts: true
  },
  preview: {
    // Allow all hosts - Firebase App Hosting generates new host IDs for each deployment
    host: true,
    allowedHosts: true
  }
})
