export interface ExchangeRate {
  no: number;
  currency: string;
  currencyCode: string;
  rate: number;
  rateFormatted: string;
  flag: string;
}

interface ApiResponse {
  status: string;
  date: string;
  data: Array<{
    code: string;
    rate: number;
  }>;
}

export class ExchangeRateService {
  private static CACHE_KEY = "exchangeRates";
  private static CACHE_TIMESTAMP_KEY = "exchangeRatesTimestamp";
  private static CACHE_DURATION = 3600000; // 1 hour in milliseconds

  // Currency code to country code mapping for flags
  private static CURRENCY_TO_COUNTRY: Record<string, string> = {
    USD: "US", // United States Dollar
    EUR: "EU", // Euro
    GBP: "GB", // British Pound
    JPY: "JP", // Japanese Yen
    AUD: "AU", // Australian Dollar
    CAD: "CA", // Canadian Dollar
    CHF: "CH", // Swiss Franc
    CNY: "CN", // Chinese Yuan
    HKD: "HK", // Hong Kong Dollar
    NZD: "NZ", // New Zealand Dollar
    SEK: "SE", // Swedish Krona
    KRW: "KR", // South Korean Won
    SGD: "SG", // Singapore Dollar
    NOK: "NO", // Norwegian Krone
    MXN: "MX", // Mexican Peso
    INR: "IN", // Indian Rupee
    RUB: "RU", // Russian Ruble
    ZAR: "ZA", // South African Rand
    TRY: "TR", // Turkish Lira
    BRL: "BR", // Brazilian Real
    TWD: "TW", // Taiwan Dollar
    DKK: "DK", // Danish Krone
    PLN: "PL", // Polish Zloty
    THB: "TH", // Thai Baht
    IDR: "ID", // Indonesian Rupiah
    HUF: "HU", // Hungarian Forint
    CZK: "CZ", // Czech Koruna
    ILS: "IL", // Israeli Shekel
    CLP: "CL", // Chilean Peso
    PHP: "PH", // Philippine Peso
    AED: "AE", // UAE Dirham
    COP: "CO", // Colombian Peso
    SAR: "SA", // Saudi Riyal
    MYR: "MY", // Malaysian Ringgit
    RON: "RO", // Romanian Leu
    VND: "VN", // Vietnamese Dong
    ARS: "AR", // Argentine Peso
    IQD: "IQ", // Iraqi Dinar
  };

  // Currency full names
  private static CURRENCY_NAMES: Record<string, string> = {
    USD: "US Dollar",
    EUR: "Euro",
    GBP: "British Pound",
    JPY: "Japanese Yen",
    AUD: "Australian Dollar",
    CAD: "Canadian Dollar",
    CHF: "Swiss Franc",
    CNY: "Chinese Yuan",
    HKD: "Hong Kong Dollar",
    NZD: "New Zealand Dollar",
    SEK: "Swedish Krona",
    KRW: "South Korean Won",
    SGD: "Singapore Dollar",
    NOK: "Norwegian Krone",
    MXN: "Mexican Peso",
    INR: "Indian Rupee",
    RUB: "Russian Ruble",
    ZAR: "South African Rand",
    TRY: "Turkish Lira",
    BRL: "Brazilian Real",
    TWD: "Taiwan Dollar",
    DKK: "Danish Krone",
    PLN: "Polish Zloty",
    THB: "Thai Baht",
    IDR: "Indonesian Rupiah",
    HUF: "Hungarian Forint",
    CZK: "Czech Koruna",
    ILS: "Israeli Shekel",
    CLP: "Chilean Peso",
    PHP: "Philippine Peso",
    AED: "UAE Dirham",
    COP: "Colombian Peso",
    SAR: "Saudi Riyal",
    MYR: "Malaysian Ringgit",
    RON: "Romanian Leu",
    VND: "Vietnamese Dong",
    ARS: "Argentine Peso",
    IQD: "Iraqi Dinar",
  };

  static async fetchExchangeRates(): Promise<ExchangeRate[]> {
    try {
      // Check cache first
      const cached = await this.getCachedRates();
      if (cached) {
        return cached;
      }

      // Fetch from the API
      const response = await fetch("https://kurs.kausa.tech/");
      const data: ApiResponse = await response.json();

      // Parse the API response
      const rates = this.parseExchangeRates(data);

      // Cache the results
      await this.cacheRates(rates);

      return rates;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      throw error;
    }
  }

  private static parseExchangeRates(apiResponse: ApiResponse): ExchangeRate[] {
    const rates: ExchangeRate[] = [];

    if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
      throw new Error("Invalid API response format");
    }

    apiResponse.data.forEach((item, index) => {
      const currencyCode = item.code;
      const rate = item.rate;

      // Get country code for flag
      const countryCode = this.CURRENCY_TO_COUNTRY[currencyCode] || "";
      const flag = countryCode ? this.getFlagEmoji(countryCode) : "🏳️";

      // Get currency name
      const currencyName = this.CURRENCY_NAMES[currencyCode] || currencyCode;

      // Format rate with thousands separator
      const rateFormatted = this.formatNumber(rate);

      rates.push({
        no: index + 1,
        currency: currencyName,
        currencyCode,
        rate,
        rateFormatted,
        flag,
      });
    });

    return rates;
  }

  private static getFlagEmoji(countryCode: string): string {
    // Convert country code to flag emoji
    // EU flag is special case
    if (countryCode === "EU") {
      return "🇪🇺";
    }

    // Convert ISO country code to regional indicator symbols
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  private static formatNumber(num: number): string {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  private static async getCachedRates(): Promise<ExchangeRate[] | null> {
    try {
      const stored = await chrome.storage.local.get([
        this.CACHE_KEY,
        this.CACHE_TIMESTAMP_KEY,
      ]);

      if (stored[this.CACHE_KEY] && stored[this.CACHE_TIMESTAMP_KEY]) {
        const timestamp = stored[this.CACHE_TIMESTAMP_KEY];
        const now = Date.now();

        // Check if cache is still valid
        if (now - timestamp < this.CACHE_DURATION) {
          return stored[this.CACHE_KEY];
        }
      }

      return null;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  }

  private static async cacheRates(rates: ExchangeRate[]): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.CACHE_KEY]: rates,
        [this.CACHE_TIMESTAMP_KEY]: Date.now(),
      });
    } catch (error) {
      console.error("Error caching rates:", error);
    }
  }

  static async clearCache(): Promise<void> {
    try {
      await chrome.storage.local.remove([
        this.CACHE_KEY,
        this.CACHE_TIMESTAMP_KEY,
      ]);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }
}
