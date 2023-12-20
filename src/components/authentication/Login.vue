<template>
  <h1>Login</h1>

  <div>{{ message }}</div>

  <div>
    email: <input v-model="email" @keyup.enter="login">
  </div>

  <div>
    password; <input v-model="password" @keyup.enter="login">
  </div>

  <button @click='login'>Log In</button>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router'

  import { API_BASE_URL } from '@/main.js';
  import Authentication from '@/services/authentication';

  const email = ref(null);
  const password = ref(null);
  const message = ref(null);
  const router = useRouter();

  onMounted(() => {
    email.value = 'test1@example.com';
    password.value = 'test';
  });

  async function login(){
    if(!email.value || !password.value){
      return null;
    }

    const API_URL = `${ API_BASE_URL }/api/authentication/login`;
    const requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    }

    try{
      const response = await fetch(API_URL, requestOptions);
      const results = await response.json();

      if(results.status === 'ok' && results.access_token){
        const authentication = new Authentication();
        authentication.saveAccessToken(results.access_token);

        return router.push({ path: '/' });
      }

      message.value = 'Authentication failed';
    }
    catch(error){
      console.log(error);
      message.value = 'Something went wrong';
    }
  }
</script>
