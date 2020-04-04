import Vuex from 'vuex'
import * as Papa from "papaparse";
import Vue from "vue";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    reports: null,
    reportsLastDay: null,
    reportsLastUpdate: null,

    geocoding: null,
  },
  actions: {
    async loadGeocoding(context, url) {
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

            context.commit('setGeocoding', geocoding);

            resolve(geocoding)
          },
        });
      });
    },

    async loadReports(context, dataFileUrl) {
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

            context.commit('setReports', data);

            resolve(data);
          }
        });
      });
    },

    async loadReportsLastUpdate(context, lastUpdateFileUrl) {
      return new Promise(function (resolve, reject) {
        Papa.parse(`${lastUpdateFileUrl}?timestamp=${new Date().getTime()}`, {
          download: true,
          header: true,
          error: (err, file, inputElem, reason) => reject(`Could not get map data<br>${err}`),
          complete: (content, file) => {
            const lastUpdate = new Date(Object.keys(content.data[0])[0]);

            context.commit('setReportsLastUpdate', lastUpdate);
            resolve(lastUpdate)
          },
        });
      });
    }
  },
  mutations: {
    setGeocoding(state, geocoding) {
      state.geocoding = geocoding;
    },
    setReports(state, reports) {
      state.reports = reports;
    },
    setReportsLastUpdate(state, lastUpdate) {
      state.reportsLastUpdate = lastUpdate;
    },
    setReportsLastDay(state, day) {
      state.reportsLastDay = day;
    }
  },
});
