<template>
  <div id="app">
    <router-view name="header"></router-view>
    <main>
      <fade-transition origin="center" mode="out-in" :duration="250">
        <router-view/>
      </fade-transition>
    </main>
    <router-view name="footer"></router-view>
  </div>
</template>

<script>
  import {FadeTransition} from "vue2-transitions";
  import {mapActions, mapMutations} from "vuex";

  export default {
    components: {
      FadeTransition
    },
    data() {
      return {
        geocodeFileUrl: process.env.VUE_APP_VISU_GEOCODE_URL,
        reportsFileUrlBase: process.env.VUE_APP_VISU_DATA_SOURCE_URL,
        lastUpdateFileUrl: process.env.VUE_APP_VISU_LAST_UPDATE_URL,

        error: null,
      }
    },
    computed: {
      reportsFileUrl() {
        return `${this.reportsFileUrlBase}/merge-all-days.csv`;
      },
    },
    async mounted() {

      try {
        console.log(`Loading geocode data...`);
        await this.loadGeocoding(this.geocodeFileUrl);
        console.log(`Geocode data loaded`);
      } catch (error) {
        this.error = error;
        console.error(error);
      }

      try {
        console.log(`Loading reports data...`);
        await this.loadReports(this.reportsFileUrl);

        /*  Fallback to last day with data */
        this.setReportsLastDay(this.getLastDate(this.$store.state.reports));
        console.log(`Reports data loaded`);

      } catch (error) {
        this.error = error;
        console.error(error);
      }

      try {
        await this.loadReportsLastUpdate(this.lastUpdateFileUrl);
      } catch (error) {
        console.error(error);
      }
    },
    methods: {
      ...mapActions([
        'loadGeocoding',
        'loadReports',
        'loadReportsLastUpdate',
      ]),
      ...mapMutations([
        'setReportsLastDay',
      ]),
      getLastDate: function (data) {
        /* Assumes data is ordered by date */
        for (let i = data.length - 1; i >= 0; i--) {
          if (data[i].date) {
            return data[i].date;
          }
        }
      },
    }
  };

</script>

<style>
  .grecaptcha-badge {
    visibility: hidden;
  }
</style>
