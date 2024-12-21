<template>
  <div class="main-wrapper">
    <div v-if="allowLogin">
      <div class="login-form">
        <h2>Login</h2>

        <div>{{ message }}</div>

        <div class="form">
          <div class="form-row">
            <label>Email:</label>
            <input v-model="email" @keyup.enter="login">
          </div>

          <div class="form-row">
            <label>Password: </label>
            <input v-model="password" @keyup.enter="login">
          </div>

          <button @click='login'>Log In</button>
        </div>
        <br /><hr /><br />
        <div class="loader-wrapper" v-if="googleAuthLoading">
          <div class="loader"><div></div><div></div></div>
        </div>
        <div id="google-login"></div>
      </div>
    </div>
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
  const googleAuthLoading = ref(true)
  let authentication = null;

  onMounted(async() => {
    email.value = 'test@example.com';
    password.value = 'test';

    authentication = new Authentication();
    authentication.isLoggedIn().then((isLoggedIn) => {
      if(isLoggedIn === true){
        return router.push({ path: '/' });
      }

      allowLogin.value = true;
    });

    await loadGoogleScript();
    initializeGsiClient();
  });

  const loadGoogleScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  };

  const initializeGsiClient = () => {
    google.accounts.id.initialize({
      client_id: '1094984630998-kuso8ldhr1c5321mgdlsthbc22tiio8j.apps.googleusercontent.com',
      callback: handleCredentialResponse,
    });

    // Render the Google Sign-In button
    google.accounts.id.renderButton(
      document.getElementById('google-login'),
      {
        theme: 'outline',
        size: 'large',
      }
    );

    googleAuthLoading.value = false;
  };

  async function handleCredentialResponse(response) {
    console.log('Google auth credential: ', response);

    const API_URL = `${ API_BASE_URL }/authentication/login/google`;
    const requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        googleauth_credential: response.credential,
      })
    }

    try{
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json()

      if(response.status === 201){
        authentication.saveAccessToken(data.access_token);

        return router.push({ path: '/' });
      }

      message.value = 'Authentication failed';
    }
    catch(error){
      message.value = 'Something went wrong';
    }
  };

  async function login(){
    message.value = null;

    if(!email.value || !password.value){
      return null;
    }

    const API_URL = `${ API_BASE_URL }/authentication/login`;
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
      const data = await response.json()

      if(response.status === 201){
        authentication.saveAccessToken(data.access_token);

        return router.push({ path: '/' });
      }

      message.value = 'Authentication failed';
    }
    catch(error){
      message.value = 'Something went wrong';
    }
  }
</script>

<style type="text/css">
  .login-form{
    display: flex;
    flex-direction: column;
    margin-top: 100px;
    padding: 35px;
    width: 527px;
    margin: 205px auto;
    background: #000000ab;
  }

  .form .form-row{
    display: flex;
    border-bottom: 1px dashed #c3c3c3;
    padding: 5px 2px;
    margin: 23px 0px;
  }

  .form input{
    background: none;
    border: none;
    color: #FFF;
    width: 100%;
  }

  .form label{
    width: 100px;
    background: none;
    border: none;
    color: #c3c3c3;
  }
</style>
