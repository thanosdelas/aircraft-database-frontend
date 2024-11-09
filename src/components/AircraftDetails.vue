<template class="aircraft-details">
  <div v-if="aircraft" class="aircraft-details">
    <button @click="$emit('closeDetails')">Close</button>

    <h2>{{ aircraft.model }}</h2>

    <button @click="loadDatabaseDetails" class="loaded-from-button" :class="{active: detailsLoadedFrom === 'database'}">
      Database Details
    </button>
    <button @click="loadWikipediaDetails" class="loaded-from-button" :class="{active: detailsLoadedFrom === 'wikipedia'}">
      Wikipedia Details
    </button>

    <div class="image-wrapper">
      <img v-if="featured_image" :alt="featured_image.title" :src="featuredImageThumbnailURL(featured_image)" />
    </div>

    <div class="details-wrapper">
      <div><a target="_blank" :href="googleSearchURL">Google Search</a></div>
      <div class="details-entry" v-for="column in displayColumns">
        <div class="muted">{{ column }}</div>
        <div>{{ aircraft[column] }}</div>
      </div>
      <div class="summary">
        <div class="loader-wrapper" v-if="summaryLoading">
          <div>loading summary ...</div>
          <div>
            <span class="loader"></span>
          </div>
        </div>
        {{ summary }}
      </div>
      <div class="images-wrapper">
        <div class="loader-wrapper" v-if="imagesLoading">
          <span>loading images ...</span>
          <span class="loader"></span>
        </div>
        <div class="entry" v-for="image in images">
          <img :alt="image.title" :src="imageThumbnailURL(image)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { HttpRequest } from '@/services/http-request';
  import { WikipediaDetails } from '@/services/wikipedia-details';
  import AircraftApi from '@/services/aircraft-api';

  const httpRequest = new HttpRequest();
  const aircraftApi = new AircraftApi(httpRequest);

  const aircraft = ref(null);
  const detailsLoadedFrom = ref(null);
  const summary = ref(null);
  const images = ref(null);
  const featured_image = ref(null);
  const summaryLoading = ref(true);
  const imagesLoading = ref(true);
  const googleSearchURL = ref(null);
  const data = defineProps(['aircraftId']);
  const emits = defineEmits(['closeDetails']);

  const displayColumns = [
    "model",
  ];

  onMounted(() => {
    return loadDatabaseDetails();
  });

  async function loadDatabaseDetails(){
    images.value = null;
    summary.value = null;
    imagesLoading.value = true;
    summaryLoading.value = true;
    detailsLoadedFrom.value = 'database';

    const result = await aircraftApi.fetch(data.aircraftId);
    if('errors' in result){
      console.log('Could not fetch aricraft');
      console.log(result);
      return null;
    }

    aircraft.value = result

    googleSearchURL.value = `https://www.google.com/search?q=${ aircraft.value.model }`;

    images.value = aircraft.value.images

    const MAX_CHARS = 450
    var description = aircraft.value.description;
    if (aircraft.value.description.length > MAX_CHARS){
      description = aircraft.value.description.substr(0, MAX_CHARS) + "\u2026";
    }

    summary.value = description

    imagesLoading.value = false;
    summaryLoading.value = false;

    if(aircraft.value.images.length > 0){
      featured_image.value = aircraft.value.images[0];
    }

    // NOTE: Featured images are not always saved inside images.
    if(aircraft.value.featured_image.length > 0){
      aircraft.value.images.forEach((image) => {
        if(
          image.filename === aircraft.value.featured_image ||
          image.filename === `File:${ aircraft.value.featured_image }`
        ){
          featured_image.value = image;
        }
      });
    }
  }

  async function loadWikipediaDetails(){
    images.value = null;
    summary.value = null;
    imagesLoading.value = true;
    summaryLoading.value = true;
    detailsLoadedFrom.value = 'wikipedia';

    const httpRequest = new HttpRequest();
    const wikipedia = new WikipediaDetails(httpRequest);

    const result = await wikipedia.searchAircraftModel(aircraft.value.model);
    if('errors' in result){
      summaryLoading.value = false;
      imagesLoading.value = false;
      console.log("Render errors: ", result);
      return null;
    }

    const title = result.title;
    const pageId = result.pageid;

    //
    // Load Summary
    //
    const summaryResult = await wikipedia.summary(pageId);
    summaryLoading.value = false;
    if('data' in summaryResult){ summary.value = summaryResult.data; }
    if('errors' in summaryResult){ summary.value = 'Could not find summary'; }

    //
    // Load Images
    //
    const imagesResult = await wikipedia.fetchImages(title, pageId);
    imagesLoading.value = false;

    if('errors' in imagesResult){
      imagesError.value = 'No images found';
      return null;
    }

    images.value = imagesResult.data
  }

  /**
   * Generate image thumbnail URL from existing image URL, eg.:
   * original: https://upload.wikimedia.org/wikipedia/commons/0/0a/Lockheed_R7V-2_turboprop_Connie_in_flight_c1953.jpeg
   * thumbnail: https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Lockheed_R7V-2_turboprop_Connie_in_flight_c1953.jpeg/300px-Lockheed_R7V-2_turboprop_Connie_in_flight_c1953.jpeg
   */
  function imageThumbnailURL(image){
    if(image.url.indexOf('.svg') !== -1){
      return image.url;
    }

    return image.url.split('commons').join('commons/thumb')+'/250px-'+image.filename.replace('File:','').replace(/ /g,"_");
  }

  function featuredImageThumbnailURL(image){
    if(image.url.indexOf('.svg') !== -1){
      return image.url;
    }

    return image.url.split('commons').join('commons/thumb')+'/500px-'+image.filename.replace('File:','').replace(/ /g,"_");
  }
</script>

<style scoped>
  .aircraft-details{
    position: fixed;
    width: 45%;
    background: #333;
    top: 0;
    height: 100%;
    right: 0;
    overflow-y: scroll;
    padding: 10px;
  }
  .aircraft-details .image-wrapper{
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: #262522;
  }
  .aircraft-details .image-wrapper img{
    width: 512px;
  }
  .details-wrapper{
    display: block;
  }
  .details-entry{
    display: flex;
    justify-content: space-between;
    background: #49463e;
    padding: 10px;
  }
  .muted{
    opacity: .6;
    margin-right: 10px;
  }
  .images-wrapper{
    margin-top: 10px;
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  .images-wrapper .entry{
  }
  .images-wrapper .entry img{
    width: 100%;
  }
  .summary{
    background: #1b1b1a;
    padding: 10px;
    height: 200px;
    overflow: hidden;

  }
  .loaded-from-button{
    background: #afa485;
    border: none;
  }
  .loaded-from-button.active{
    background: #8b7e5a;
  }
</style>
