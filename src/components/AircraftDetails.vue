<template class="aircraft-details">
  <div class="aircraft-details">
    <button @click="$emit('closeDetails')">Close</button>

    <h2>{{ aircraft.model }}</h2>

    <button @click="loadDatabaseDetails" class="loaded-from-button" :class="{active: detailsLoadedFrom === 'database'}">
      Database Details
    </button>
    <button @click="loadWikipediaDetails" class="loaded-from-button" :class="{active: detailsLoadedFrom === 'wikipedia'}">
      Wikipedia Details
    </button>

    <img v-if="featured_image" :alt="featured_image.title" :src="featuredImageThumbnailURL(featured_image)" />

    <div class="details-wrapper">
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

  const detailsLoadedFrom = ref(null);
  const summary = ref(null);
  const images = ref(null);
  const featured_image = ref(null);
  const summaryLoading = ref(true);
  const imagesLoading = ref(true);
  const data = defineProps(['aircraft']);
  const emits = defineEmits(['closeDetails']);

  const displayColumns = [
    "model",
  ];

  onMounted(() => {
    return loadDatabaseDetails();
  });

  function loadDatabaseDetails(){
    images.value = null;
    summary.value = null;
    imagesLoading.value = true;
    summaryLoading.value = true;
    detailsLoadedFrom.value = 'database';

    images.value = data.aircraft.images
    summary.value = data.aircraft.description

    imagesLoading.value = false;
    summaryLoading.value = false;

    if(data.aircraft.images.length > 0){
      featured_image.value = data.aircraft.images[0];
    }

    if(data.aircraft.featured_image.length > 0){
      data.aircraft.images.forEach((image) => {
        if(image.filename === `File:${ data.aircraft.featured_image }`){
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

    const result = await wikipedia.searchAircraftModel(data.aircraft);
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
  .aircraft-details img{
    width: 100%;
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
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  .summary{
    background: #1b1b1a;
    padding: 10px;
  }
  .loaded-from-button{
    background: #afa485;
    border: none;
  }
  .loaded-from-button.active{
    background: #8b7e5a;
  }
</style>
