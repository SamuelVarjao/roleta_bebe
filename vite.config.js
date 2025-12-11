import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        base: 'https://github.com/SamuelVarjao/roleta_bebe.git',
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
