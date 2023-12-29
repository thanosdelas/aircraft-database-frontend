<template>
  <div class="aircraft-details">
    <div class="header">
      <button @click="$emit('closeDetails')">Close</button>
      <button @click="edit" v-if="!editMode">Edit</button>
      <button @click="edit" v-if="editMode">Cancel</button>
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

      <div class="images-wrapper" :class="{ 'edit-mode': editMode }">
        <div v-if="imagesError">{{ imagesError }}</div>
        <div class="loader-wrapper" v-if="imagesLoading">
          <span>loading images ...</span>
          <span class="loader"></span>
        </div>

        <div v-if="editMode" class="edit-images">
          Please select images to import

          <div v-for="error in imageErrors">
            {{ error.message }}
          </div>

          <button @click="saveImages">Save</button>
        </div>

        <div class="images">
          <div class="entry" :class="{ selected: image.selected, saved: image.saved }" v-for="image in images" @click="selectImage(image)">
            <div class="image-saved-label" v-if="image.saved">Saved</div>
            <img :alt="image.title" :src="image.url" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, computed, onMounted } from 'vue';
  import { HttpRequest } from '@/services/http-request';
  import { WikipediaDetails } from '@/services/wikipedia-details';
  import Authentication from '@/services/authentication';
  import AircraftApiAdmin from '@/services/aircraft-api-admin';

  const imageErrors = ref(null);
  const summary = ref(null);
  const images = ref(null);
  const imagesError = ref(null);
  const editMode = ref(false);
  const summaryLoading = ref(true);
  const imagesLoading = ref(true);
  const selectedImages = ref([]);
  const data = defineProps(['aircraft']);
  const emits = defineEmits(['closeDetails']);

  const displayColumns = [
    "model",
  ];

  /**
   * TODO:
   * Load saved images from database,
   * and apply saved state to images loaded from Wikipedia.
   */
  onMounted(() => {
    return loadWikipediaDetails();
  });

  function edit(){
    editMode.value = !editMode.value;
    resetSelectedImages();
  }

  function selectImage(image){
    if (editMode.value == false){
      return null
    };

    updateSelectedImages(image);
    updateImages();
  }

  function updateSelectedImages(image){
    const findSelectedImage = selectedImages.value.filter((selectedImage) => {
      return selectedImage.title === image.title;
    });

    if(findSelectedImage.length === 0){
      return appendSelectedImage(image);
    }

    if(findSelectedImage.length === 1){
      for(let index = 0; index < selectedImages.value.length; index++){
        if(selectedImages.value[index].title === image.title){
          return removeSelectedImage(index);
        }
      }
    }
  }

  function appendSelectedImage(image){
    selectedImages.value.push({
      title: image.title,
      url: image.url
    });
  }

  function removeSelectedImage(index){
    selectedImages.value.splice(index, 1);
  }

  function updateImages(){
    for(let y = 0; y < images.value.length; y++){
      let foundImage = false;

      for(let x = 0; x < selectedImages.value.length; x++){
        if(selectedImages.value[x].title === images.value[y].title){
          foundImage = true;
          images.value[y].selected = true;
          break;
        }
      }

      if(foundImage === false){
        images.value[y].selected = false;
      }
    }
  }

  function updateSavedImages(savedImages){
    for(let x = 0; x < images.value.length; x++){
      for(let y = 0; y < savedImages.length; y++){
        if(images.value[x].url === savedImages[y].url){
          images.value[x].saved = true;
        }
      }
    }
  }

  function resetSelectedImages(){
    selectedImages.value = [];

    for(let y = 0; y < images.value.length; y++){
      images.value[y].selected = false;
    }
  }

  async function saveImages(){
    const httpRequest = new HttpRequest();
    const authentication = new Authentication();
    const aircraftApi = new AircraftApiAdmin(httpRequest, authentication);

    imageErrors.value = null
    const result = await aircraftApi.saveImages(data.aircraft.id, selectedImages.value);

    if('errors' in result){
      imageErrors.value = result.errors
      return null;
    }

    edit(); // Toggle Off. Find a better solution or naming.
    return updateSavedImages(result.data);
  }

  async function loadWikipediaDetails(){
    const httpRequest = new HttpRequest();
    const wikipedia = new WikipediaDetails(httpRequest);

    const result = await wikipedia.searchAircraftModel(data);
    if('errors' in result){
      summaryLoading.value = false;
      imagesLoading.value = false;
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
  .edit-mode{
    border: 10px solid #be6236;
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
    display: block;
  }
  .images{
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  .images .entry{
    display: block;
    position: relative;
  }
  .images .entry.selected{
    padding: 10px;
    background: #7ed54b;
  }
  .images .entry.saved{
  }
  .image-saved-label{
    background: rgb(159 239 45 / 44%);
    color: #000;
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    display: table;
    vertical-align: middle;
    padding: 20px;
  }
  .summary{
    background: #1b1b1a;
    padding: 10px;
  }
  .edit-images{
    background: #be6236;
    padding: 20px;
  }
</style>
