<template>
  <div>

    <div v-if="geocoding">

      <base-select v-model="regionLevelFirst"
                   :options="regionLevelOptionsFirst"></base-select>

      <base-select v-model="regionLevelSecond"
                   :options="regionLevelFirst ? regionLevelOptionsSecond[regionLevelFirst] : null"
                   :disabled="regionLevelFirst === null"></base-select>

      <base-select v-model="regionLevelThird"
                   :options="regionLevelFirst && regionLevelSecond ? regionLevelOptionsThird[regionLevelFirst][regionLevelSecond] : null"
                   :disabled="regionLevelSecond === null"></base-select>

      <p v-if="location" class="text-white">{{ $t('locationAddress.yourPostalCode', {ignore_postalcode: location})
        }}</p>
    </div>

    <div v-else>
      <p class="text-white">Loading...</p>
    </div>
  </div>
</template>

<script>

  export default {
    name: "location-from-address",
    components: {},
    props: {
      location: null,
      valid: Boolean,
    },
    methods: {
      locationChanged(value) {
        //this.$emit('update:valid', ...);
        //this.$emit('update:location', value);
      }
    },
  }
</script>

<style>

</style>
