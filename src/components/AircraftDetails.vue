<template class="aircraft-details">
  <div class="aircraft-details">
    <button @click="$emit('closeDetails')">Close</button>

    <h2>{{ aircraft.manufacturericao }} / {{ aircraft.manufacturername }} / {{ aircraft.model }}</h2>

    <div class="details-wrapper">
      <div class="details-entry" v-for="column in displayColumns">
        <div class="muted">{{ column }}</div>
        <div>{{ aircraft[column] }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
  const data = defineProps(['aircraft']);
  const emits = defineEmits(['closeDetails']);

  const displayColumns = [
    "icao24",
    "registration",
    "manufacturericao",
    "manufacturername",
    "model",
    "typecode",
    "serialnumber",
    "linenumber",
    "icaoaircrafttype",
    "operator",
    "operatorcallsign",
    "operatoricao",
    "operatoriata",
    "owner",
    "testreg",
    "registered",
    "reguntil",
    "status",
    "built",
    "firstflightdate",
    "seatconfiguration",
    "engines",
    "modes",
    "adsb",
    "acars",
    "notes",
    "categoryDescription"
  ];
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
    background: #28375b;
    padding: 10px;
  }

  .details-entry{
    display: flex;
    justify-content: space-between;
    max-width: 300px;
  }

  .muted{
    opacity: .6;
    margin-right: 10px;
  }
</style>
