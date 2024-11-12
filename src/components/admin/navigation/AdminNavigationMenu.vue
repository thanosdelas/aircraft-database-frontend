<template>
  <div class="navigation-menu-collapsed" @click="toggleMenu()" v-if="!menu">
    <Logo></Logo>
  </div>
  <div class="sidebar-menu-fixed" v-if="menu">
    <div class="navigation-menu">
      <div class="navigation-menu-collapsed" @click="toggleMenu()">
        <Logo></Logo>
      </div>

      <div class="sidebar-menu-wrapper">
        <RouterLink class="menu-entry" to="/admin">Admin Panel</RouterLink>
        <RouterLink class="menu-entry" to="/admin/aircraft-database">Aircraft Database</RouterLink>
        <RouterLink class="menu-entry" to="/">Public Website</RouterLink>

        <div v-if="authenticationCheckLoading" class="loading-text">checking authentication status ...</div>
        <div v-if="!authenticationCheckLoading">
          <RouterLink class="menu-entry" to="/authentication/login" v-if="!store.authentication.loggedIn">Login</RouterLink>
          <div v-if="store.authentication.loggedIn">
            <RouterLink class="menu-entry" to="/authentication/logout">Logout</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>

  <RouterView></RouterView>
</template>

<script setup>
  import Logo from '@/components/icons/Logo.vue';
  import { ref, onMounted, onUpdated } from 'vue';
  import { store } from '@/store/store.js'
  import Authentication from '@/services/authentication';

  const menu = ref(false);
  const authenticationCheckLoading = ref(true);

  onMounted(() => {
    const authentication = new Authentication();

    setTimeout(() => {
      authentication.isLoggedIn().then((isLoggedIn) => {
        authenticationCheckLoading.value = false;
      });
    }, 1000);
  });

  function toggleMenu(){
    if (menu.value === true){
      menu.value = false;
    }
    else{
      menu.value = true;
    }
  }
</script>
