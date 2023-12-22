import './assets/main.css'
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue';
import Main from './components/Main.vue';
import Aircraft from './components/Aircraft.vue';
import NotFound from './components/NotFound.vue';
import Login from './components/authentication/Login.vue';
import Logout from './components/authentication/Logout.vue';

export const API_BASE_URL = 'http://localhost:3000';

const routes = [
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  { path: '/', component: Main },
  { path: '/authentication/login', component: Login },
  { path: '/authentication/logout', component: Logout },
  { path: '/aircraft-database', component: Aircraft },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes
});

const app = createApp(App);
app.use(router);
app.mount('#app');

app.config.errorHandler = (error) => {
  console.log("Error: ");
  console.log(error);
}

