<template class="aircraft-details">
  <div v-if="aircraft" class="aircraft-details">
    <div class="header">
      <div></div>
      <button class="button-close" @click="$emit('closeDetails')"><i class='bx bx-x'></i></button>
    </div>

    <div v-if="false">
      <button @click="loadDatabaseDetails" class="loaded-from-button" :class="{active: detailsLoadedFrom === 'database'}">
        Database Details
      </button>
      <button @click="loadWikipediaDetails" class="loaded-from-button" :class="{active: detailsLoadedFrom === 'wikipedia'}">
        Wikipedia Details
      </button>
    </div>

    <div class="image-wrapper-old-tv-and-vcr-effects" v-if="true">
      <h2>{{ aircraft.model }}</h2>
      <OldTvAndVcrEffects :featured_image_url="featuredImageThumbnailURL(featured_image)" ref="oldTvAndVcrEffectsComponent">
      </OldTvAndVcrEffects>
    </div>

    <div class="image-wrapper" v-if="false">
      <div class="image-wrapper-overlay"></div>
      <div v-if="imagesLoading" class="loader"><div></div><div></div></div>
      <img v-if="featured_image && !imagesLoading" :alt="featured_image.title" :src="featuredImageThumbnailURL(featured_image)" />
    </div>

    <div class="details-wrapper">
      <div class="details-entry">
        <h3>{{ aircraft.model }}</h3>
      </div>

      <div class="details-entry" v-for="column in displayColumns">
        <div class="muted">{{ column }}</div>
        <div>{{ aircraft[column] }}</div>
      </div>

      <div class="aircraft-types" v-if="aircraft.types.length > 0">
        <span v-for="aircraft_type in aircraft.types">
          {{ aircraft_type.aircraft_type }}
        </span>
      </div>

      <div class="aircraft-fields-wrapper">
        <div class="fields-entry">
          <div>First flight:</div>
          <div>{{ aircraft.first_flight_raw }}</div>
        </div>

        <div class="fields-entry" v-for="(fieldValue, fieldTitle) in infoboxJSON">
          <div>{{ fieldTitle }}:</div>
          <div>{{ fieldValue || '-' }}</div>
        </div>
      </div>

      <div class="summary">
        <div class="loader-wrapper" v-if="summaryLoading">
          <div>loading summary ...</div>
          <div class="loader"><div></div><div></div></div>
        </div>

        <div v-if="!summaryLoading">{{ summary }}</div>
      </div>

      <div class="external-links">
        <div v-if="wikipediaPage"><a target="_blank" :href="wikipediaPage"><i class='bx bxl-wikipedia'></i> Wikipedia <i class='bx bx-link-external'></i></a></div>
        <div><a target="_blank" :href="googleSearchURL"><i class='bx bxl-google'></i> Google Search <i class='bx bx-link-external'></i></a></div>
        <div><a target="_blank" :href="googleImagesSearchURL"><i class='bx bxl-google'></i> Google Images Search <i class='bx bx-link-external'></i></a></div>
      </div>

      <div class="images-wrapper" v-if="images.length > 2">
        <div class="loader-wrapper" v-if="imagesLoading">
          <span>loading images ...</span>
          <div class="loader"><div></div><div></div></div>
        </div>
        <div class="entry" v-for="image in images" v-if="!imagesLoading">
          <img :alt="image.title" :src="imageThumbnailURL(image)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import OldTvAndVcrEffects from '@/components/OldTvAndVcrEffects.vue';
  import { ref, onMounted, onUnmounted } from 'vue';
  import { HttpRequest } from '@/services/http-request';
  import { WikipediaDetails } from '@/services/wikipedia-details';
  import AircraftApi from '@/services/aircraft-api';

  const httpRequest = new HttpRequest();
  const aircraftApi = new AircraftApi(httpRequest);

  let currentImageNavigationIndex = 0;
  const aircraft = ref(null);
  const detailsLoadedFrom = ref(null);
  const infoboxJSON = ref(null);
  const summary = ref(null);
  const images = ref(null);
  const featured_image = ref(null);
  const summaryLoading = ref(true);
  const imagesLoading = ref(true);
  const googleSearchURL = ref(null);
  const googleImagesSearchURL = ref(null);
  const wikipediaPage = ref(null);
  const data = defineProps(['aircraftId']);
  const emits = defineEmits(['closeDetails']);
  const oldTvAndVcrEffectsComponent = ref(null);

  const displayColumns = [
  ];

  const displayInfoboxJsonFields = {
    'name': 'Name',
    'national_origin': 'National Origin',
    'introduction': 'Introduction',
    'status': 'Status',
    'produced': 'Produced',
    'primary_user': 'Primary User',
    'more_users': 'More Users',
    'number_built': 'Number Built',
    'developed_from': 'Developed From',
    'developed_into': 'Developed Into',
    'retired': 'Retired',
    'variants': 'Variants',
    'produced': 'Produced',
    'unit_cost': 'Unit Cost'
  }

  onMounted(() => {
    window.addEventListener('keydown', arrowKeysToChangeFeaturedImage);

    return loadDatabaseDetails();
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', arrowKeysToChangeFeaturedImage);
  });

  function arrowKeysToChangeFeaturedImage(event){
    if (event.code === 'ArrowRight'){
      ++currentImageNavigationIndex;

      // End of list
      if (currentImageNavigationIndex === images.value.length){
        currentImageNavigationIndex = 0;
      }

      featured_image.value = images.value[currentImageNavigationIndex];
      oldTvAndVcrEffectsComponent.value.changeImage(featured_image.value);
    }
    else if (event.code === 'ArrowLeft'){
      // End of list
      if (currentImageNavigationIndex === 0){
        currentImageNavigationIndex = images.value.length;
      }

      --currentImageNavigationIndex;

      featured_image.value = images.value[currentImageNavigationIndex];
      oldTvAndVcrEffectsComponent.value.changeImage(featured_image.value);
    }
  }

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

    const collectInfoboxFields = {}
    const infoboxJSONParsed = JSON.parse(aircraft.value.infobox_json)
    for(const key in infoboxJSONParsed){
      if(
        typeof infoboxJSONParsed[key] !== 'undefined' &&
        typeof displayInfoboxJsonFields[key] !== 'undefined' &&
        infoboxJSONParsed[key].length > 0
      ){
        console.log(displayInfoboxJsonFields[key]);
      console.log(infoboxJSONParsed[key]);
        collectInfoboxFields[displayInfoboxJsonFields[key]] = infoboxJSONParsed[key];
      }
    }

    infoboxJSON.value = collectInfoboxFields;

    console.log(collectInfoboxFields);

    googleSearchURL.value = `https://www.google.com/search?q=${ aircraft.value.model }`;
    googleImagesSearchURL.value = `https://www.google.com/search?tbm=isch&q=${ aircraft.value.model }`;
    wikipediaPage.value = `https://en.wikipedia.org/?curid=${ aircraft.value.wikipedia_page_id }`

    images.value = aircraft.value.images

    const MAX_CHARS = 450
    var description = aircraft.value.description;
    if (aircraft.value.description.length > MAX_CHARS){
      description = aircraft.value.description.substr(0, MAX_CHARS) + "\u2026";
    }

    summary.value = description
    summaryLoading.value = false;

    if(aircraft.value.images.length > 0){
      featured_image.value = aircraft.value.images[0];
    }

    // NOTE: Featured images are not always saved inside images.
    if(aircraft.value.featured_image !== null && aircraft.value.featured_image.length > 0){
      aircraft.value.images.forEach((image) => {
        if(
          image.filename === aircraft.value.featured_image ||
          image.filename === `File:${ aircraft.value.featured_image }`
        ){
          featured_image.value = image;
        }
      });
    }

    setTimeout(function(){ imagesLoading.value = false; }, randomInt(257, 555));
    setTimeout(function(){ summaryLoading.value = false; }, randomInt(678, 1211));
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
    if (image === null){
      return '';
    }

    if(image.url.indexOf('.svg') !== -1){
      return image.url;
    }

    return image.url.split('commons').join('commons/thumb')+'/250px-'+image.filename.replace('File:','').replace(/ /g,"_");
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
</script>

