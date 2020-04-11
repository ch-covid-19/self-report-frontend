<template>
  <div>
    <div class="position-relative">
      <!-- shape Hero -->
      <section class="section-shaped my-0">
        <div class="shape shape-style-1 shape-default shape-skew">
        </div>
        <div class="container shape-container d-flex">

          <div v-if="daysSinceLastReport === null || daysSinceLastReport > 0 || forceReportAgain"
               class="col px-0">

            <div class="row mt-3" v-show="reportData.lastReport !== null && forceReportAgain === false">
              <div class="col-lg-6">
                <h3 class="text-white">{{ $t('renewReport.comingBack')}}</h3>
                <p class="text-white">{{ $t('renewReport.daysSince', { days: daysSinceLastReport }) }}</p>
                <p class="text-white">{{ $t('renewReport.explainOther')}}</p>
                <p class="text-white">{{ $t('renewReport.click')}}
                  <base-button size="sm" @click="resetData" type="info">{{ $t('renewReport.here')}}</base-button>
                  {{ $t('renewReport.ifNotYou')}}
                </p>
              </div>
            </div>

            <report-disease-oriented v-if="reportForm === 'disease'"
                                     :report-data="reportData"></report-disease-oriented>

            <report-classic v-else
                            :report-data="reportData"></report-classic>

            <div class="row mt-3" v-show="reportData.sick !== null">
              <div class="col-lg-6">
                <h3 class="text-white">{{ $t('report.locationQuestion') }}</h3>

                <location-from-address v-if="locationSelector === 'address'"
                                       :location.sync="reportData.postalCode"
                                       :valid.sync="validLocation"></location-from-address>

                <location-from-postal-code v-else
                                           :location.sync="reportData.postalCode"
                                           :valid.sync="validLocation"></location-from-postal-code>
              </div>
            </div>

            <div class="row mt-3" v-show="reportData.sick !== null">
              <div class="col-lg-6">
                <base-button @click="send"
                             :disabled="!validLocation || reportData.diagnostic === null"
                             class="mb-3 mb-sm-0"
                             type="white"
                             icon="fa fa-send">
                  {{ $t('report.send') }} <i v-if="sending" class="fa fa-spinner fa-pulse"></i>
                </base-button>
              </div>
            </div>

            <div class="row mt-3">
              <div class="col-lg-6">
                <p class="text-white headline"> {{ $t('about.headData') }}</p>
                <p class="text-white" v-if="reportData.sick !== null">{{ $t('about.data') }}</p>
              </div>
            </div>

            <modal :show.sync="sendErrorModal"
                   gradient="danger"
                   modal-classes="modal-danger modal-dialog-centered">
              <h6 slot="header" class="modal-title" id="modal-title-notification">{{ $t('report.error') }}</h6>

              <div class="py-3 text-center">
                <i class="ni ni-bell-55 ni-3x"></i>
                <h4 class="heading mt-4">{{ $t('report.errorDetails') }}</h4>
                <p>{{ sendError }}</p>
                <p>
                  Please try again. If it still occurs, please
                  <base-button size="sm" type="info" @click="contact">contact us</base-button>
                  .
                </p>

              </div>

              <template slot="footer">
                <base-button type="link"
                             text-color="white"
                             class="ml-auto"
                             @click="sendErrorModal = false">
                  {{ $t('report.errorClose') }}
                </base-button>
              </template>
            </modal>

          </div>

          <div v-else class="text-white">

            <div v-if="!medicalForm">
              <h3 class="text-white">{{ $t('report.sentThanks') }}</h3>

              <p v-if="medicalFormEnabled">
                Take medical form
                <base-button size="sm" @click="medicalForm = true" type="info">
                  GO
                </base-button>
              </p>

              <p>{{ $t('report.sentComeBack') }}</p>
              <p>
                {{ $t('report.wantToSeePublicData') }}
                <base-button size="sm" @click="$router.replace({ name: 'visualize' })" type="info">
                  {{ $t('visualize.title') }}
                </base-button>
              </p>
              <p>{{ $t('report.sentSomeoneElse') }}</p>
              <p>
                {{ $t('report.sentMistake') }}
                <base-button size="sm" @click="forceReportAgain = true" type="info">
                  {{ $t('report.sentMistakeClickHere') }}
                </base-button>
              </p>
            </div>
            <div v-else>
              <report-medical></report-medical>
            </div>

          </div>
        </div>
      </section>
    </div>

  </div>
