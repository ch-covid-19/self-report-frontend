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
  import AppHeader from "./layout/AppHeader";

  export default {
    components: {
      AppHeader,
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

        const activeDay = new Date();

        let total = 0;

        while (true) {
          try {
            total++;
            await this.loadReports({
              url: `${this.reportsFileUrlBase}/daily-reports/${activeDay.toISODate()}.csv`,
              date: activeDay,
            });

            this.setReportsLastDay(activeDay)

            break;
          } catch (error) {

            if (total > 10) {
              throw new Error('Could not get reports data');
            }

            console.error(error);
            activeDay.setDate(activeDay.getDate() - 1)
          }
        }

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
        'setReportsDate',
      ])
    }
  };

</script>

<style>
  .grecaptcha-badge {
    visibility: hidden;
  }
</style>