<style scoped>
  .aircraft-details .image-wrapper-overlay{
    /*background: rgba(0,0,0,0.7343312324929971) url(dark-mosaic.png) repeat;*/
    background: url(3px-tile.png) repeat;
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: .22;
  }

  .image-wrapper-old-tv-and-vcr-effects{
    background: #000;
    padding: 10px;
  }

  .image-wrapper-old-tv-and-vcr-effects h2{
    font-size: 15px;
    margin-top: 12px;
    margin-left: 19px;
    text-shadow: 2px 1px 1px #000;
    z-index: 999;
    position: absolute;
    color: #efbd2d;
  }

  .aircraft-details .image-wrapper{
    position: relative;
    overflow: hidden;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #262522 url('dark-mosaic.png') repeat;
    /*background: #262522 url('3px-tile.png') repeat;*/
    /*background: #2f2d28 url(3px-tile.png) repeat;*/
    /*background: #49463e url('dark-mosaic.png') repeat;*/
    /*background: url(dark-mosaic.png), repeat url(3px-tile.png) repeat, #595447;*/
    background-image: url(3px-tile.png), url(dark-mosaic.png);
    background-repeat: repeat, repeat;
    background-color: #77705e;
    background-color: #2d2b27;
    border-radius: 32px;
    padding: 20p;
    margin: 12px;

    height: 400px;
  }
  .aircraft-details .image-wrapper img{
    width: 100%;
    padding: 19px;
    border-radius: 30%;
    /*height: 363px;*/
    /*box-shadow: -20px 0px 20px 0px inset #636059;*/
  }
  .details-wrapper{
    display: block;
  }
    .details-entry{
    display: flex;
    justify-content: space-between;
    background: #49463e;
    padding: 10px;
    color: #c7c5be;
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
    padding: 8px;
    border-radius: 21%;
    opacity: 0.9;
  }
  .summary{
    overflow: hidden;
    color: #99968b;
    border-top: 5px solid #49463e;
    border-bottom: 5px solid #49463e;
    margin-top: 14px;
  }
  .loaded-from-button{
    background: #afa485;
    border: none;
  }
  .loaded-from-button.active{
    background: #8b7e5a;
  }
  .aircraft-types{
    padding: 10px 0px;
    /*background: #222;*/
  }
  .aircraft-types span{
    background: #49463e;
    margin-right: 5px;
    padding: 4px 7px;
    font-size: 12px;
    display: inline-block;
    margin-bottom: 5px;
  }
  .external-links{
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    display: flex;
    align-items: center;
    padding: 10px 0px;
  }
  .external-links a{
    font-size: 12px;
  }
  .aircraft-fields-wrapper{
    display: block;
    position: relative;
    overflow: hidden;
    max-width: 80%;
    color: #daaf32;
    font-size: 12px;
  }
  .aircraft-fields-wrapper .fields-entry{
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px dashed #776635;
  }
  .aircraft-fields-wrapper .fields-entry div{
    width: 50%;
  }
</style>
