<template>
  <div>

    <div class="row mt-3" v-if="step === 1">
      <div class="col-lg-9">
        <h3>One</h3>

        <base-button class="mt-2"
                     type="secondary"
                     @click="step++">
          Next
        </base-button>
      </div>
    </div>


    <div class="row mt-3" v-if="step === 2">
      <div class="col-lg-9">
        <h3>Two</h3>

        <base-button class="mt-2"
                     type="secondary"
                     @click="step++">
          Next
        </base-button>
      </div>
    </div>

    <div class="row mt-3" v-if="step === 3">
      <div class="col-lg-9">
        <h3>Three</h3>

        <base-button class="mt-2"
                     type="secondary"
                     @click="step++">
          Next
        </base-button>
      </div>
    </div>

  </div>
</template>

<script>

  export default {
    name: 'reportMedical',
    components: {},
    props: {},
    data() {
      return {
        step: 1,
      }
    },
    computed: {},
    async mounted() {

    },
    methods: {}
  };

</script>

<style scoped>

</style>
