<template>
  <h1>Aircraft Database</h1>
  <div class="aircraft-wrapper">
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
    <AircraftDetails :aircraftId="selectedAircraft.id" @closeDetails="closeDetails">
    </AircraftDetails>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { HttpRequest } from '@/services/http-request';
  import AircraftApi from '@/services/aircraft-api';
  import AircraftDetails from './AircraftDetails.vue';

  onMounted(() => {
    return fetchAircraft();
  });

  const aircraftData = ref(null);
  const selectedAircraft = ref(false)

  async function fetchAircraft(){
    const httpRequest = new HttpRequest();
    const aircraftApi = new AircraftApi(httpRequest);

    const result = await aircraftApi.fetchAll();
    if('errors' in result){
      errors.value = result.errors
      return null;
    }

    aircraftData.value = result.data;
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
  .aircraft-list-entry{
    display: block;
    width: 100%;
    overflow: hidden;
    cursor: pointer;
    border-bottom: 1px dashed #5d5947;
    transition: all .3s;
  }
  .aircraft-list-entry.active{
    /*background: #9fef2d;*
    /*color: #000;*/
    background: #49463e;
    padding: 5px;
  }
  .aircraft-list-entry span{
    margin-right: 10px;
    display: inline-block;
  }
</style>
