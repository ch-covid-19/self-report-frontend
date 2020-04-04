<template>
  <div>

    <base-alert v-if="error !== null" type="danger">
      <h5 class="text-white">Error</h5>
      <p v-html="error"></p>
    </base-alert>

    <div v-if="!noFilters">
      <base-button v-for="(layerDefinition) in enabledLayers" :key="layerDefinition.id"
                   class="mb-3"
                   size="sm"
                   :type="layerDefinition.buttonColor"
                   :icon="`fa fa-${layerEnabled(layerDefinition) ? 'check-square' : 'square-o'}`"
                   @click="toggleLayer(layerDefinition)">
        <span>{{ $t(layerDefinition.label) }}</span>
      </base-button>
    </div>

    <div id="leaflet-map"></div>

  </div>
</template>

<script>
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  import flatPicker from 'vue-flatpickr-component';
  import 'flatpickr/dist/flatpickr.css';

  var _map = null;
  var _tileLayers = [];

  export default {
    name: "reportsMap",
    components: {flatPicker},
    props: {
      mapCenterLatitude: {
        default: process.env.VUE_APP_VISU_MAP_CENTER_LATITUDE
      },
      mapCenterLongitude: {
        default: process.env.VUE_APP_VISU_MAP_CENTER_LONGITUDE,
      },
      mapCenterZoomLevel: {
        default: process.env.VUE_APP_VISU_MAP_ZOOM_LEVEL,
      },

      minBubbleSize: {type: Number, default: +process.env.VUE_APP_VISU_MAP_MIN_MARKER_SIZE},
      maxBubbleSize: {type: Number, default: +process.env.VUE_APP_VISU_MAP_MAX_MARKER_SIZE},

      reportsData: Array,
      geocodingData: Object,

      noFilters: {type: Boolean, default: false},
    },
    data() {
      return {
        mapBaseLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

        visibleLayers: [],
        enabledLayers: [],
        layersDefinition: [
          {
            id: 'healthy',
            enabled: true,
            label: 'visualize.layerHealthy',
            value: (entry) => entry.healthy,
            sizeRatio: 1,
            color: 'blue',
            buttonColor: 'info',
            opacity: 0.3,
            visible: false,
          },
          {
            id: 'sick_guess_no_corona',
            enabled: true,
            label: 'visualize.layerSickNoCovid',
            value: (entry) => entry.sick_guess_no_corona,
            sizeRatio: 1,
            color: 'blue',
            buttonColor: 'info',
            opacity: 0.3,
            visible: false,
          },
          {
            id: 'sick_guess_corona',
            enabled: true,
            label: 'visualize.layerSickCovid',
            value: (entry) => entry.sick_guess_corona,
            sizeRatio: 5,
            color: 'red',
            buttonColor: 'warning',
            opacity: 0.5,
            visible: true,
          },
          {
            id: 'sick_corona_confirmed',
            enabled: true,
            label: 'visualize.layerSickCovidConfirmed',
            value: (entry) => entry.sick_corona_confirmed,
            sizeRatio: 5,
            color: 'red',
            buttonColor: 'danger',
            opacity: 0.7,
            visible: true,
          },
          {
            id: 'recovered_not_confirmed',
            enabled: true,
            label: 'visualize.layerRecovered',
            value: (entry) => entry.recovered_not_confirmed,
            sizeRatio: 3,
            color: 'green',
            buttonColor: 'success',
            opacity: 0.5,
            visible: false,
          },
          {
            id: 'recovered_confirmed',
            enabled: true,
            label: 'visualize.layerRecoveredConfirmed',
            value: (entry) => entry.recovered_confirmed,
            sizeRatio: 3,
            color: 'green',
            buttonColor: 'success',
            opacity: 0.5,
            visible: false,
          },
          {
            id: 'ratio',
            enabled: false,
            label: 'Covid-19 ratio (probable + tested)',
            value: (entry) => Math.round((entry.sick_guess_corona + entry.sick_corona_confirmed) / entry.total * 100),
            displayCondition: (entry) => entry.total > 10,
            sizeRatio: 50,
            color: 'purple',
            buttonColor: 'purple',
            opacity: 1,
            visible: true,
            unit: '%',
            noLog: true,
          },
        ],

        error: null,
      };
    },
    mounted() {
      try {
        console.log(`Loading reports map`);

        this.enabledLayers = this.layersDefinition.filter(l => l.enabled);

        _map = L.map('leaflet-map', {
          preferCanvas: true,
        }).setView([
          this.mapCenterLatitude,
          this.mapCenterLongitude
        ], this.mapCenterZoomLevel);

        console.log(`Adding reports map base layer`);
        _tileLayers.push(L.tileLayer(this.mapBaseLayerUrl, {
          attribution: `&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors`,
        }).addTo(_map));

        this.buildLayers();
      } catch (error) {
        this.error = error;
        console.error(error);
      }
    },
    computed: {},
    watch: {
      reportsData() {
        try {
          this.buildLayers();
        } catch (error) {
          this.error = error;
          console.error(error);
        }
      },
      geocodingData() {
        try {
          this.buildLayers();
        } catch (error) {
          this.error = error;
          console.error(error);
        }
      },
    },
    methods: {
      layerEnabled: function (layerDefinition) {
        return this.visibleLayers.includes(layerDefinition);
      },
      toggleLayer: function (layerDefinition) {
        if (this.layerEnabled(layerDefinition)) {
          this.removeLayer(layerDefinition);
        } else {
          this.addLayer(layerDefinition);
        }
      },
      addLayer: function (layerDefinition) {
        layerDefinition.data.layer.addTo(_map);
        this.visibleLayers.push(layerDefinition);
      },
      removeLayer: function (layerDefinition) {
        _map.removeLayer(layerDefinition.data.layer);
        this.visibleLayers = this.visibleLayers.filter((layer) => layer !== layerDefinition);
      },
      buildLayers: function () {

        if (!this.reportsData || !this.geocodingData) {
          return;
        }

        console.log(`Building reports map data layers`);

        const activeLayersBackup = this.visibleLayers.map(layerDefinition => layerDefinition.id);

        console.log(`Remove visible layers`);
        for (const layerDefinition of this.visibleLayers) {
          _map.removeLayer(layerDefinition.data.layer);
        }

        let allLayersMax = 0;

        console.log(`Init layer`);
        for (const layerDefinition of this.enabledLayers) {
          layerDefinition.data = {
            max: 0,
            markers: [],
          };
        }

        console.log(`Compute maximals`);
        for (const entry of this.reportsData) {
          for (const layerDefinition of this.enabledLayers) {
            const markerSize = layerDefinition.value(entry) * layerDefinition.sizeRatio;
            if (markerSize > layerDefinition.data.max) {
              layerDefinition.data.max = markerSize;

              if (layerDefinition.data.max > allLayersMax) {
                allLayersMax = layerDefinition.data.max;
              }
            }
          }
        }

        console.log(`Adding markers`);
        let ignored = 0;
        for (const entry of this.reportsData) {

          const geocoding = this.geocodingData[entry.postal_code];

          if (!geocoding) {
            ignored++;
            continue;
          }

          let popup = ``;
          const places = geocoding.places.filter(p => isNaN(p));
          switch (places.length) {
            case 0:
              popup += `<h4>${entry.postal_code}</h4>`;
              break;

            case 1:
              popup += `<h4>${entry.postal_code} ${places[0]}</h4>`;
              break;

            default:
              popup += `<h4>${entry.postal_code}</h4>`;
              popup += `<ul>`;
              for (const place of places) {
                popup += `<li><b>${place}</b></li>`;
              }
              popup += `</li>`;
              break;
          }

          popup += `
            <p></p>
            <table class="data">`;

          for (const layerDefinition of this.enabledLayers) {
            popup += `
              <tr>
                <td style="color: ${layerDefinition.color}">
                  ${layerDefinition.value(entry)}${layerDefinition.unit ? layerDefinition.unit : ''}
                </td>
                <td>
                  ${this.$i18n.t(layerDefinition.label)}
                </td>
              </tr>
            `;
          }

          popup += `</table>
          `;

          for (const layerDefinition of this.enabledLayers) {

            if (layerDefinition.displayCondition !== undefined && !layerDefinition.displayCondition(entry)) {
              continue;
            }

            if (layerDefinition.value(entry) === 0) {
              continue;
            }

            try {
              let markerSize = layerDefinition.value(entry) * layerDefinition.sizeRatio;

              if (markerSize > 0 && !layerDefinition.noLog) {
                markerSize = Math.log((markerSize / allLayersMax) + 1) * (this.maxBubbleSize - this.minBubbleSize) + this.minBubbleSize;
              }
              // markerSize = markerSize / layerDefinition.data.max * this.maxBubbleSize;

              layerDefinition.data.markers.push(L.circle(geocoding.coordinates, {
                weight: 0,
                fillColor: layerDefinition.color,
                fillOpacity: layerDefinition.opacity,
                radius: markerSize,
              }).bindPopup(popup));
            } catch (error) {
              console.error(entry, error);
            }
          }
        }

        const options = {
          // attribution: `<a href="${this.dataSourceUrl}" target="_blank">Data source</a>`,
        };

        console.log(`Adding layers`);
        const overlays = {};
        for (const layerDefinition of this.enabledLayers) {

          layerDefinition.data.layer = L.layerGroup(layerDefinition.data.markers, options);

          if (activeLayersBackup.length > 0) {
            if (activeLayersBackup.includes(layerDefinition.id)) {
              this.addLayer(layerDefinition);
            }
          } else {
            if (layerDefinition.visible) {
              this.addLayer(layerDefinition);
            }
          }

          const label = `<span style="color: ${layerDefinition.color}">${this.$i18n.t(layerDefinition.label)}</span>`;
          overlays[label] = layerDefinition.data.layer;
        }
      },
    }
  };

</script>

<style>

  #leaflet-map {
    height: 500px;
    z-index: 1;
    position: relative;
  }

  .data td:first-child {
    font-weight: bold;
    text-align: right;
    margin-right: 5px;
  }

</style>