</template>

<script>
  import {v4 as uuidv4} from 'uuid';

  import Modal from '@/components/Modal';

  import LocationFromPostalCode from '../views/LocationEditors/LocationFromPostalCode';
  import LocationFromAddress from '../views/LocationEditors/LocationFromAddress';
  import ReportClassic from "../views/ReportForms/Classic";
  import ReportDiseaseOriented from "../views/ReportForms/DiseaseOriented";
  import ReportMedical from "../views/ReportForms/Medical";

  export default {
    name: 'report',
    components: {
      ReportMedical,
      ReportDiseaseOriented,
      ReportClassic,
      LocationFromAddress,
      LocationFromPostalCode,
      Modal
    },
    data() {
      return {
        sendErrorModal: false,
        sendError: '',
        forceReportAgain: false,

        locationSelector: process.env.VUE_APP_REPORT_LOCATION_SELECTOR,
        reportForm: process.env.VUE_APP_REPORT_FORM,
        medicalFormEnabled: process.env.VUE_APP_REPORT_FORM_MEDICAL,
        medicalForm: false,
        validLocation: false,

        reportData: {
          sessionId: null,
          sick: null,
          symptoms: [],
          symptomsDays: 0,
          diagnostic: null,
          postalCode: null,
          lastReport: null,
        },
        sending: false,
      }
    },
    computed: {
      daysSinceLastReport: function () {

        if (this.reportData.lastReport === null) {
          return null;
        }

        return Math.round(Math.abs((this.reportData.lastReport - new Date()) / (24 * 60 * 60 * 1000)));
      },
    },
    async mounted() {

      const reportData = localStorage.getItem('report-data');
      if (reportData !== null) {
        this.reportData = JSON.parse(reportData);
      }

      if (this.reportData.sessionId === null) {
        this.reportData.sessionId = uuidv4();
      }

      if (this.reportData.diagnostic !== null) {
        this.reportData.diagnostic = +this.reportData.diagnostic;
      }

      if (this.reportData.lastReport !== null) {
        this.reportData.lastReport = Date.parse(this.reportData.lastReport);
      }

    },
    methods: {

      send: async function (event) {

        this.sending = true;
        try {
          this.reportData.symptoms = this.reportData.symptoms.filter(s => s !== '');

          let symptoms = [];
          switch (this.reportData.diagnostic) {
            case 1:
            case 2:
            case 3:
              symptoms = this.reportData.symptoms;
          }

          try {
            await this.$recaptchaLoaded();
          } catch (error) {
            console.error(error);
            this.sendError = `There was a problem loading the reCAPTCHA.`;
            this.sendErrorModal = true;
            return;
          }

          try {
            // Execute reCAPTCHA with action "report".
            const token = await this.$recaptcha('report');
          } catch (error) {
            console.error(error);
            this.sendError = `There was a problem getting the reCAPTCHA token.`;
            this.sendErrorModal = true;
            return;
          }

          try {
            const headers = new Headers();
            headers.append("Content-Type", "application/json");

            const response = await fetch(process.env.VUE_APP_API_ENDPOINT_REPORT, {
              method: 'POST',
              headers,
              mode: 'cors',
              cache: 'default',
              body: JSON.stringify({
                token: token,
                locator: this.reportData.postalCode,
                sessionId: this.reportData.sessionId,
                symptoms: symptoms,
                symptomsDays: this.reportData.symptomsDays,
                diagnostic: this.reportData.diagnostic,
                appVersion: process.env.VERSION,
              }),
            });

            console.log(response);

            if (!response.ok) {
              throw new Error('could not report');
            }

            this.forceReportAgain = false;

            window.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth'
            });

          } catch (error) {
            console.error(error);
            this.sendError = `There was a problem when sending your data: ${error}`;
            this.sendErrorModal = true;
          }

          this.reportData.lastReport = new Date();
          localStorage.setItem('report-data', JSON.stringify(this.reportData));

        } finally {
          this.sending = false;
        }
      },
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
      },
      resetData: function () {
        this.reportData = {
          sessionId: null,
          sick: null,
          symptoms: [],
          symptomsDays: 0,
          diagnostic: null,
          postalCode: '',
          lastReport: null,
        }
      },
      contact: async function () {
        await open(process.env.VUE_APP_SOCIAL_FACEBOOK);
      }
    }
  };

</script>

<style scoped>
  .headline {
    font-weight: bold;
  }
</style>
