<template>
  <div>

    <div class="position-relative">
      <!-- shape Hero -->
      <section class="section-hero section-shaped my-0">
        <div class="shape shape-style-1 shape-default shape-skew">
          <span></span>
          <span></span>
        </div>
        <div class="container shape-container d-flex">

          <div class="col text-white">

            <base-alert v-if="error !== null" type="danger">
              <h5 class="text-white">Error</h5>
              <p v-html="error"></p>
            </base-alert>

            <h1 class="display-3 text-white">{{ $t('visualize.title') }}</h1>

            <p>{{ $t('visualize.dataWarning') }}</p>

            <base-input addon-left-icon="ni ni-calendar-grid-58">
              <flat-picker v-if="$store.state.reports"
                           slot-scope="{focus, blur}"
                           @on-open="focus"
                           @on-close="blur"
                           :config="datePickerFormat"
                           class="form-control datepicker"
                           v-model="dateFilter">
              </flat-picker>
            </base-input>

            <reports-map :reports-data="reportsOfDay"
                         :geocoding-data="$store.state.geocoding"></reports-map>
            <p v-if="$store.state.reportsLastUpdate">
              <small>{{ $t('visualize.lastUpdate') }} {{ $store.state.reportsLastUpdate.toLocaleString() }}</small>
            </p>

          </div>

        </div>
      </section>
    </div>

  </div>
</template>

<script>
  import * as Papa from 'papaparse';

  import flatPicker from 'vue-flatpickr-component';
  import 'flatpickr/dist/flatpickr.css';

  import ReportsMap from "../views/Visualizations/ReportsMap";
  import {mapState} from "vuex";

  export default {
    name: "visualize",
    components: {flatPicker, ReportsMap},
    data() {
      return {
        dateFilter: new Date().toISOString().split('T')[0],
        allowedDates: [],
        datePickerFormat: {
          allowInput: true,
          dateFormat: 'Y-m-d',
          minDate: '2020-03-25',
          maxDate: new Date().toISOString(),
        },

        error: null,
      };
    },
    async mounted() {
      this.dateFilter = this.$store.state.reportsLastDay;
      this.computeMapViewport();
    },
    computed: {
      ...mapState([
        'reportsLastDay'
      ]),
      reportsOfDay() {
        if (!this.$store.state.reports) {
          return null;
        }
        /* Filter data in date only */
        return this.$store.state.reports.filter(l => l.date === this.dateFilter);
      }
    },
    watch: {
      reportsLastDay(newValue, oldValue) {
        this.dateFilter = newValue;
      }
    },
    methods: {
      computeMapViewport: function () {

        const reportDataString = localStorage.getItem('report-data');
        if (reportDataString) {

          const reportData = JSON.parse(reportDataString);
          try {
            this.mapCenterLatitude = this.geocoding[reportData.postalCode].latitude;
            this.mapCenterLongitude = this.geocoding[reportData.postalCode].longitude;

            if (process.env.VUE_APP_REVERSE_GEO_LAT_LNG) {
              this.mapCenterLatitude = this.geocoding[reportData.postalCode].longitude;
              this.mapCenterLongitude = this.geocoding[reportData.postalCode].latitude;
            }

            if (process.env.VUE_APP_VISU_MAP_ZOOM_LEVEL_LOCAL) {
              this.mapCenterZoomLevel = process.env.VUE_APP_VISU_MAP_ZOOM_LEVEL_LOCAL;
            } else {
              this.mapCenterZoomLevel = +process.env.VUE_APP_VISU_MAP_ZOOM_LEVEL + 2;
            }
          } catch (error) {

          }
        }
      },
      isDateAllowed: function (date) {
        return this.allowedDates.includes(date);
      },
      computeAllowedDates: function (data) {
        const flags = {};
        const allowedDates = [];
        for (const entry of data) {
          if (entry.date !== '' && !flags[entry.date]) {
            flags[entry.date] = true;
            allowedDates.push(entry.date);
          }
        }
        return allowedDates;
      },
    }
  };

</script>

<style>


</style>
