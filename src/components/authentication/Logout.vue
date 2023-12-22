<template>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router'
  import Authentication from '@/services/authentication';
  const router = useRouter();

  onMounted(() => {
    const authentication = new Authentication();

    authentication.logout();

    return router.push({ path: '/' });
  });
</script>
