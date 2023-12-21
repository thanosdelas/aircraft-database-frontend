<template>
  <div class="navigation-menu">
  <Logo></Logo>
  <RouterLink to="/">Home</RouterLink>
  <RouterLink to="/aircraft-database">Aircraft Database</RouterLink>
  <RouterLink to="/authentication/login">Login</RouterLink>
  </div>

  <RouterView></RouterView>
</template>

<script setup>
  import Logo from '@/components/icons/Logo.vue'
</script>

<style type="text/css">
  .navigation-menu{
    display: flex;
    align-items: center;
    background: #222;
    padding: 5px;
  }
</style>
