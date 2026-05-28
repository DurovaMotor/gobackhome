(function () {
  "use strict";

  var VERSION = "20260526-configurable-ipgate";
  var ACCESS_RULES = {"chinaIp":true,"chinaTimezone":true,"chineseLanguage":true};
  var RULE_KEY = [
    ACCESS_RULES.chinaIp ? "ip1" : "ip0",
    ACCESS_RULES.chinaTimezone ? "tz1" : "tz0",
    ACCESS_RULES.chineseLanguage ? "lang1" : "lang0"
  ].join(".");
  var CACHE_KEY = "hightacAccessGate." + VERSION + "." + RULE_KEY;
  var BYPASS_KEY = "hightacAdamBypass";
  var CACHE_MS = 6 * 60 * 60 * 1000;
  var REQUEST_TIMEOUT_MS = 2400;
  var BLOCKED_COUNTRIES = { CN: true };
  var GEO_URLS = [
    "https://ipapi.co/json/",
    "https://ipwho.is/"
  ];

  var root = document.documentElement;
  var pendingStyle = document.createElement("style");
  pendingStyle.textContent = "html[data-access-pending] body{opacity:0!important;pointer-events:none!important}";
  document.head.appendChild(pendingStyle);
  root.setAttribute("data-access-pending", "1");

  var guard = {
    ready: null,
    loadScripts: loadScripts
  };
  window.HIGHTAC_ACCESS_GUARD = guard;
  guard.ready = run();

  function storageGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      // The guard still works without caching.
    }
  }

  function hasAdamBypass() {
    return storageGet(BYPASS_KEY) === "1" || /\/Adam(?:\/|$)/i.test(window.location.pathname);
  }

  function getCachedDecision() {
    try {
      var cached = JSON.parse(storageGet(CACHE_KEY) || "null");
      if (!cached || cached.expiresAt <= Date.now()) {
        return null;
      }
      return cached.decision;
    } catch (error) {
      return null;
    }
  }

  function setCachedDecision(decision) {
    storageSet(CACHE_KEY, JSON.stringify({
      decision: decision,
      expiresAt: Date.now() + CACHE_MS
    }));
  }

  function getBrowserSignals() {
    var languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    var timeZone = "";

    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch (error) {
      timeZone = "";
    }

    return {
      chineseLanguage: languages.some(function (language) {
        return /^zh(?:-|$)/i.test(language || "");
      }),
      chinaTimeZone: /^(Asia\/Shanghai|Asia\/Chongqing|Asia\/Harbin|Asia\/Urumqi)$/i.test(timeZone),
      timeZone: timeZone
    };
  }

  function normalizeCountry(payload) {
    var country = payload && (payload.country_code || payload.countryCode || payload.country);
    return typeof country === "string" ? country.toUpperCase() : "";
  }

  function fetchJsonWithTimeout(url) {
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeout = window.setTimeout(function () {
      if (controller) {
        controller.abort();
      }
    }, REQUEST_TIMEOUT_MS);

    return fetch(url, {
      cache: "no-store",
      signal: controller ? controller.signal : undefined
    }).then(function (response) {
      window.clearTimeout(timeout);
      if (!response.ok) {
        throw new Error("IP check failed");
      }
      return response.json();
    }).catch(function (error) {
      window.clearTimeout(timeout);
      throw error;
    });
  }

  function detectCountry() {
    var chain = Promise.resolve("");

    GEO_URLS.forEach(function (url) {
      chain = chain.then(function (country) {
        if (country) {
          return country;
        }
        return fetchJsonWithTimeout(url).then(normalizeCountry).catch(function () {
          return "";
        });
      });
    });

    return chain;
  }

  function shouldBlock(country, signals) {
    if (ACCESS_RULES.chinaIp && BLOCKED_COUNTRIES[country]) {
      return true;
    }
    if (ACCESS_RULES.chinaTimezone && signals.chinaTimeZone) {
      return true;
    }
    if (ACCESS_RULES.chineseLanguage && signals.chineseLanguage) {
      return true;
    }
    return false;
  }

  function showPage() {
    root.removeAttribute("data-access-pending");
    return true;
  }

  function blockPage() {
    setCachedDecision("block");
    window.location.replace("./blocked.html");
    return false;
  }

  function allowPage() {
    setCachedDecision("allow");
    return showPage();
  }

  function run() {
    if (hasAdamBypass()) {
      return Promise.resolve(showPage());
    }

    var cached = getCachedDecision();
    if (cached === "allow") {
      return Promise.resolve(showPage());
    }
    if (cached === "block") {
      return Promise.resolve(blockPage());
    }

    var signals = getBrowserSignals();
    if (!ACCESS_RULES.chinaIp) {
      return Promise.resolve(shouldBlock("", signals) ? blockPage() : allowPage());
    }

    return detectCountry().then(function (country) {
      return shouldBlock(country, signals) ? blockPage() : allowPage();
    }).catch(function () {
      return shouldBlock("", signals) ? blockPage() : allowPage();
    });
  }

  function appendScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  function loadScripts(sources) {
    var list = Array.prototype.slice.call(sources || []);
    return guard.ready.then(function (allowed) {
      if (!allowed) {
        return false;
      }

      return list.reduce(function (promise, src) {
        return promise.then(function () {
          return appendScript(src);
        });
      }, Promise.resolve()).then(function () {
        return true;
      });
    });
  }
})();
