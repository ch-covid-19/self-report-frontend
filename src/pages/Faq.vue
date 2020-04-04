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
            <h1 class="display-3 text-white">{{ $t('faq.title') }}</h1>

            <h3 class="text-white">{{ $t(`faq.goalQuestion`) }}</h3>
            <p>{{ $t(`faq.goalResponse`) }}</p>

            <h3 class="text-white">{{ $t(`faq.othersQuestion`) }}</h3>
            <p>{{ $t(`faq.othersResponse`) }}</p>

          </div>
        </div>
      </section>
    </div>

  </div>
</template>

<script>

  export default {
    name: "faq",
    components: {},
    data() {
      return {}
    },
  };

</script>

<style scoped>

</style>
