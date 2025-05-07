// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css' // We'll put global styles and color variables here
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')