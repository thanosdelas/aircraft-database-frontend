<template>
  <AdminNavigationMenu></AdminNavigationMenu>
</template>

<script setup>
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router'
  import AdminNavigationMenu from '@/components/admin/navigation/AdminNavigationMenu.vue';
  import Authentication from '@/services/authentication';

  const router = useRouter();

  onMounted(() => {
    const authentication = new Authentication();

    authentication.isLoggedIn().then((isLoggedIn) => {
      if(isLoggedIn !== true){
        return router.push({ path: '/' });
      }
    });
  });
</script>
