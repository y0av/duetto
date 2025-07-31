import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    // Allow all hosts - Firebase App Hosting generates new host IDs for each deployment
    allowedHosts: 'all'
  }
})
