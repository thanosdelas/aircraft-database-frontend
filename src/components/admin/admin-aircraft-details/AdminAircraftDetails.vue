<style scoped>@import './styles.css';</style>
<template>
  <div class="aircraft-details">
    <div class="header">
      <h2>{{ aircraft.model }}</h2>

      <div class="actions">
        <button @click="$emit('closeDetails')">Close</button>
        <button @click="editEnable" v-if="!editMode">Edit</button>
        <button @click="editDisable" v-if="editMode">Cancel</button>
        <button @click="saveImages" v-if="editMode">Save</button>
      </div>
    </div>

    <div v-if="loadDetailsErrors" class="error-wrapper">
      <div v-for="error in loadDetailsErrors">
        {{ error.message }}
      </div>
    </div>

    <div class="details-wrapper">
      <div><a target="_blank" :href="googleSearchURL">Google Search</a></div>
      <div v-if="wikipediaPageResult">
        <div><a target="_blank" :href="wikipediaPageResult.page_url">Wikipedia Page</a></div>
        <pre>{{ wikipediaPageResult }}</pre>
      </div>

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

        <button class="small" @click="showDescription = !showDescription">
          {{ showDescription ? 'Hide images description' : 'Show images description' }}
        </button>

        <div v-if="editMode" class="edit-images">
          <span style="color: black;">
            Please select images to import
          </span>

          <div v-for="error in saveImageErrors">
            {{ error.message }}
          </div>
        </div>

        <div class="images">
          <div class="entry" :class="{ selected: image.selected, saved: image.saved }" v-for="image in images" @click="selectImage(image)">
            <div class="inner">
              <img :alt="image.title" :src="imageThumbnailURL(image)" />
            </div>
            <div class="image-saved-label" v-if="image.saved">
              <div class="image-saved-label-inner">Saved</div>
            </div>

            <div class="description" v-if="showDescription && image.description">{{ image.description }}</div>
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
  const showDescription = ref(false)
  const imagesError = ref(null);
  const editMode = ref(false);
  const summaryLoading = ref(true);
  const imagesLoading = ref(true);
  const selectedImages = ref([]);
  const wikipediaPageResult = ref(null);
  const googleSearchURL = ref(null);

  const displayColumns = [
    "model",
  ];

  onMounted(async () => {
    const loadDetailsResult = await adminAircraftDetails.loadDetails();

    if('errors' in loadDetailsResult){
      loadDetailsErrors.value = loadDetailsResult.errors
    }

    googleSearchURL.value = `https://www.google.com/search?q=${ data.aircraft.model }`;
    wikipediaPageResult.value = adminAircraftDetails.wikipediaPageResult;
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

    adminAircraftDetails.selectImage({
      url: image.url,
      filename: image.filename,
      description: image.description
    });

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

  /**
   * Generate image thumbnail URL from existing image URL, eg.:
   * original: https://upload.wikimedia.org/wikipedia/commons/0/0a/Lockheed_R7V-2_turboprop_Connie_in_flight_c1953.jpeg
   * thumbnail: https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Lockheed_R7V-2_turboprop_Connie_in_flight_c1953.jpeg/300px-Lockheed_R7V-2_turboprop_Connie_in_flight_c1953.jpeg
   */
  function imageThumbnailURL(image){
    if(image.url.indexOf('.svg') !== -1){
      return image.url;
    }

    return image.url.split('commons').join('commons/thumb')+'/150px-'+image.filename.replace('File:','').replace(/ /g,"_");
  }
</script>
