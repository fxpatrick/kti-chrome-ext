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
      <div class="exchange-rate-table-wrapper">
        <table class="exchange-rate-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Currency</th>
              <th class="text-right">Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="rate in filteredRates"
              :key="rate.currencyCode"
              class="exchange-rate-row"
            >
              <td class="currency-code">{{ rate.currencyCode }}</td>
              <td class="currency-name">{{ rate.currency }}</td>
              <td
                class="rate text-right clickable"
                @click="copyToClipboard(rate.rateFormatted)"
                :title="'Click to copy ' + rate.rateFormatted"
              >
                {{ rate.rateFormatted }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="exchange-rate-footer">
        <small>{{
          i18n.exchange_rate_source || "Source: kurs.kausa.tech"
        }}</small>
      </div>
    </div>

    <!-- Copy notification -->
    <div
      v-if="showCopyNotification"
      class="copy-notification"
    >
      Copied to clipboard
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
      showCopyNotification: false,
      // Most commonly used currencies (in order of usage)
      currencyPriority: [
        "USD", "EUR", "JPY", "GBP", "CNY", "AUD", "CAD", "CHF",
        "HKD", "SGD", "SEK", "KRW", "NOK", "NZD", "INR", "MXN",
        "TWD", "ZAR", "BRL", "DKK", "PLN", "THB", "ILS", "IDR",
        "CZK", "AED", "TRY", "HUF", "CLP", "SAR", "PHP", "MYR",
        "COP", "RUB", "RON", "PEN", "BHD", "BGN", "ARS"
      ] as string[],
    };
  },
  computed: {
    filteredRates(): ExchangeRate[] {
      let filtered = this.rates;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = this.rates.filter(
          (rate) =>
            rate.currency.toLowerCase().includes(query) ||
            rate.currencyCode.toLowerCase().includes(query)
        );
      }

      // Sort by currency priority
      return filtered.sort((a, b) => {
        const aPriority = this.currencyPriority.indexOf(a.currencyCode);
        const bPriority = this.currencyPriority.indexOf(b.currencyCode);

        // If both currencies are in priority list, sort by priority
        if (aPriority !== -1 && bPriority !== -1) {
          return aPriority - bPriority;
        }

        // If only a is in priority list, a comes first
        if (aPriority !== -1) {
          return -1;
        }

        // If only b is in priority list, b comes first
        if (bPriority !== -1) {
          return 1;
        }

        // If neither is in priority list, sort alphabetically by currency code
        return a.currencyCode.localeCompare(b.currencyCode);
      });
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
    async copyToClipboard(text: string) {
      try {
        // Remove any formatting characters and get just the number
        const cleanText = text.replace(/[^\d.,]/g, "");

        await navigator.clipboard.writeText(cleanText);

        // Show notification
        this.showCopyNotification = true;

        // Hide notification after 2 seconds
        setTimeout(() => {
          this.showCopyNotification = false;
        }, 2000);
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
      }
    },
  },
  mounted() {
    this.loadRates();
  },
});
</script>
