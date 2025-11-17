<template>
  <div
    v-cloak
    v-bind:class="{
      'theme-normal':
        theme !== 'accessibility' &&
        theme !== 'dark' &&
        theme !== 'simple' &&
        theme !== 'compact' &&
        theme !== 'flat',
      'theme-accessibility': theme === 'accessibility',
      'theme-dark': theme === 'dark',
      'theme-simple': theme === 'simple',
      'theme-compact': theme === 'compact',
      'theme-flat': theme === 'flat',
      hideoutline,
    }"
    v-on:mousedown="hideoutline = true"
    v-on:keydown="hideoutline = false"
  >
    <MainHeader />

    <div class="tabs">
      <div
        class="tab"
        v-bind:class="{ active: style.activeTab === 'authenticator' }"
        v-on:click="setTab('authenticator')"
      >
        Authenticator
      </div>
      <div
        class="tab"
        v-bind:class="{ active: style.activeTab === 'exchange-rate' }"
        v-on:click="setTab('exchange-rate')"
      >
        Kurs KMK
      </div>
    </div>

    <MainBody
      v-if="style.activeTab === 'authenticator'"
      v-bind:class="{
        timeout: style.timeout && !style.isEditing,
        edit: style.isEditing,
      }"
    />

    <ExchangeRatePage v-if="style.activeTab === 'exchange-rate'" />

    <MenuPage
      id="menu"
      v-show="style.slidein || style.slideout"
      v-bind:class="{ slidein: style.slidein, slideout: style.slideout }"
    />

    <PageHandler
      v-bind:class="{
        fadein: style.fadein,
        fadeout: style.fadeout,
        show: style.show,
      }"
    />

    <NotificationHandler />

    <!-- EPHERMAL MESSAGE -->
    <div
      id="notification"
      v-bind:class="{
        fadein: style.notificationFadein,
        fadeout: style.notificationFadeout,
      }"
    >
      {{ notification }}
    </div>

    <!-- QR -->
    <div
      id="qr"
      v-bind:class="{ qrfadein: style.qrfadein, qrfadeout: style.qrfadeout }"
      v-bind:style="{ 'background-image': qr }"
      v-on:click="hideQr()"
    ></div>

    <!-- CLIPBOARD -->
    <input type="text" id="codeClipboard" tabindex="-1" />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

import MainHeader from "./Popup/MainHeader.vue";
import MainBody from "./Popup/MainBody.vue";
import MenuPage from "./Popup/MenuPage.vue";
import PageHandler from "./Popup/PageHandler.vue";
import NotificationHandler from "./Popup/NotificationHandler.vue";
import ExchangeRatePage from "./Popup/ExchangeRatePage.vue";

const computedPrototype = [
  mapState("style", ["style"]),
  mapState("menu", ["theme"]),
  mapState("qr", ["qr"]),
  mapState("notification", ["notification"]),
];

let computed = {};

for (const module of computedPrototype) {
  Object.assign(computed, module);
}

export default Vue.extend({
  data: function () {
    return {
      hideoutline: true,
    };
  },
  computed,
  methods: {
    hideQr() {
      this.$store.commit("style/hideQr");
    },
    setTab(tab: string) {
      this.$store.commit("style/setActiveTab", tab);
    },
  },
  components: {
    MainHeader,
    MainBody,
    MenuPage,
    PageHandler,
    NotificationHandler,
    ExchangeRatePage,
  },
});
</script>
