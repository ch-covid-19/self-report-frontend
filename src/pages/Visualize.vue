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

          <div class="col text-white">

            <base-alert v-if="error !== null" type="danger" dismissible>
              <h5 class="text-white">Error</h5>
              <p v-html="error"></p>
            </base-alert>

            <h1 class="display-3 text-white">{{ $t('visualize.title') }}</h1>

            <p>{{ $t('visualize.dataWarning') }}</p>

            <div class="row my-3 align-baseline">
              <div class="col-auto">
                <i v-if="dateFilter !== datePickerFormat.minDate" class="fa fa-chevron-left my-3 click-cursor"
                   @click="addDays(-1)"></i>
              </div>

              <div class="col mt-0">

                <base-input addon-left-icon="ni ni-calendar-grid-58"
                            :addon-right-icon="loading ? 'fa fa-spinner fa-pulse' : ''">
                  <flat-picker v-if="$store.state.reports"
                               slot-scope="{focus, blur}"
                               @on-open="focus"
                               @on-close="blur"
                               :config="datePickerFormat"
                               class="form-control datepicker"
                               v-model="dateFilter">
                  </flat-picker>
                </base-input>
              </div>

              <div class="col-auto">
                <i v-if="dateFilter !== datePickerFormat.maxDate" class="fa fa-chevron-right my-3 click-cursor"
                   @click="addDays(1)"></i>
              </div>
            </div>

            <reports-map v-if="loaded"
                         :reports-data="reportsOfDay"
                         :map-center-latitude="mapCenterLatitude"
                         :map-center-longitude="mapCenterLongitude"
                         :map-center-zoom-level="mapCenterZoomLevel"
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
  import {mapActions, mapState} from "vuex";

  export default {
    name: "visualize",
    components: {flatPicker, ReportsMap},
    data() {
      return {
        dateFilter: null,
        allowedDates: [],
        datePickerFormat: {
          allowInput: true,
          dateFormat: 'Y-m-d',
          minDate: '2020-03-25',
          maxDate: new Date().toISODate(),
        },

        loaded: false,
        loading: false,
        reportsFileUrlBase: process.env.VUE_APP_VISU_DATA_SOURCE_URL,

        mapCenterLatitude: process.env.VUE_APP_VISU_MAP_CENTER_LATITUDE,
        mapCenterLongitude: process.env.VUE_APP_VISU_MAP_CENTER_LONGITUDE,
        mapCenterZoomLevel: process.env.VUE_APP_VISU_MAP_ZOOM_LEVEL,

        error: null,
      };
    },
    async mounted() {
      if (this.$store.state.reportsLastDay) {
        this.dateFilter = this.$store.state.reportsLastDay.toISODate();
      }
      this.computeMapViewport();
      this.loaded = true;
    },
    computed: {
      ...mapState([
        'reportsLastDay'
      ]),
      reportsOfDay() {
        return this.$store.state.reports[this.dateFilter];
      }
    },
    watch: {
      reportsLastDay(newValue, oldValue) {
        this.dateFilter = newValue.toISODate();
      },
      dateFilter(newValue, oldValue) {
        this.loadReportsFor(newValue);
      }
    },
    methods: {

      ...mapActions([
        'loadReports',
      ]),

      loadReportsFor: async function (date) {
        console.log('loadReportsForCurrentDay', date);
        if (date && !this.$store.state.reports[date]) {
          try {
            this.loading = true;
            await this.loadReports({
              url: `${this.reportsFileUrlBase}/daily-reports/${date}.csv`,
              date: new Date(date),
            });
          } catch (error) {
            this.error = `Could not get data for '${date}': ${error}`;
          } finally {
            this.loading = false;
          }
        }
      },

      addDays: function (days) {
        let date = new Date(this.dateFilter);
        date.setDate(date.getDate() + days);
        this.dateFilter = date.toISODate();
      },

      computeMapViewport: function () {

        const reportDataString = localStorage.getItem('report-data');
        if (reportDataString) {

          const reportData = JSON.parse(reportDataString);
          try {
            this.mapCenterLatitude = this.$store.state.geocoding[reportData.postalCode].latitude;
            this.mapCenterLongitude = this.$store.state.geocoding[reportData.postalCode].longitude;

            if (process.env.VUE_APP_REVERSE_GEO_LAT_LNG) {
              this.mapCenterLatitude = this.$store.state.geocoding[reportData.postalCode].longitude;
              this.mapCenterLongitude = this.$store.state.geocoding[reportData.postalCode].latitude;
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
  .click-cursor {
    cursor: pointer;
  }
</style>
