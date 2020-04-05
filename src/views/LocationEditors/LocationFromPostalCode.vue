<template>
  <div>
    <base-input :value="location"
                @input="locationChanged"
                type="number"
                :placeholder="$t('report.locationPlaceholder')"
                :error="enableCheck && !valid ? $t('report.locationValidError', { length: process.env.VUE_APP_PINCODE_LENGTH_VALIDATION }) : ''"
                @focusout="enableCheck = true"
                :valid="!enableCheck ? null : valid"></base-input>
  </div>
</template>

<script>

  export default {
    name: "location-from-postal-code",
    components: {},
    props: {
      location: null,
      valid: Boolean,
    },
    data() {
      return {
        enableCheck: false,
      }
    },
    mounted() {
      this.$emit('update:valid', this.isValid(this.location));
    },
    methods: {
      locationChanged(value) {
        this.$emit('update:location', value);
      },
      isValid(value) {
        if (value === null) {
          return false;
        }

        if (isNaN(value)) {
          return false;
        }

        if (process.env.VUE_APP_PINCODE_LENGTH_VALIDATION) {
          if (value.length !== parseInt(process.env.VUE_APP_PINCODE_LENGTH_VALIDATION)) {
            return false
          }
        }

        return true;
      },
    },
    watch: {
      location: function (value) {
        this.$emit('update:valid', this.isValid(value));
      },
    }
  }
</script>

<style>

</style>
