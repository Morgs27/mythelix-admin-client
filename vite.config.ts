import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // We need to define which port the project will run on when we execute
  // npm run preview.

  // also host: true will expose the project in public 
  preview : {
    host: true,
    port: 8080
  }
})
