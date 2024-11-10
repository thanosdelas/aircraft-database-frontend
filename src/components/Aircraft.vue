<template>
  <div class="main-wrapper">
    <div class="aircraft-types-wrapper">
      <div class="loader-wrapper" v-if="aircraftTypesLoading">
        <div>loading aircraft types ...</div>
        <div class="loader"><div></div><div></div></div>
      </div>

      <div
        class="aircraft-types-list-entry"
        :class="{ active: selectedAircraftType == aircraftType }"
        v-for="aircraftType in aircraftTypes"
        @click="filterByType(aircraftType)">
        <div>
          {{ aircraftType.aircraft_type }} <span>({{ aircraftType.aircraft_count }})</span>
        </div>
      </div>
    </div>

    <div class="aircraft-wrapper">
      <div class="loader-wrapper" v-if="aircraftDataLoading">
        <div>loading aircraft ...</div>
        <div class="loader"><div></div><div></div></div>
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
      <AircraftDetails :aircraftId="selectedAircraft.id" @closeDetails="closeDetails">
      </AircraftDetails>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { HttpRequest } from '@/services/http-request';
  import AircraftApi from '@/services/aircraft-api';
  import AircraftDetails from './AircraftDetails.vue';

  onMounted(() => {
    fetchAircraftTypes();
    fetchAircraft();
  });

  const aircraftData = ref(null);
  const aircraftTypes = ref(null);
  const selectedAircraft = ref(false)
  const selectedAircraftType = ref(false)
  const aircraftDataLoading = ref(true)
  const aircraftTypesLoading = ref(true)

  async function fetchAircraftTypes(searchTerm = ''){
    const httpRequest = new HttpRequest();
    const aircraftApi = new AircraftApi(httpRequest);

    const data = await aircraftApi.fetchAircraftTypes();

    if('errors' in data){
      errors.value = data.errors
      return null;
    }

    setTimeout(function(){
      aircraftTypesLoading.value = false;
      aircraftTypes.value = data.data;
    }, randomInt(100, 200));
  }

  async function fetchAircraft(params = {}){
    aircraftData.value = {}
    aircraftDataLoading.value = true

    const httpRequest = new HttpRequest();
    const aircraftApi = new AircraftApi(httpRequest);

    const result = await aircraftApi.fetchAll(params);
    if('errors' in result){
      errors.value = result.errors
      return null;
    }

    setTimeout(function(){
      aircraftDataLoading.value = false;
      aircraftData.value = result.data;
    }, randomInt(100, 200));
  }

  function visitArticle(aircraft){
    resetDetails();

    setTimeout(function(){
      selectedAircraft.value = aircraft;
    }, 50);
  }

  function filterByType(aircraftType){
    if (selectedAircraftType.value === aircraftType){
      selectedAircraftType.value = null;

      return fetchAircraft();
    }

    selectedAircraftType.value = aircraftType;

    resetDetails();

    return fetchAircraft({aircraft_type: aircraftType.aircraft_type})
  }

  function closeDetails(){
    return resetDetails();
  }

  function resetDetails(){
    selectedAircraft.value = null
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
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
    padding: 4px;
  }
  .aircraft-list-entry.active{
    /*background: #9fef2d;*
    /*color: #000;*/
    background: #49463e;
    padding: 6px;
  }
  .aircraft-list-entry span{
    margin-right: 10px;
    display: inline-block;
  }
  .aircraft-types-list-entry{
    display: block;
    width: 100%;
    overflow: hidden;
    cursor: pointer;
    border-bottom: 1px dashed #5d5947;
    transition: all .3s;
  }
  .aircraft-types-list-entry.active{
    /*background: #9fef2d;*
    /*color: #000;*/
    background: #49463e;
    padding: 5px;
  }
  .aircraft-types-list-entry span{
    margin-right: 10px;
    display: inline-block;
  }
</style>
