<template>
  <div>

    <div class="row mt-3">
      <div class="col-lg-6">

        <p class="text-white">{{ $t('report.intro') }}</p>

        <h1 class="display-3 text-white">{{ $t('report.drAreYouSick') }}</h1>

        <div class="btn-wrapper">
          <base-button class="mb-3 mb-sm-0"
                       @click="reportData.sick = false; reportData.diagnostic = null"
                       :type="reportData.sick === false ? 'success' : 'white'"
                       icon="fa fa-heartbeat">
            {{ $t('app.no') }}
          </base-button>
          <base-button class="mb-3 mb-sm-0"
                       @click="reportData.sick = 'unknown'; reportData.diagnostic = 0; refreshUnknownSickStatus()"
                       :type="reportData.sick === 'unknown' ? 'warning' : 'white'">
            {{ $t('report.drUnknown') }}
          </base-button>
          <base-button class="mb-3 mb-sm-0"
                       @click="reportData.sick = true; reportData.diagnostic = null"
                       :type="reportData.sick === true ? 'danger' : 'white'"
                       icon="ni ni-atom">
            {{ $t('app.yes') }}
          </base-button>
        </div>

      </div>
    </div>

    <div class="row mt-3" v-show="reportData.sick === false">
      <div class="col-lg-6">
        <h3 class="text-white">{{ $t('report.contract') }}</h3>

        <div class="btn-wrapper">
          <base-button class="mb-2"
                       @click="reportData.diagnostic = 0"
                       :type="reportData.diagnostic === 0 ? 'info' : 'white'">
            {{ $t('report.contractNo') }}
          </base-button>
          <base-button class="mb-2"
                       @click="reportData.diagnostic = 4"
                       :type="reportData.diagnostic === 4 ? 'success' : 'white'">
            {{ $t('report.contractedProbably') }}
          </base-button>
          <base-button class="mb-2"
                       @click="healthyOfficialConfirmModal = true"
                       :type="reportData.diagnostic === 5 ? 'success' : 'white'">
            {{ $t('report.contractedOfficial') }}
          </base-button>
        </div>

        <modal :show.sync="healthyOfficialConfirmModal">
          <template slot="header">
            <h5 class="modal-title">{{ $t('report.contractedOfficialConfirm') }}</h5>
          </template>
          <div>
            <p>{{ $t('report.contractedOfficialConfirmText') }}</p>
          </div>
          <template slot="footer">
            <base-button type="secondary"
                         @click="reportData.diagnostic = 4; healthyOfficialConfirmModal = false;">{{
              $t('app.no') }}
            </base-button>
            <base-button type="primary"
                         @click="reportData.diagnostic = 5; healthyOfficialConfirmModal = false;">{{
              $t('app.yes') }}
            </base-button>
          </template>
        </modal>

      </div>
    </div>

    <div class="row mt-3" v-show="reportData.sick === false && reportData.diagnostic === 0">
      <div class="col-lg-6">
        <p class="text-white">{{ $t('report.notSick') }}</p>
      </div>
    </div>


    <div class="row mt-3" v-show="reportData.sick === true">
      <div class="col-lg-6">
        <h3 class="text-white">{{ $t('report.symptoms') }}</h3>
      </div>
    </div>


    <div class="row mt-3" v-show="reportData.sick === 'unknown'">
      <div class="col-lg-6">
        <h3 class="text-white">{{ $t('report.drHaveSymptoms') }}</h3>
      </div>
    </div>

    <div class="row mt-3" v-show="reportData.sick === true || reportData.sick === 'unknown'">
      <div class="col-lg-6">
        <base-button v-for="(symptom) in existingSymptoms" :key="symptom.id"
                     class="mt-2"
                     :type="hasSymptom(symptom.id) ? 'info' : 'secondary'"
                     :icon="`fa fa-${hasSymptom(symptom.id) ? 'check-square' : 'square-o'}`"
                     @click="setSymptom(symptom.id, !hasSymptom(symptom.id))">
          <span>{{ $t(symptom.label) }}</span>
        </base-button>

        <p class="text-white mt-3">{{ $t('report.drSymptomsDays') }}</p>
        <base-slider v-model="reportData.symptomsDays"
                     :range="{min: 0, max: 14}"
                     :options="{ step: 1 }">
        </base-slider>
        <p class="text-white">{{ $t('report.drSymptomsDaysAgo', {ignore_days: Math.floor(reportData.symptomsDays)})
          }}</p>

      </div>
    </div>

    <div class="row mt-3" v-show="reportData.sick === true">
      <div class="col-lg-6">
        <h3 class="text-white">{{ $t('report.drTested') }}</h3>

        <p class="text-white">{{ $t('report.drTestedDetails') }}</p>

        <base-button class="mt-2"
                     :type="reportData.diagnostic === 2 ? 'warning' : 'secondary'"
                     @click="reportData.diagnostic = 2">
          <span>{{ $t('app.no') }}</span>
        </base-button>

        <base-button class="mt-2"
                     :type="reportData.diagnostic === 3 ? 'danger' : 'secondary'"
                     @click="reportData.diagnostic = 3">
          <span>{{ $t('app.yes') }}</span>
        </base-button>

      </div>
    </div>

  </div>
</template>

<script>
  import Modal from '@/components/Modal';

  export default {
    name: 'reportDiseaseOriented',
    components: {
      Modal,
    },
    props: {
      reportData: Object,
    },
    data() {
      return {
        existingSymptoms: [
          {id: 'fever', label: 'report.symptomFever'},
          {id: 'cough', label: 'report.symptomCough'},
          {id: 'vomit', label: 'report.symptomVomit'},
          {id: 'dyspnea', label: 'report.symptomDyspnea'},
          {id: 'weakness', label: 'report.symptomWeakness'},
          {id: 'headache', label: 'report.symptomHeadache'},
          {id: 'cold', label: 'report.symptomCold'},
          {id: 'diarrhoea', label: 'report.symptomDiarrhoea'},
          {id: 'taste_smell', label: 'report.symptomTasteSmell'},
          {id: 'others', label: 'report.symptomOthers'},
        ],
        officialConfirmModal: false,
        healthyOfficialConfirmModal: false,

        /*
        * 0 = not sick
        * 1 = sick without Covid
        * 2 = sick probably with Covid
        * 3 = sick with Covid confirmed
        * 4 = recovered (Covid guess)
        * 5 = recovered (Covid official)
        */
      }
    },
    computed: {},
    async mounted() {

    },
    methods: {
      hasSymptom: function (symptom) {
        return this.reportData.symptoms.includes(symptom);
      },
      setSymptom: function (symptom, enabled) {
        if (enabled) {
          if (!this.reportData.symptoms.includes(symptom)) {
            this.reportData.symptoms.push(symptom);
          }
        } else {
          if (this.reportData.symptoms.includes(symptom)) {
            this.reportData.symptoms = this.reportData.symptoms.filter(s => s !== symptom);
          }
        }

        if (this.reportData.sick === 'unknown') {
          this.refreshUnknownSickStatus();
        }
      },

      refreshUnknownSickStatus() {
        if (this.reportData.symptoms.length > 0) {
          this.reportData.diagnostic = 3;
        } else {
          this.reportData.diagnostic = 0;
        }

      }
    }
  };

</script>

<style scoped>

</style>
