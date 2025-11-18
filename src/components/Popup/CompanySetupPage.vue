<template>
  <div class="company-setup-overlay">
    <div class="company-setup-modal">
      <div class="company-setup-header">
        <img src="/images/icon.svg" class="setup-icon" alt="" />
        <h2>Welcome to Docfast Toolkit</h2>
      </div>
      <div class="company-setup-body">
        <p>Please enter your company name to get started</p>
        <input
          type="text"
          v-model="companyName"
          placeholder="PT Sejahtera Maju Bersama"
          class="company-input"
          @keyup.enter="submitCompanyName"
          ref="companyInput"
        />
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
      <div class="company-setup-footer">
        <button
          class="submit-button"
          @click="submitCompanyName"
          :disabled="!companyName.trim()"
        >
          Get Started
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      companyName: "",
      errorMessage: "",
    };
  },
  mounted() {
    console.log("CompanySetupPage mounted!");
    // Auto-focus the input field
    this.$nextTick(() => {
      (this.$refs.companyInput as HTMLInputElement)?.focus();
    });
  },
  methods: {
    async submitCompanyName() {
      console.log("submitCompanyName called!", this.companyName);

      if (!this.companyName.trim()) {
        this.errorMessage = "Company name is required";
        console.log("Company name is empty");
        return;
      }

      console.log("Starting submission process...");

      try {
        // Submit to Google Apps Script (fire and forget)
        const scriptUrl =
          "https://script.google.com/macros/s/AKfycbyFyJYKpOU0f_oqYo1XVWQ2ibDmfDLZkyh3CdwZYbC01CTtwXlFVGuPG07v4S2MLU90cQ/exec";

        const formData = new URLSearchParams();
        formData.append("companyName", this.companyName.trim());
        formData.append("timestamp", new Date().toISOString());

        console.log("Submitting to Google Apps Script:", {
          companyName: this.companyName.trim(),
          timestamp: new Date().toISOString(),
          url: scriptUrl
        });

        // Submit data - fire and forget
        fetch(scriptUrl, {
          method: "POST",
          mode: "no-cors",
          body: formData,
        })
          .then(() => {
            console.log("Data sent to Google Apps Script - SUCCESS");
          })
          .catch((err) => {
            console.error("Failed to submit to Google Apps Script:", err);
            // Continue anyway - not critical
          });

        // Save company name to chrome storage
        console.log("Saving to chrome.storage.local...");
        await chrome.storage.local.set({
          companyName: this.companyName.trim(),
          companySetupCompleted: true,
        });
        console.log("Saved to chrome.storage.local successfully");

        // Small delay to ensure storage is written
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Notify parent component/store
        console.log("Updating Vuex store...");
        this.$store.commit("menu/setCompanyName", this.companyName.trim());
        this.$store.commit("menu/setCompanySetupCompleted", true);
        console.log("Setup completed successfully!");
      } catch (error) {
        console.error("Error saving company name:", error);
        this.errorMessage = "Failed to save company name. Please try again.";
      }
    },
  },
});
</script>
