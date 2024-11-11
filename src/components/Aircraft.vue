<template>
  <div class="main-wrapper">

    <div class="aircraft-gallery-wrapper">
      <div class="image" v-for="image in aircraftDataGallery">
        <img :alt="image.featured_image" :src="featuredImageThumbnailURL(image)" />
      </div>
    </div>

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
  const aircraftDataGallery = ref(null);
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

    aircraftDataGallery.value = null
    if ('aircraft_type' in params){
      aircraftDataGallery.value = findFeaturedImages(result.data);
      console.log(aircraftDataGallery);
    }

    setTimeout(function(){
      aircraftDataLoading.value = false;

      aircraftData.value = result.data;

      if (result.data.length === 1){
        visitArticle(result.data[0]);
      }
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

  function findFeaturedImages(aircraftResults){
    let images = []

    aircraftResults.forEach((aircraft) => {
      aircraft.images.forEach((image) => {
        if(
          image.filename === aircraft.featured_image ||
          image.filename === `File:${ aircraft.featured_image }`
        ){
          images.push(image);
        }
      });
    });

    console.log(images);
    return images;
  }

  function featuredImageThumbnailURL(image){
    console.log("image: ", image);

    if(image.url.indexOf('.svg') !== -1){
      return image.url;
    }

    return image.url.split('commons').join('commons/thumb')+'/500px-'+image.filename.replace('File:','').replace(/ /g,"_");
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
  .aircraft-gallery-wrapper{
    position: fixed;
    display: grid;
    grid-template-columns: repeat(2, minmax(200px, 1fr)); /* Define columns */
    gap: 0px;
    grid-auto-flow: dense; /* Makes items fill the grid tightly */
    /*direction: rtl;*/

    grid-template-rows: auto; /* Automatically size rows based on content */
    gap: 0; /* No gap between grid items */


    width: calc(100vw - 300px);
    width: 600px;
    left: 300px;
    overflow: hidden;
  }

  .aircraft-gallery-wrapper .image{
    background-color: #f0f0f0;
    text-align: center;
  }

  .aircraft-gallery-wrapper .image img{
    height: 225px;
  }
</style>
