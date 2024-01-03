<template>
  <h1>Aircraft Database</h1>
  <div class="aircraft-wrapper">
    <div v-for="error in errors">
      {{ error.message }}
    </div>

    <div class="search-bar">
      <input type="text" name="sarch" v-model="searchTerm" @keyup.enter="search" />
      <button @click="search">Search</button>
    </div>

    <div
      class="aircraft-list-entry"
      :class="{ active: selectedAircraft == aircraft, 'last-visited': lastVisited == aircraft && !selectedAircraft }"
      v-for="aircraft in aircraftData"
      @click="aircraftDetails(aircraft)">
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
  import AdminAircraftDetails from './admin-aircraft-details/AdminAircraftDetails.vue';
  import AircraftApiAdmin from '@/services/aircraft-api-admin';

  onMounted(() => {
    return fetchAircraft();
  });

  const errors = ref(null);
  const searchTerm = ref(null);
  const aircraftData = ref(null);
  const lastVisited = ref(false);
  const selectedAircraft = ref(false);

  async function fetchAircraft(searchTerm = ''){
    const httpRequest = new HttpRequest();
    const authentication = new Authentication();
    const aircraftApiAdmin = new AircraftApiAdmin(httpRequest, authentication);

    let params = {};
    if(searchTerm.length > 0){
      params['search_term'] = searchTerm;
    }

    const result = await aircraftApiAdmin.fetch(params);
    if('errors' in result){
      errors.value = result.errors
      return null;
    }

    aircraftData.value = result.data;
  }

  function search(){
    closeDetails();

    return fetchAircraft(searchTerm.value);
  }

  function aircraftDetails(aircraft){
    resetDetails();

    if(lastVisited.value === aircraft){
      return lastVisited.value = null;
    }

    setTimeout(function(){
      selectedAircraft.value = aircraft;
      lastVisited.value = aircraft;
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
  }
  .aircraft-list-entry{
    display: block;
    width: 100%;
    overflow: hidden;
    cursor: pointer;
    border-bottom: 1px dashed #5d5947;
    transition: all .3s;
  }
  .aircraft-list-entry.active{
    background: #9fef2d;
    color: #000;
    padding: 5px;
  }
  .aircraft-list-entry.last-visited{
    background: #2a303f;
    color: #797979;
    padding: 5px;
  }
  .aircraft-list-entry span{
    margin-right: 10px;
    display: inline-block;
  }
  .search-bar{
    display: flex;
    padding: 20px 0px;
  }
  .search-bar input{
    width: 100%;
    background: none;
    border-color: #efbd2d;
    color: #efbd2d;
    font-size: 20px;
    /*
    border-bottom: 1px solid;
    border-left: 7px solid;
    border-radius: 50px;
    padding-left: 20px;
    */
  }
</style>
