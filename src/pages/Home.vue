<template>
  <div>
    <div class="position-relative">
      <!-- shape Hero -->
      <section class="section-shaped my-0">
        <div class="shape shape-style-1 shape-default shape-skew">
          <span></span>
          <span></span>
        </div>
        <div class="container shape-container d-flex">
          <div class="row mt-3">
            <div class="col-12">

              <h3 class="text-white">{{ $t('home.introTitle') }}</h3>

              <p class="text-white">{{ $t('home.introText') }}</p>

              <base-alert type="warning">
                <b>We are looking for help!</b> Covid self report in an Open Source project maintained by volunteers
                from different countries.<br>You can join us to help : <a class="help-link"
                                                                          href="https://github.com/ch-covid-19/welcome">click
                here</a>.
              </base-alert>

              <base-button class="mb-3 mb-sm-0"
                           @click="$router.replace({ name: 'report' })"
                           type="white"
                           icon="fa fa-send">
                {{ $t('report.title') }}
              </base-button>

              <base-button class="mb-3 mb-sm-0"
                           @click="$router.replace({ name: 'visualize' })"
                           type="white"
                           icon="fa fa-map">
                {{ $t('home.fullMap') }}
              </base-button>
            </div>

            <div class="col-12 my-3">
              <reports-map :reports-data="lastDayReports"
                           :geocoding-data="$store.state.geocoding"
                           :layers="['sick_guess_corona', 'sick_corona_confirmed']"
                           no-filters></reports-map>
              <p class="text-white" v-if="$store.state.reportsLastUpdate">
                <small>{{ $t('visualize.lastUpdate') }} {{ $store.state.reportsLastUpdate.toLocaleString() }}</small>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
  import ReportsMap from "../views/Visualizations/ReportsMap";

  export default {
    name: 'home',
    components: {ReportsMap},
    computed: {
      lastDayReports() {

        if (!this.$store.state.reports) {
          return null;
        }

        return this.$store.state.reports
          .filter(d => d.date === this.$store.state.reportsLastDay);
      }
    }
  };

</script>

<style scoped>
  .help-link {
    color: white;
    text-decoration: underline;
  }
</style>
