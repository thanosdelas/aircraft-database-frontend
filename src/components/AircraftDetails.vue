<template class="aircraft-details">
  <div class="aircraft-details">
    <button @click="$emit('closeDetails')">Close</button>

    <h2>{{ aircraft.model }}</h2>

    <div class="details-wrapper">
      <div class="details-entry" v-for="column in displayColumns">
        <div class="muted">{{ column }}</div>
        <div>{{ aircraft[column] }}</div>
      </div>
      <div class="summary">{{ summary }}</div>
      <div class="images-wrapper">
        <div class="entry" v-for="image in images">
          <img :src="image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';

  const summary = ref(null)
  const images = ref(null);
  const data = defineProps(['aircraft']);
  const emits = defineEmits(['closeDetails']);

  const displayColumns = [
    "model",
  ];

  onMounted(() => {
    return loadWikipediaDetails();
  });

  async function loadWikipediaDetails(){
    console.log("going to search ... ");

    try{
      const results = await searchAircraftModel();

      if(results.query.search.length === 0){
        alert('Could not find anything');
        return null;
      }

      const title = results.query.search[0].title;
      const pageId = results.query.search[0].pageid;

      summary.value = await contentSummary(pageId);

      const imageFilenames = await fetchImageFilenames(title, pageId);
      if(imageFilenames.length === 0){
        alert('Could not find any images');
        return false;
      }

      const imageURLs = await fetchImageURLs(imageFilenames);

      if(imageURLs.length === 0){
        alert('Could not find any images');
        return false;
      }

      console.log(imageURLs);

      images.value = imageURLs;
    }
    catch(error){
      console.log("Could not fetch results from Wikipedia");
      console.log(error);
    }
  }

  //
  // The following functions should be private.
  //

  async function contentSummary(pageId){
    // const API_URL = `https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&pageids=${pageId}`
    const params = {
      format: 'json',
      action: 'query',
      origin: '*',
      prop: 'extracts',
      exintro: true,
      explaintext: true,
      redirects: 1,
      pageids: pageId
    };

    const searchParams = new URLSearchParams(params);
    const API_URL = `https://en.wikipedia.org/w/api.php?${ searchParams.toString() }`

    const response = await fetch(API_URL);
    const results = await response.json();

    if(pageId in results.query.pages){
      return results.query.pages[pageId].extract
    }

    return '';
  }

  async function searchAircraftModel(){
    // const searchTerm = `aircraft model ${ data.aircraft.manufacturername } ${ data.aircraft.model }`;
    const searchTerm = `${ data.aircraft.model }`;
    const params = {
      format: 'json',
      action: 'query',
      origin: '*',
      list: 'search',
      srsearch: searchTerm
    };

    const searchParams = new URLSearchParams(params);
    const API_URL = `https://en.wikipedia.org/w/api.php?${ searchParams.toString() }`

    const response = await fetch(API_URL);
    const results = await response.json();
    console.log("Search term: ", searchTerm);
    console.log("Results from searchAircraftModel: ", results);

    return results;
  }

  async function fetchImageFilenames(title, pageId){
    const params = {
      format: 'json',
      action: 'query',
      origin: '*',
      imlimit: 20,
      prop: 'images',
      titles: title
    };

    const searchParams = new URLSearchParams(params);
    const API_URL = `https://en.wikipedia.org/w/api.php?${ searchParams.toString() }`

    const response = await fetch(API_URL);
    const results = await response.json();
    console.log("[*] fetchImageFilenames: ", API_URL);
    console.log("[*] fetchImageFilenames: ", results);

    let collectImages = [];
    for(let x = 0; x < results.query.pages[pageId].images.length; x++){
      collectImages.push(results.query.pages[pageId].images[x].title);
    }

    return collectImages;
  }

  async function fetchImageURLs(imageFilenames){
    const images = [];

    const params = {
      format: 'json',
      action: 'query',
      origin: '*',
      prop: 'imageinfo',
      iiprop: 'url',
      titles: imageFilenames.join('|')
    }

    const API_URL = `https://en.wikipedia.org/w/api.php?${ new URLSearchParams(params).toString() }`

    const response = await fetch(API_URL);
    const results = await response.json();
    if(Object.keys(results.query.pages).length === 0){
      return images;
    }

    for(const key in results.query.pages){
      if(
        results.query.pages[key].imageinfo.length === 1 &&
        !/flag/i.test(results.query.pages[key].imageinfo[0].url) &&
        !/edit/i.test(results.query.pages[key].imageinfo[0].url) &&
        !/commons-logo/i.test(results.query.pages[key].imageinfo[0].url) &&
        !/Aviacionavion/i.test(results.query.pages[key].imageinfo[0].url)
      ){
        images.push(results.query.pages[key].imageinfo[0].url)
      }
    }

    return images.reverse();
  }
</script>

<style>
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
    background: #6e715e;
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
</style>
