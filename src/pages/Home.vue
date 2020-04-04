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
            <div class="col-md-6">

              <h3 class="text-white">Help to fight the Coronavirus</h3>

              <p class="text-white">{{ $t(`faq.goalResponse`, {disease: 'Covid-19'}) }}</p>

              <base-button class="mb-3 mb-sm-0"
                           @click="$router.replace({ name: 'report' })"
                           type="white"
                           icon="fa fa-send">
                {{ $t('report.title') }}
              </base-button>
            </div>

            <div class="col-12 my-3">
              <reports-map :reports-data="lastDayReports"
                           :geocoding-data="$store.state.geocoding"
                           no-filters></reports-map>
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

</style>
