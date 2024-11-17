<template>
  <div class="background-overlay"></div>

  <div class="main-wrapper">
    <div class="aircraft-gallery-wrapper">
      <div class="image" v-for="image in aircraftDataGallery">
        <img :alt="image.featured_image" :src="featuredImageThumbnailURL(image)" />
      </div>
    </div>

    <div class="filters-wrapper">
      <div class="header">
        <div class="header-tab" :class="{ active: activeTab === 'manufacturers' }" @click="selectFilterTab('manufacturers')">Manufacturers</div>
        <div class="header-tab" :class="{ active: activeTab === 'types' }" @click="selectFilterTab('types')">Types</div>
      </div>

      <div class="entry aircraft-manufacturers-wrapper" v-if="filterTabs.manufacturers">
        <div class="loader-wrapper" v-if="aircraftManufacturersLoading">
          <div>loading aircraft manufacturers ...</div>
          <div class="loader"><div></div><div></div></div>
        </div>

        <div
          class="list-entry"
          :class="{ active: selectedAircraftManufacturer == aircraftManufacturer }"
          v-for="aircraftManufacturer in aircraftManufacturers"
          @click="filterByManufacturer(aircraftManufacturer)">
          <div>
            {{ aircraftManufacturer.manufacturer }} <span>({{ aircraftManufacturer.aircraft_count }})</span>
          </div>
        </div>
      </div>

      <div
        class="entry aircraft-types-wrapper"
        v-if="filterTabs.types">
        <div class="loader-wrapper" v-if="aircraftTypesLoading">
          <div>loading aircraft types ...</div>
          <div class="loader"><div></div><div></div></div>
        </div>

        <div
          class="list-entry"
          :class="{ active: selectedAircraftType == aircraftType }"
          v-for="aircraftType in aircraftTypes"
          @click="filterByType(aircraftType)">
          <div>
            {{ aircraftType.aircraft_type }} <span>({{ aircraftType.aircraft_count }})</span>
          </div>
        </div>
      </div>
    </div>

    <div class="aircraft-wrapper">
      <div class="header">
        Aircraft Models <small>({{ aircraftDataLength }}) ({{ yearRange }})</small>
      </div>

      <div class="aircraft-listing-wrapper">
        <div class="loader-wrapper" v-if="aircraftDataLoading">
          <div>loading aircraft ...</div>
          <div class="loader"><div></div><div></div></div>
        </div>

        <div
          class="aircraft-list-entry"
          :class="{ active: selectedAircraft == aircraft }"
          v-for="(aircraft) in aircraftData"
          :key="aircraft.id"
          :ref="setAircraftListRef(aircraft.id)"
          @click="visitArticle(aircraft)">
          <div>
            <span>{{ aircraft.model }}</span>
          </div>
        </div>
      </div>
    </div>

    <AircraftDetails v-if="selectedAircraft" :aircraftId="selectedAircraft.id" @closeDetails="closeDetails">
    </AircraftDetails>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { HttpRequest } from '@/services/http-request';
  import AircraftApi from '@/services/aircraft-api';
  import AircraftDetails from './AircraftDetails.vue';

  const activeTab = ref('manufacturers')
  const filterTabs = ref({
    "manufacturers": true,
    "types": false,
  });
  const yearRange = ref('...');
  const aircraftData = ref(null);
  const aircraftDataLength = ref('...');
  const aircraftDataGallery = ref(null);
  const aircraftManufacturers = ref(null);
  const aircraftTypes = ref(null);
  const selectedAircraft = ref(false);
  const selectedAircraftType = ref(false);
  const selectedAircraftManufacturer = ref(false);
  const aircraftDataLoading = ref(true);
  const aircraftTypesLoading = ref(true);
  const aircraftManufacturersLoading = ref(true);
  const aircraftList = ref(null);
  const aircraftListRefs = ref({});
  const setAircraftListRef = (id) => (element) => {
    if (element) {
      aircraftListRefs.value[id] = element;
    }
  };

  let currentAircraftNavigationIndex = 0;

  onMounted(() => {
    fetchAircraftManufacturers();
    fetchAircraftTypes();
    fetchAircraft();

    window.addEventListener('keydown', arrowKeysToChangeArcraft);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', arrowKeysToChangeArcraft);
  });

  function arrowKeysToChangeArcraft(event){
    if (event.code === 'ArrowDown'){
      if (!selectedAircraft.value){
        currentAircraftNavigationIndex = 0;
        visitArticle(aircraftData.value[0]);

        return null;
      }

      currentAircraftNavigationIndex = findSelectedAircraftInList();

      ++currentAircraftNavigationIndex;

      // End of list
      if (currentAircraftNavigationIndex === aircraftData.value.length){
        currentAircraftNavigationIndex = 0;
      }

      visitArticle(aircraftData.value[currentAircraftNavigationIndex]);
    }
    else if (event.code === 'ArrowUp'){
      if (!selectedAircraft.value){
        currentAircraftNavigationIndex = 0;
        visitArticle(aircraftData.value[0]);

        return null;
      }

      currentAircraftNavigationIndex = findSelectedAircraftInList();

      // End of list
      if (currentAircraftNavigationIndex === 0){
        currentAircraftNavigationIndex = aircraftData.value.length;
      }

      --currentAircraftNavigationIndex;

      visitArticle(aircraftData.value[currentAircraftNavigationIndex]);
    }
  }

  function findSelectedAircraftInList(){
    let index = 0;

    for (let entry of aircraftData.value){
      if(selectedAircraft.value === entry){
        break;
      }

      ++index;
    }

    return index;
  }

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

  async function fetchAircraftManufacturers(searchTerm = ''){
    const httpRequest = new HttpRequest();
    const aircraftApi = new AircraftApi(httpRequest);

    const data = await aircraftApi.fetchAircraftManufacturers();

    if('errors' in data){
      errors.value = data.errors
      return null;
    }

    setTimeout(function(){
      aircraftManufacturersLoading.value = false;
      aircraftManufacturers.value = data.data;
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
      // aircraftDataGallery.value = findFeaturedImages(result.data);
    }

    setTimeout(function(){
      aircraftDataLoading.value = false;
      aircraftData.value = result.data;
      aircraftDataLength.value = result.data.length;
      yearRange.value = `Years: ${result.metadata.first_flight_year_bounds.year_min} - ${result.metadata.first_flight_year_bounds.year_max}`;

      if (result.data.length === 1){
        visitArticle(result.data[0]);
      }
    }, randomInt(100, 200));
  }

  function visitArticle(aircraft){
    resetDetails();

    setTimeout(function(){
      selectedAircraft.value = aircraft;

      const elementToScroll = aircraftListRefs.value[selectedAircraft.value.id];
      elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  function filterByManufacturer(aircraftManufacturer){
    if (selectedAircraftManufacturer.value === aircraftManufacturer){
      selectedAircraftManufacturer.value = null;

      resetSelectedFilterBy();
      return fetchAircraft();
    }

    resetSelectedFilterBy();
    selectedAircraftManufacturer.value = aircraftManufacturer;

    resetDetails();
    return fetchAircraft({ manufacturer: aircraftManufacturer.manufacturer })
  }

  function filterByType(aircraftType){
    if (selectedAircraftType.value === aircraftType){
      selectedAircraftType.value = null;

      resetSelectedFilterBy();
      return fetchAircraft();
    }

    resetSelectedFilterBy();
    selectedAircraftType.value = aircraftType;

    resetDetails();
    return fetchAircraft({aircraft_type: aircraftType.aircraft_type})
  }

  function resetSelectedFilterBy(){
    selectedAircraftManufacturer.value = null;
    selectedAircraftType.value = null;
  }

  function selectFilterTab(tab){
    switch(tab){
      case 'manufacturers':
        filterTabs.value = {
          "manufacturers": true,
          "types": false,
        };

        activeTab.value = 'manufacturers';
        break;
      case 'types':
        filterTabs.value = {
          "manufacturers": false,
          "types": true,
        };

        activeTab.value = 'types';
        break;
    }
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
    width: 500px;
    left: 340px;
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
