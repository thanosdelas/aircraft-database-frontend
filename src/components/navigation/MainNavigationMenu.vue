<template>
  <div class="navigation-menu">
    <Logo></Logo>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/aircraft-database">Aircraft Database</RouterLink>
    <div v-if="authenticationCheckLoading" class="loading-text">checking authentication status ...</div>
    <div v-if="!authenticationCheckLoading">
      <RouterLink to="/authentication/login" v-if="!store.authentication.loggedIn">Login</RouterLink>

      <div v-if="store.authentication.loggedIn">
        <RouterLink to="/admin/aircraft">Admin</RouterLink>
        <RouterLink to="/authentication/logout">Logout</RouterLink>
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

  const authenticationCheckLoading = ref(true);

  onMounted(() => {
    const authentication = new Authentication();

    setTimeout(() => {
      authentication.isLoggedIn().then((isLoggedIn) => {
        authenticationCheckLoading.value = false;
      });
    }, 1000);
  });
</script>

<style type="text/css">
  .navigation-menu{
    display: flex;
    align-items: center;
    background: #222;
    padding: 5px;
  }
  .loading-text{
    font-size: 10px;
    color: #7ed54b;
  }
</style>
