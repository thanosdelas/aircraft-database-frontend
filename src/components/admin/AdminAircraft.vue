<template>
  <h1>Aircraft Database</h1>

  <button @click="fetchAircraft">Fetch Aircraft</button>

  <div class="aircraft-wrapper">
    <div
      class="aircraft-list-entry"
      :class="{ active: selectedAircraft == aircraft }"
      v-for="aircraft in aircraftData"
      @click="visitArticle(aircraft)">
      <div>
        <span>{{ aircraft.manufacturericao }}</span>
        <span>{{ aircraft.manufacturername }}</span>
        <span>{{ aircraft.model }}</span>
      </div>
    </div>
  </div>

  <div v-if="selectedAircraft">
    <AdminAircraftDetails :aircraft="selectedAircraft" @closeDetails="closeDetails">
    </AdminAircraftDetails>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  import Authentication from '@/services/authentication';
  import AdminAircraftDetails from './AdminAircraftDetails.vue';

  onMounted(() => {
    return fetchAircraft();
  });

  const API_URL = `http://localhost:3000/api/aircraft`
  const aircraftData = ref(null);
  const selectedAircraft = ref(false)

  async function fetchAircraft(){
    const authentication = new Authentication();

    const response = await fetch(API_URL, {
      headers: authentication.headers()
    });
    const data = await response.json();

    console.log(data);
    aircraftData.value = data;
  }

  function visitArticle(aircraft){
    resetDetails();

    setTimeout(function(){
      selectedAircraft.value = aircraft;
    }, 50);
  }

  function closeDetails(){
    return resetDetails();
  }

  function resetDetails(){
    selectedAircraft.value = null
  }
</script>

<style>
  .aircraft-wrapper{
    position: relative;
    overflow: hidden;
    display: block;
    padding: 10px;
  }
  .aircraft-list-entry{
    display: block;
    width: 100%;
    overflow: hidden;
    cursor: pointer;
    border-bottom: 1px dashed #5d5947;
  }
  .aircraft-list-entry.active{
    background: #496973;
  }
  .aircraft-list-entry span{
    margin-right: 10px;
    display: inline-block;
  }
</style>
