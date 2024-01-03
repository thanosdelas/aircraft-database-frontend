<template>
  <div v-if="allowLogin">
    <h1>Login</h1>

    <div>{{ message }}</div>

    <div>
      email: <input v-model="email" @keyup.enter="login">
    </div>

    <div>
      password; <input v-model="password" @keyup.enter="login">
    </div>

    <button @click='login'>Log In</button>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router'

  import { API_BASE_URL } from '@/main.js';
  import { store } from '@/store/store.js'
  import Authentication from '@/services/authentication';

  const allowLogin = ref(false);
  const email = ref(null);
  const password = ref(null);
  const message = ref(null);
  const router = useRouter();

  let authentication = null;

  onMounted(() => {
    email.value = 'test@example.com';
    password.value = 'test';

    authentication = new Authentication();
    authentication.isLoggedIn().then((isLoggedIn) => {
      if(isLoggedIn === true){
        return router.push({ path: '/' });
      }

      allowLogin.value = true;
    });
  });

  async function login(){
    message.value = null;

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

      if(results.status === 'success' && results.data.access_token){
        authentication.saveAccessToken(results.data.access_token);

        return router.push({ path: '/' });
      }

      message.value = 'Authentication failed';
    }
    catch(error){
      message.value = 'Something went wrong';
    }
  }
</script>
