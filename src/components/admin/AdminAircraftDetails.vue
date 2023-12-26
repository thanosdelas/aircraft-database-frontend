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
        <div class="loader-wrapper" v-if="summaryLoading">
          <div>loading summary ...</div>
          <div>
            <span class="loader"></span>
          </div>
        </div>
        {{ summary }}
      </div>
      <div class="images-wrapper">
        <div v-if="imagesError">{{ imagesError }}</div>
        <div class="loader-wrapper" v-if="imagesLoading">
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

  const summary = ref(null);
  const images = ref(null);
  const imagesError = ref(null);
  const summaryLoading = ref(true);
  const imagesLoading = ref(true);
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

    const result = await wikipedia.searchAircraftModel(data);
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
