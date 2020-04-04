import Vue from "vue";
import Router from "vue-router";
import AppHeader from "./layout/AppHeader";
import AppFooter from "./layout/AppFooter";

import Report from "./pages/Report.vue";
import Visualize from "./pages/Visualize";
import About from "./pages/About";
import Faq from "./pages/Faq";

Vue.use(Router);

export default new Router({
  linkExactActiveClass: "active",
  mode: 'history',
  routes: [
    {
      path: "/",
      name: "report",
      components: {
        header: AppHeader,
        default: Report,
        footer: AppFooter
      }
    },
    {
      path: "/visualize",
      name: "visualize",
      components: {
        header: AppHeader,
        default: Visualize,
        footer: AppFooter
      }
    },
    {
      path: "/faq",
      name: "faq",
      components: {
        header: AppHeader,
        default: Faq,
        footer: AppFooter
      }
    },
    {
      path: "/about",
      name: "about",
      components: {
        header: AppHeader,
        default: About,
        footer: AppFooter
      }
    }
  ],
  scrollBehavior: to => {
    if (to.hash) {
      return {selector: to.hash};
    } else {
      return {x: 0, y: 0};
    }
  }
});
