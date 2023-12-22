import './assets/main.css'
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue';
import Main from './components/Main.vue';
import HomePage from './components/HomePage.vue';
import Aircraft from './components/Aircraft.vue';
import NotFound from './components/NotFound.vue';
import Login from './components/authentication/Login.vue';
import Logout from './components/authentication/Logout.vue';
import AdminMain from './components/admin/AdminMain.vue';
import AdminAircraft from './components/admin/AdminAircraft.vue';

export const API_BASE_URL = 'http://localhost:3000';

const routes = [
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  {
    path: '/',
    component: Main,
    children: [
      { path: '/', component: HomePage },
      { path: '/authentication/login', component: Login },
      { path: '/authentication/logout', component: Logout },
      { path: '/aircraft-database', component: Aircraft }
    ]
  },
  {
    path: '/admin',
    component: AdminMain,
    children: [
      { path: '/admin/aircraft', component: AdminAircraft }
    ]
  },
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
