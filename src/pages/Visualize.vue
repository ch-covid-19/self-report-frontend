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

            <base-alert v-if="error !== null" type="danger">
              <h5 class="text-white">Error</h5>
              <p v-html="error"></p>
            </base-alert>

            <h1 class="display-3 text-white">{{ $t('visualize.title') }}</h1>

            <p>{{ $t('visualize.dataWarning') }}</p>

            <base-input addon-left-icon="ni ni-calendar-grid-58">
              <flat-picker v-if="dataLoaded"
                           slot-scope="{focus, blur}"
                           @on-open="focus"
                           @on-close="blur"
                           :config="datePickerFormat"
                           class="form-control datepicker"
                           v-model="dateFilter">
              </flat-picker>
            </base-input>

            <reports-map :reports-data="reportsOfDay"
                         :geocoding-data="geocodingData"></reports-map>
            <p v-if="lastUpdate"><small>{{ $t('visualize.lastUpdate') }} {{ lastUpdate.toLocaleString() }}</small></p>

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

  export default {
    name: "visualize",
    components: {flatPicker, ReportsMap},
    data() {
      return {
        dataLoaded: false,
        reportsFileUrlBase: process.env.VUE_APP_VISU_DATA_SOURCE_URL,
        geocodeFileUrl: process.env.VUE_APP_VISU_GEOCODE_URL,
        lastUpdateFileUrl: process.env.VUE_APP_VISU_LAST_UPDATE_URL,

        geocodingData: null,

        reportsData: null,
        totalReports: null,
        lastUpdate: null,

        dateData: 0,
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

      try {
        console.log(`Loading geocode data...`);
        this.geocodingData = await this.loadGeocodeData(this.geocodeFileUrl);
        console.log(`Geocode data loaded`);
      } catch (error) {
        this.error = error;
        console.error(error);
      }

      try {
        console.log(`Loading reports data...`);
        this.reportsData = await this.loadReportsData(this.reportsFileUrl);

        /*  Fallback to last day with data */
        this.dateFilter = this.getLastDate(this.reportsData);
        console.log(`Reports data loaded`);

        this.dataLoaded = true;

      } catch (error) {
        this.error = error;
        console.error(error);
      }

      this.computeMapViewport();

      try {
        const lu = await this.loadLastUpdate(this.lastUpdateFileUrl);
        this.lastUpdate = new Date(Object.keys(lu[0])[0]);
      } catch (error) {
        console.error(error);
      }
    },
    computed: {
      reportsFileUrl() {
        return `${this.reportsFileUrlBase}/merge-all-days.csv`;
      },
      reportsOfDay() {
        if (!this.reportsData) {
          return null;
        }
        /* Filter data in date only */
        return this.reportsData.filter(l => l.date === this.dateFilter);
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
      loadGeocodeData: function (url) {
        return new Promise(function (resolve, reject) {
          console.log(`Getting geocoding data at '${url}'`);
          Papa.parse(url, {
            download: true,
            header: true,
            error: (err, file, inputElem, reason) => reject(`Could not get geo-coding data<br>${err}`),
            complete: (content, file) => {

              const geocoding = {};

              for (const location of content.data) {

                if (location.postal_code === null) {
                  continue;
                }

                if (location.longitude && location.latitude) {
                  location.coordinates = [+location.latitude, +location.longitude];

                  if (process.env.VUE_APP_REVERSE_GEO_LAT_LNG) {
                    location.coordinates = [+location.longitude, +location.latitude];
                  }
                } else {
                  continue;
                }

                if (location.region_id) {
                  const regions = location.region_id.split('::');

                  location.regions = [];
                  location.places = [];
                  for (const [i, region] of regions.entries()) {

                    if (i === regions.length - 1) {
                      location.places = region.split('||');
                    } else {
                      location.regions.push(region);
                    }
                  }
                }

                geocoding[location.postal_code] = location;
              }

              resolve(geocoding)
            },
          });
        });
      },
      loadReportsData: async function (dataFileUrl) {
        return new Promise(function (resolve, reject) {
          Papa.parse(`${dataFileUrl}?timestamp=${new Date().getTime()}`, {
            download: true,
            header: true,
            error: (err, file, inputElem, reason) => reject(`Could not get map data<br>${err}`),
            complete: (content, file) => {

              console.log(`Reports data downloaded and parsed`);

              let data = content.data;

              /* Data cleanup */
              for (const entry of data) {
                entry.healthy = +entry.healthy;
                entry.sick_guess_no_corona = +entry.sick_guess_no_corona;
                entry.sick_guess_corona = +entry.sick_guess_corona;
                entry.sick_corona_confirmed = +entry.sick_corona_confirmed;
                entry.recovered_not_confirmed = +entry.recovered_not_confirmed;
                entry.recovered_confirmed = +entry.recovered_confirmed;

                entry.total = entry.healthy +
                  entry.sick_guess_no_corona +
                  entry.sick_guess_corona +
                  entry.sick_corona_confirmed +
                  entry.recovered_not_confirmed +
                  entry.recovered_confirmed;
              }

              resolve(data);
            }
          });
        });
      },
      loadLastUpdate: async function (lastUpdateFileUrl) {
        return new Promise(function (resolve, reject) {
          Papa.parse(`${lastUpdateFileUrl}?timestamp=${new Date()}`, {
            download: true,
            header: true,
            error: (err, file, inputElem, reason) => reject(`Could not get map data<br>${err}`),
            complete: (content, file) => resolve(content.data),
          });
        });
      },
      getLastDate: function (data) {
        /* Assumes data is ordered by date */
        for (let i = data.length - 1; i >= 0; i--) {
          if (data[i].date) {
            return data[i].date;
          }
        }
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
