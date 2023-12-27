<template>
  <h1>Aircraft Database</h1>
  <div class="aircraft-wrapper">
    <div v-for="error in errors">
      {{ error.message }}
    </div>

    <div
      class="aircraft-list-entry"
      :class="{ active: selectedAircraft == aircraft }"
      v-for="aircraft in aircraftData"
      @click="visitArticle(aircraft)">
      <div>
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
  import { HttpRequest } from '@/services/http-request';
  import Authentication from '@/services/authentication';
  import AdminAircraftDetails from './AdminAircraftDetails.vue';
  import AircraftApiAdmin from '@/services/aircraft-api-admin';

  onMounted(() => {
    return fetchAircraft();
  });

  const errors = ref(null);
  const aircraftData = ref(null);
  const selectedAircraft = ref(false)

  async function fetchAircraft(){
    const httpRequest = new HttpRequest();
    const authentication = new Authentication();
    const aircraftApi = new AircraftApiAdmin(httpRequest, authentication);

    const result = await aircraftApi.fetch();

    if('errors' in result){
      errors.value = result.errors
      return null;
    }

    aircraftData.value = result;
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

<style scoped>
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
