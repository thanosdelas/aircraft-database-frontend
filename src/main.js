import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App);
app.mount('#app');

app.config.errorHandler = (error) => {
  console.log("Error: ");
  console.log(error);
}
