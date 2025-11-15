<template>
  <div class="exchange-rate-page">
    <!-- Search -->
    <div class="under-header" id="exchange-search">
      <input
        id="exchangeSearchInput"
        v-model="searchQuery"
        v-bind:placeholder="i18n.search || 'Search'"
        type="text"
        tabindex="-1"
      />
      <div id="exchangeSearchHint" v-if="searchQuery === ''">
        <div></div>
        <div id="exchangeSearchHintBorder">/</div>
        <div></div>
      </div>
    </div>

    <div v-if="loading" class="text" style="text-align: center; padding: 20px">
      {{ i18n.loading || "Loading..." }}
    </div>

    <div v-else-if="error" class="text warning" style="padding: 20px">
      {{ error }}
    </div>

    <div v-else class="exchange-rate-container">
      <div class="exchange-rate-list">
        <div
          v-for="rate in filteredRates"
          :key="rate.currencyCode"
          class="exchange-rate-item"
        >
          <div class="exchange-rate-left">
            <div class="currency-code">{{ rate.currencyCode }}</div>
            <div class="currency-name">{{ rate.currency }}</div>
          </div>
          <div class="exchange-rate-right">
            <div class="rate">{{ rate.rateFormatted }}</div>
          </div>
        </div>
      </div>

      <div class="exchange-rate-footer">
        <small>{{
          i18n.exchange_rate_source || "Source: kurs.kausa.tech"
        }}</small>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { ExchangeRateService, ExchangeRate } from "../../models/exchange-rate";

export default Vue.extend({
  data() {
    return {
      rates: [] as ExchangeRate[],
      loading: true,
      error: "",
      searchQuery: "",
    };
  },
  computed: {
    filteredRates(): ExchangeRate[] {
      if (!this.searchQuery) {
        return this.rates;
      }

      const query = this.searchQuery.toLowerCase();
      return this.rates.filter(
        (rate) =>
          rate.currency.toLowerCase().includes(query) ||
          rate.currencyCode.toLowerCase().includes(query)
      );
    },
  },
  methods: {
    async requestPermissionAndFetch(): Promise<ExchangeRate[]> {
      return new Promise((resolve, reject) => {
        chrome.permissions.request(
          { origins: ["https://kurs.kausa.tech/*"] },
          async (granted) => {
            if (granted) {
              try {
                const rates = await ExchangeRateService.fetchExchangeRates();
                resolve(rates);
              } catch (err) {
                reject(err);
              }
            } else {
              reject(new Error("Permission denied"));
            }
          }
        );
      });
    },
    async loadRates() {
      try {
        this.loading = true;
        this.error = "";
        this.rates = await this.requestPermissionAndFetch();
      } catch (err) {
        this.error =
          this.i18n.exchange_rate_error ||
          "Failed to load exchange rates. Please try again.";
        console.error("Error loading exchange rates:", err);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.loadRates();
  },
});
</script>
