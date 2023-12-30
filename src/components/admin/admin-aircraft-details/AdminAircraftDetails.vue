<template>
  <div class="aircraft-details">
    <div class="header">
      <button @click="$emit('closeDetails')">Close</button>
      <button @click="editEnable" v-if="!editMode">Edit</button>
      <button @click="editDisable" v-if="editMode">Cancel</button>
    </div>

    <h2>{{ aircraft.model }}</h2>

    <div v-if="loadDetailsErrors" class="error-wrapper">
      <div v-for="error in loadDetailsErrors">
        {{ error.message }}
      </div>
    </div>

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

          <div v-for="error in saveImageErrors">
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
  import { AdminAircraftDetails } from '@/components/admin/admin-aircraft-details/admin-aircraft-details';
  import Authentication from '@/services/authentication';
  import AircraftApiAdmin from '@/services/aircraft-api-admin';

  const data = defineProps(['aircraft']);
  const emits = defineEmits(['closeDetails']);
  const adminAircraftDetails = new AdminAircraftDetails(data.aircraft);

  const loadDetailsErrors = ref(null);
  const saveImageErrors = ref(null);
  const summary = ref(null);
  const images = ref(null);
  const imagesError = ref(null);
  const editMode = ref(false);
  const summaryLoading = ref(true);
  const imagesLoading = ref(true);
  const selectedImages = ref([]);

  const displayColumns = [
    "model",
  ];

  onMounted(async () => {
    const loadDetailsResult = await adminAircraftDetails.loadDetails();

    if('errors' in loadDetailsResult){
      loadDetailsErrors.value = loadDetailsResult.errors
    }

    imagesError.value = adminAircraftDetails.imagesError;
    images.value = adminAircraftDetails.getImages();
    summary.value = adminAircraftDetails.summary;
    imagesLoading.value = adminAircraftDetails.imagesLoading;
    summaryLoading.value = adminAircraftDetails.summaryLoading;
  });

  function editEnable(){
    editMode.value = true;
    adminAircraftDetails.initializeEdit();

    return updateImagesValue();
  }

  function editDisable(){
    editMode.value = false;
    adminAircraftDetails.resetEdit();

    return updateImagesValue();
  }

  function selectImage(image){
    if (editMode.value == false){
      return null
    };

    adminAircraftDetails.selectImage({ url: image.url, filename: image.filename });

    return updateImagesValue();
  }

  async function saveImages(){
    const result = await adminAircraftDetails.saveImages();

    if('errors' in result){
      saveImageErrors.value = result.errors
      return false;
    }

    return editDisable();
  }

  function updateImagesValue(){
    images.value = JSON.parse(JSON.stringify(adminAircraftDetails.getImages()));
  }
</script>

<style scoped>
  .error-wrapper{
    background: #942d2d;
    padding: 20px;
  }

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
