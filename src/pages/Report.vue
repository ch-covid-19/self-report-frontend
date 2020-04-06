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
                  <base-button size="sm" type="info" @click="githubIssue">report a problem</base-button>
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

            <h3 class="text-white">{{ $t('report.sentThanks') }}</h3>
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
        </div>
      </section>
    </div>

  </div>
</template>

<script>
  import {v4 as uuidv4} from 'uuid';

  import Modal from '@/components/Modal';
  import newGithubIssueUrl from 'new-github-issue-url';
  import LocationFromPostalCode from '../views/LocationEditors/LocationFromPostalCode';
  import LocationFromAddress from '../views/LocationEditors/LocationFromAddress';
  import ReportClassic from "../views/ReportForms/Classic";
  import ReportDiseaseOriented from "../views/ReportForms/DiseaseOriented";

  export default {
    name: 'report',
    components: {
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

          // Execute reCAPTCHA with action "report".
          const token = await this.$recaptcha('report');

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

          if (!response.ok) {
            throw new Error('could not report');
          }

          this.reportData.lastReport = new Date();

          localStorage.setItem('report-data', JSON.stringify(this.reportData));
          this.forceReportAgain = false;

          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });

        } catch (error) {
          this.sendError = error;
          this.sendErrorModal = true;
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
      githubIssue: async function () {
        const url = newGithubIssueUrl({
          user: process.env.VUE_APP_GITHUB_REPO_OWNER,
          repo: process.env.VUE_APP_GITHUB_REPO_NAME,
          title: 'Error when sending from the front-end',
          body: `The error is:\n> ${this.sendError}\n\n---\nAuto-generated from the front-end`
        });

        await open(url);
      }
    }
  };

</script>

<style scoped>
  .headline {
    font-weight: bold;
  }
</style>
