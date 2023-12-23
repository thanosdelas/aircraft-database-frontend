<template class="aircraft-details">
  <div class="aircraft-details">
    <div class="header">
      <button @click="$emit('closeDetails')">Close</button>
    </div>

    <h2>{{ aircraft.model }}</h2>

    <div class="details-wrapper">
      <div class="details-entry" v-for="column in displayColumns">
        <div class="muted">{{ column }}</div>
        <div>{{ aircraft[column] }}</div>
      </div>
      <div class="summary">
        <div class="loader-wrapper" v-if="!summary">
          <div>loading summary ...</div>
          <div>
            <span class="loader"></span>
          </div>
        </div>
        {{ summary }}
      </div>
      <div class="images-wrapper">
        <div class="loader-wrapper" v-if="!images">
          <span>loading images ...</span>
          <span class="loader"></span>
        </div>
        <div class="entry" v-for="image in images">
          <img :src="image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { WikipediaDetails } from '@/services/wikipedia-details';

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
    const wikipedia = new WikipediaDetails();

    try{
      const results = await wikipedia.searchAircraftModel(data);
      if(results.query.search.length === 0){
        alert('Could not find anything');
        return null;
      }

      const title = results.query.search[0].title;
      const pageId = results.query.search[0].pageid;

      //
      // Load Summary
      //
      summary.value = await wikipedia.contentSummary(pageId);

      //
      // Load Images
      //
      const imageFilenames = await wikipedia.fetchImageFilenames(title, pageId);
      if(imageFilenames.length === 0){
        alert('Could not find any images');
        return false;
      }

      const imageURLs = await wikipedia.fetchImageURLs(imageFilenames);

      if(imageURLs.length === 0){
        alert('Could not find any images');
        return false;
      }

      images.value = imageURLs;
    }
    catch(error){
      console.log("Could not fetch results from Wikipedia");
      console.log(error);
    }
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
  }
  .aircraft-details .header{
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
  }
  .aircraft-details .header button{
    margin-left: 10px;
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
</style>
