<template>
    <div>
        <base-select v-for="l in levelsArray" :key="l"
                            v-model="selectedOptions[l]"
                            @input="onInputSelected(l)"
                            :options="getData(l)"
                            :disabled="inputDisabled[l]"></base-select>
    </div>
</template>

<script>
  import * as Papa from 'papaparse';

  export default {
    name: "location-from-address",
    components: {},
    props: {
      location: String,
      valid: Boolean,
    },
    watch: { 
      	location: function(newVal, oldVal) {
          if (newVal) {
            //this.setAddressByPostalCode(newVal)
          }
        }
    },
    async mounted() {
        let geoData = {}
        try {
          geoData = await this.getGrouppedData(this.location)
        } catch (error) {
          this.error = error
        }

        this.geolocationData = geoData.data
        this.levels = geoData.depth
        this.postalCodeMap = geoData.postalCodeMap

        this.levelsArray = Array.from(Array(this.levels).keys())
        this.inputDisabled = Array(this.levels).fill(true)
        this.selectedOptions = Array(this.levels).fill(null)
        this.inputDisabled[0] = false


        if (this.location) {
          this.setAddressByPostalCode(this.location)
        }

    },
    data() {
      return {
        levels: 0,
        levelsArray: [ ],
        geolocationData: { },
        currentLevel: 0,
        selectedOptions: [ ],
        inputDisabled: [ ],
        postalCode: null,
        error: null,
        postalCodeMap: { }
      }
    },
    methods: {
      locationChanged(value, valid) {
        this.$emit('update:valid', valid);
        this.$emit('update:location', value);
      },
      onInputSelected(level) { 
        if (this.inputDisabled[level]) {
          return
        }

        for (let i = level + 1; i < this.levels; i++) {
            this.selectedOptions[i] = null
            this.inputDisabled[i] = true
        }


        if (!this.selectedOptions[level]) {
          this.selectedOptions[level] = null
        } else {
          this.inputDisabled[level + 1] = false;
          this.currentLevel = level + 1
        }

        if (level === this.levels - 1) {
            this.sendPostalCode()
        } else {
            this.locationChanged(null, false)
        }
      },

      getData(level) {
          if (level > this.currentLevel)
            return [];

          let res = this.geolocationData
          for (let i = 0; i < level; i++) {
              res = res[this.selectedOptions[i]]
          }
          return [null, ...Object.keys(res)]
      },

      sendPostalCode() {
        let res = this.geolocationData
        for (let i = 0; i < this.levels; i++) {
            res = res[this.selectedOptions[i]]
        }
        this.postalCode = res
        this.locationChanged(res, true)
        return res
      },

      async getGrouppedData() {
        let data = await new Promise(function(resolve, reject) {
            Papa.parse(process.env.VUE_APP_VISU_GEOCODE_URL, {
                download: true,
                header: true,
                error: (err, file, inputElem, reason) => reject(`Could not get geo-coding data<br>${err}`),
                complete: (content, file) => {
                    resolve(content.data)
                },
            });
        });

        data = data.filter(x => x.postal_code)

        let depth = 0
        if (data.length > 0) {
          depth = data[0].region_id.split('::').length;
        }
        data.forEach(d => {
          d.region_id = d.region_id.split('::')
            d.region_id[d.region_id.length - 1] = d.region_id[d.region_id.length - 1].split('||')
        })

        let res = {}
        let postalCodeMap = { }

        data.forEach(d => {
            postalCodeMap[d.postal_code] = d.region_id
            let t = res
            for (let i = 0; i < d.region_id.length - 1; i++) {
                if (t[d.region_id[i]] === undefined) {
                    t[d.region_id[i]] = {}
                }
                t = t[d.region_id[i]]
            }

            d.region_id[d.region_id.length - 1].forEach(r => {
                t[r] = d.postal_code
            })
        })

        return {
          data: res,
          depth: depth,
          postalCodeMap: postalCodeMap
        }

      },
      setAddressByPostalCode(postalCode) {
        if (postalCode && this.postalCodeMap[postalCode]) {
          this.selectedOptions = this.postalCodeMap[postalCode].map(x => Array.isArray(x) ? x[0] : x)
          this.inputDisabled = Array(this.levels).fill(false)
          this.currentLevel = this.selectedOptions.length - 1
          this.$emit('update:valid', true);
        }
      }
    }
  }
</script>

<style>

</style>
