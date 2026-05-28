(function () {
  var CART_KEY = "hightac-gobackhome-cart-v1";
  var SUBMISSION_KEY = "hightac-gobackhome-last-submission-v1";
  var LANG_KEY = "hightac-gobackhome-language-v1";
  var DEFAULT_LANG = "fr";
  var PAGE_SIZE = Number.MAX_SAFE_INTEGER;

  var LOCALES = {
    fr: {
      dir: "ltr",
      title_home: "BOUTIQUE HIGHTAC",
      title_parts: "Pièces gobackhome",
      title_success: "WhatsApp",
      home_shop: "BOUTIQUE HIGHTAC",
      home_whatsapp: "WhatsApp",
      home_hint: "Cliquez sur le scooter pour voir toutes les pièces",
      back_models: "Retour aux modèles",
      back_parts: "Retour aux pièces",
      send_whatsapp: "Envoyer sur WhatsApp",
      open_whatsapp: "Ouvrir WhatsApp",
      search_label: "Recherche",
      search_placeholder: "Rechercher un nom ou un code",
      loading: "Chargement...",
      loading_more: "Chargement...",
      no_parts: "Aucune pièce.",
      code_label: "Code",
      source_model_label: "Modèles",
      latest_price_label: "Prices",
      price_unavailable: "Prices unavailable",
      price_notice: "Les prix proviennent du fichier Excel téléversé ; le devis final fait foi.",
      qty_label: "Qté",
      cart_label: "Panier",
      cart_title: "Panier",
      cart_empty: "Le panier est vide.",
      cart_lines: "{count} article(s)",
      cart_total: "Qté {count}",
      cart_send: "Envoyer sur WhatsApp",
      cart_close: "Fermer",
      success_title: "Message prêt",
      success_ready: "Votre message WhatsApp est prêt.",
      success_missing: "Aucun message trouvé.",
      toast_empty: "Le panier est vide.",
      unnamed_part: "Pièce",
      language_en: "English",
      language_fr: "Français",
      language_ar: "العربية"
    },
    en: {
      dir: "ltr",
      title_home: "HIGHTAC SHOP",
      title_parts: "gobackhome Parts",
      title_success: "WhatsApp",
      home_shop: "HIGHTAC SHOP",
      home_whatsapp: "WhatsApp",
      home_hint: "Click the scooter to view all parts",
      back_models: "Back to Models",
      back_parts: "Back to Parts",
      send_whatsapp: "Send to WhatsApp",
      open_whatsapp: "Open WhatsApp",
      search_label: "Search",
      search_placeholder: "Search by name or code",
      loading: "Loading...",
      loading_more: "Loading...",
      no_parts: "No parts found.",
      code_label: "Code",
      source_model_label: "Models",
      latest_price_label: "Prices",
      price_unavailable: "Prices unavailable",
      price_notice: "Prices come from the uploaded Excel file; final quotation applies.",
      qty_label: "Qty",
      cart_label: "Cart",
      cart_title: "Cart",
      cart_empty: "Cart is empty.",
      cart_lines: "{count} item(s)",
      cart_total: "Qty {count}",
      cart_send: "Send to WhatsApp",
      cart_close: "Close",
      success_title: "Message ready",
      success_ready: "Your WhatsApp message is ready.",
      success_missing: "No message found.",
      toast_empty: "Cart is empty.",
      unnamed_part: "Part",
      language_en: "English",
      language_fr: "French",
      language_ar: "Arabic"
    },
    ar: {
      dir: "rtl",
      title_home: "متجر HIGHTAC",
      title_parts: "قطع gobackhome",
      title_success: "واتساب",
      home_shop: "متجر HIGHTAC",
      home_whatsapp: "واتساب",
      home_hint: "اضغط على السكوتر لعرض جميع القطع",
      back_models: "العودة إلى الموديلات",
      back_parts: "العودة إلى القطع",
      send_whatsapp: "إرسال إلى واتساب",
      open_whatsapp: "افتح واتساب",
      search_label: "بحث",
      search_placeholder: "ابحث بالاسم أو الرمز",
      loading: "جارٍ التحميل...",
      loading_more: "جارٍ التحميل...",
      no_parts: "لا توجد قطع.",
      code_label: "الرمز",
      source_model_label: "الموديلات",
      latest_price_label: "Prices",
      price_unavailable: "Prices unavailable",
      price_notice: "الأسعار مأخوذة من ملف Excel المرفوع؛ ويُعتمد عرض السعر النهائي.",
      qty_label: "الكمية",
      cart_label: "السلة",
      cart_title: "السلة",
      cart_empty: "السلة فارغة.",
      cart_lines: "{count} عنصر",
      cart_total: "الكمية {count}",
      cart_send: "إرسال إلى واتساب",
      cart_close: "إغلاق",
      success_title: "الرسالة جاهزة",
      success_ready: "رسالة واتساب جاهزة.",
      success_missing: "لا توجد رسالة.",
      toast_empty: "السلة فارغة.",
      unnamed_part: "قطعة",
      language_en: "English",
      language_fr: "Français",
      language_ar: "العربية"
    }
  };

  var state = {
    lang: readStorage(LANG_KEY, DEFAULT_LANG),
    catalog: null,
    filtered: [],
    rendered: 0,
    index: {},
    originalIndex: {},
    observer: null
  };

  if (document.readyState === "loading") {
    if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  } else {
    init();
  }

  function init() {
    state.catalog = getCatalog();
    buildPartIndexes();
    normalizeCartCodes();
    initLanguageSwitchers();
    initCartShell();
    initImageProtection();
    initPage();
    applyLanguage();
  }

  function getCatalog() {
    if (window.HIGHTAC_PARTS_DATA && Array.isArray(window.HIGHTAC_PARTS_DATA.parts)) {
      return window.HIGHTAC_PARTS_DATA;
    }

    return {
      model: {
        name: "gobackhome",
        motorPicture: "Database/MotorPictures/gobackhome.png"
      },
      parts: []
    };
  }


  function buildPartIndexes() {
    state.index = {};
    state.originalIndex = {};
    (state.catalog.parts || []).forEach(function (part) {
      var code = cleanText(part && part.code);
      var originalCode = cleanText(part && part.originalCode);
      if (code) {
        state.index[code] = part;
      }
      if (originalCode) {
        state.originalIndex[originalCode] = part;
      }
    });
  }

  function findCatalogPart(code) {
    code = cleanText(code);
    if (!code) {
      return null;
    }
    return (state.index && state.index[code]) ||
      (state.originalIndex && state.originalIndex[code]) ||
      null;
  }

  function buildCartItem(part, quantity) {
    return {
      code: part.code,
      originalCode: part.originalCode || "",
      sourceModel: part.sourceModel || part.useModels || "",
      useModels: part.useModels || part.sourceModel || "",
      unit: part.unit || "",
      nameEn: part.nameEn || "",
      nameFr: part.nameFr || "",
      nameAr: part.nameAr || "",
      nameZh: part.nameZh || "",
      displayName: part.displayName || "",
      material: part.material || "",
      materialEn: part.materialEn || "",
      materialFr: part.materialFr || "",
      materialAr: part.materialAr || "",
      picture: part.picture || null,
      latestPrice: getLatestPrice(part),
      latestPriceCurrency: part.latestPriceCurrency || "CNY",
      quantity: Math.max(0, Math.floor(Number(quantity) || 0))
    };
  }

  function normalizeCartCodes() {
    var cart = loadCart();
    var next = {};
    var changed = false;

    Object.keys(cart).forEach(function (key) {
      var item = cart[key];
      var part;
      var normalized;

      if (!item || !item.code) {
        changed = true;
        return;
      }

      part = findCatalogPart(item.code) ||
        findCatalogPart(item.originalCode) ||
        findCatalogPart(key);

      if (!part) {
        if (item.quantity > 0) {
          next[key] = item;
        } else {
          changed = true;
        }
        return;
      }

      normalized = buildCartItem(part, item.quantity);
      if (normalized.quantity <= 0) {
        changed = true;
        return;
      }

      if (next[normalized.code]) {
        next[normalized.code].quantity += normalized.quantity;
        changed = true;
      } else {
        next[normalized.code] = normalized;
      }

      if (normalized.code !== key ||
        normalized.code !== item.code ||
        normalized.originalCode !== (item.originalCode || "")) {
        changed = true;
      }
    });

    if (changed) {
      saveCart(next);
    }

    return changed ? next : cart;
  }

  function readStorage(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("storage write failed", key, error);
    }
  }

  function t(key, vars) {
    var langMap = LOCALES[state.lang] || LOCALES[DEFAULT_LANG];
    var text = langMap[key] || LOCALES[DEFAULT_LANG][key] || key;
    var output = text;

    if (vars) {
      Object.keys(vars).forEach(function (name) {
        output = output.replaceAll("{" + name + "}", vars[name]);
      });
    }

    return output;
  }

  function setLanguage(lang) {
    if (!LOCALES[lang]) {
      return;
    }

    state.lang = lang;
    writeStorage(LANG_KEY, lang);
    applyLanguage();
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = LOCALES[state.lang].dir;
    document.body.classList.toggle("is-rtl", LOCALES[state.lang].dir === "rtl");

    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (node) {
      node.setAttribute("placeholder", t(node.getAttribute("data-i18n-placeholder")));
    });

    document.querySelectorAll("[data-lang-switcher]").forEach(function (switcher) {
      switcher.querySelectorAll("[data-lang]").forEach(function (button) {
        var buttonLang = button.getAttribute("data-lang");
        button.textContent = t("language_" + buttonLang);
        button.classList.toggle("is-active", buttonLang === state.lang);
      });
    });

    updateTitles();
    renderHome();
    renderPartsPage();
    renderCartButton();
    renderCartDrawer();
    renderSuccessPage();
  }

  function updateTitles() {
    var page = document.body.getAttribute("data-page");

    if (page === "home") {
      document.title = t("title_home");
    } else if (page === "parts") {
      document.title = t("title_parts");
    } else if (page === "success") {
      document.title = t("title_success");
    }
  }

  function initLanguageSwitchers() {
    document.querySelectorAll("[data-lang-switcher] [data-lang]").forEach(function (button) {
      button.addEventListener("click", function () {
        setLanguage(button.getAttribute("data-lang"));
      });
    });
  }

  function initImageProtection() {
    var protectedSelector = "img, [data-protected-image], .home-bike-link__visual, .part-row__image-box, .cart-item__image";

    ["contextmenu", "dragstart", "selectstart"].forEach(function (eventName) {
      document.addEventListener(eventName, function (event) {
        if (event.target.closest(protectedSelector)) {
          event.preventDefault();
        }
      }, true);
    });
  }

  function renderHome() {
    if (document.body.getAttribute("data-page") !== "home") {
      return;
    }

    var image = document.querySelector("[data-home-image]");
    var label = document.querySelector("[data-home-model]");
    var link = document.querySelector(".home-bike-link");

    if (image) {
      image.src = "./" + state.catalog.model.motorPicture;
      image.alt = state.catalog.model.name;
      image.draggable = false;
      image.setAttribute("data-protected-image", "");
    }

    if (label) {
      label.textContent = state.catalog.model.name;
    }

    if (link) {
      link.setAttribute("aria-label", state.catalog.model.name);
    }
  }

  function getPartName(part) {
    return getPreferredPartName(part, t("unnamed_part"));
  }

  function getPartMessageName(part) {
    return cleanText(part && part.nameEn) ||
      cleanText(part && part.displayName) ||
      cleanText(part && part.nameZh) ||
      cleanText(part && part.code) ||
      LOCALES.en.unnamed_part;
  }

  function getPreferredPartName(part, fallback) {
    var localized = state.lang === "fr" ? part && part.nameFr :
      state.lang === "ar" ? part && part.nameAr :
      part && part.nameEn;

    return cleanText(localized) ||
      cleanText(part && part.nameEn) ||
      cleanText(part && part.displayName) ||
      cleanText(part && part.nameZh) ||
      cleanText(part && part.code) ||
      fallback;
  }

  function cleanText(value) {
    return String(value == null ? "" : value).trim();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatNumber(value) {
    return new Intl.NumberFormat(
      state.lang === "ar" ? "ar" : state.lang === "fr" ? "fr-FR" : "en-US"
    ).format(value || 0);
  }

  function getLatestPrice(part) {
    var price = Number(part && part.latestPrice);
    return Number.isFinite(price) ? price : null;
  }

  function formatPriceAmount(value) {
    return "CNY " + new Intl.NumberFormat(
      state.lang === "ar" ? "ar" : state.lang === "fr" ? "fr-FR" : "en-US",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    ).format(value || 0);
  }

  function formatLatestPrice(part) {
    var price = getLatestPrice(part);
    return price == null ? t("price_unavailable") : formatPriceAmount(price);
  }

  function formatLatestPriceForMessage(part) {
    var price = getLatestPrice(part);
    return price == null ? "N/A" : formatPriceAmount(price);
  }

  function buildPlaceholderImage(part) {
    var code = escapeHtml(cleanText(part && part.code) || "NO CODE");
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 160">' +
        '<rect width="220" height="160" rx="16" fill="#f6f6f6"/>' +
        '<text x="16" y="88" fill="#111" font-size="18" font-family="Arial, sans-serif" font-weight="700">' + code + "</text>" +
      "</svg>"
    );
  }

  function resolveImage(part) {
    if (part && part.picture) {
      return "./" + part.picture;
    }

    return buildPlaceholderImage(part);
  }

  function loadCart() {
    return readStorage(CART_KEY, {});
  }

  function saveCart(cart) {
    writeStorage(CART_KEY, cart);
  }

  function getCartItems() {
    var cart = normalizeCartCodes();

    return Object.values(cart)
      .filter(function (item) {
        return item && item.code && item.quantity > 0;
      })
      .sort(function (left, right) {
        return getPartName(left).localeCompare(getPartName(right));
      });
  }

  function getCartSummary() {
    var items = getCartItems();

    return {
      items: items,
      lineCount: items.length,
      totalQuantity: items.reduce(function (sum, item) {
        return sum + item.quantity;
      }, 0)
    };
  }

  function getPartQuantity(code) {
    var cart = loadCart();
    return cart[code] ? cart[code].quantity : 0;
  }

  function updateCartQuantity(part, quantity) {
    if (!part || !part.code) {
      return 0;
    }

    var next = Math.max(0, Math.floor(Number(quantity) || 0));
    var cart = loadCart();

    if (next <= 0) {
      delete cart[part.code];
      saveCart(cart);
      renderCartButton();
      renderCartDrawer();
      syncPartInputs();
      return 0;
    }

    cart[part.code] = buildCartItem(part, next);

    saveCart(cart);
    renderCartButton();
    renderCartDrawer();
    syncPartInputs();
    return next;
  }

  function changeCartQuantity(part, delta) {
    return updateCartQuantity(part, getPartQuantity(part.code) + delta);
  }


  function parseQuantityInput(value) {
    var next = Math.floor(Number(value));
    return Number.isFinite(next) && next > 0 ? next : 0;
  }

  function commitQuantityInput(input, part) {
    var next;
    var updated;

    if (!input || !part) {
      return;
    }

    next = parseQuantityInput(input.value);
    updated = updateCartQuantity(part, next);
    input.value = String(updated);
  }

  function initPage() {
    var page = document.body.getAttribute("data-page");

    if (page === "parts") {
      initPartsPage();
    }
  }

  function initPartsPage() {
    var search = document.getElementById("parts-search");
    var submit = document.getElementById("page-submit");
    var sentinel = document.getElementById("parts-sentinel");

    if (!search || !submit) {
      return;
    }

    buildPartIndexes();

    submit.addEventListener("click", submitCart);
    search.addEventListener("input", function () {
      renderPartsPage();
    });

    if ("IntersectionObserver" in window && sentinel) {
      state.observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            renderNextChunk();
          }
        });
      }, { rootMargin: "240px 0px" });

      state.observer.observe(sentinel);
    }
  }

  function getFilteredParts() {
    var search = document.getElementById("parts-search");
    var term = search ? search.value.trim().toLowerCase() : "";

    if (!term) {
      return state.catalog.parts.slice();
    }

    return state.catalog.parts.filter(function (part) {
      var haystack = String(part.searchText || "").toLowerCase();
      return haystack.includes(term);
    });
  }

  function renderPartsPage() {
    if (document.body.getAttribute("data-page") !== "parts") {
      return;
    }

    state.filtered = getFilteredParts();
    state.rendered = 0;

    var list = document.getElementById("parts-list");
    var empty = document.getElementById("parts-empty");
    var loading = document.getElementById("parts-loading");
    var sentinel = document.getElementById("parts-sentinel");

    if (!list || !empty || !loading || !sentinel) {
      return;
    }

    list.innerHTML = "";
    empty.hidden = state.filtered.length > 0;
    loading.hidden = state.filtered.length === 0;
    loading.textContent = t("loading");
    sentinel.hidden = state.filtered.length === 0;

    if (!state.filtered.length) {
      return;
    }

    renderNextChunk();
  }

  function renderNextChunk() {
    if (document.body.getAttribute("data-page") !== "parts") {
      return;
    }

    var list = document.getElementById("parts-list");
    var loading = document.getElementById("parts-loading");
    var sentinel = document.getElementById("parts-sentinel");

    if (!list || !loading || !sentinel) {
      return;
    }

    if (state.rendered >= state.filtered.length) {
      loading.hidden = true;
      sentinel.hidden = true;
      return;
    }

    var slice = state.filtered.slice(state.rendered, state.rendered + PAGE_SIZE);
    list.insertAdjacentHTML("beforeend", slice.map(renderPartRow).join(""));
    state.rendered += slice.length;
    bindPartRowEvents(list);
    syncPartInputs();

    if (state.rendered >= state.filtered.length) {
      loading.hidden = true;
      sentinel.hidden = true;
    } else {
      loading.hidden = false;
      loading.textContent = t("loading_more");
      sentinel.hidden = false;
    }
  }

  function renderPartRow(part) {
    var quantity = getPartQuantity(part.code);
    var sourceModel = cleanText(part && part.sourceModel);

    return '' +
      '<article class="part-row" data-part-code="' + escapeHtml(part.code) + '">' +
        '<div class="part-row__image-box">' +
          '<img class="part-row__image" src="' + resolveImage(part) + '" alt="' + escapeHtml(getPartName(part)) + '" loading="lazy" draggable="false" data-protected-image>' +
        '</div>' +
        '<div class="part-row__body">' +
          '<div class="part-row__title">' + escapeHtml(getPartName(part)) + '</div>' +
          '<div class="part-row__code">' + t("code_label") + ': ' + escapeHtml(part.code) + '</div>' +
          (sourceModel ? '<div class="part-row__code">' + t("source_model_label") + ': ' + escapeHtml(sourceModel) + '</div>' : '') +
          '<div class="part-row__price">' + t("latest_price_label") + ': ' + escapeHtml(formatLatestPrice(part)) + '</div>' +
          '<div class="part-row__controls">' +
            '<button class="control-btn control-btn--plain" type="button" data-action="minus10">-10</button>' +
            '<div class="manual-box">' +
              '<span>' + t("qty_label") + '</span>' +
              '<input class="manual-box__input" type="number" inputmode="numeric" min="0" step="1" value="' + escapeHtml(String(quantity)) + '" data-qty-input aria-label="' + escapeHtml(t("qty_label")) + '">' +
            '</div>' +
            '<button class="control-btn control-btn--plain" type="button" data-action="plus10">+10</button>' +
            '<button class="control-btn control-btn--plain" type="button" data-action="plus100">+100</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function bindPartRowEvents(root) {
    root.querySelectorAll("[data-part-code]").forEach(function (row) {
      if (row.dataset.bound === "1") {
        return;
      }

      row.dataset.bound = "1";
      row.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-action]");
        var code;
        var part;
        var action;

        if (!button) {
          return;
        }

        code = row.getAttribute("data-part-code");
        part = state.index[code];

        if (!part) {
          return;
        }

        action = button.getAttribute("data-action");

        if (action === "minus10") {
          changeCartQuantity(part, -10);
        } else if (action === "plus10") {
          changeCartQuantity(part, 10);
        } else if (action === "plus100") {
          changeCartQuantity(part, 100);
        }
      });


      row.addEventListener("change", function (event) {
        var input = event.target.closest("[data-qty-input]");
        var code;
        var part;

        if (!input) {
          return;
        }

        code = row.getAttribute("data-part-code");
        part = findCatalogPart(code);
        commitQuantityInput(input, part);
      });

      row.addEventListener("keydown", function (event) {
        var input = event.target.closest("[data-qty-input]");

        if (!input || event.key !== "Enter") {
          return;
        }

        event.preventDefault();
        input.blur();
      });
    });
  }

  function syncPartInputs() {
    document.querySelectorAll("[data-part-code]").forEach(function (row) {
      var code = row.getAttribute("data-part-code");
      var input = row.querySelector("[data-qty-input]");
      var quantity = getPartQuantity(code);

      if (input && document.activeElement !== input) {
        input.value = String(quantity);
      }
    });
  }

  function initCartShell() {
    if (document.querySelector("[data-cart-toggle]")) {
      return;
    }

    var wrapper = document.createElement("div");
    wrapper.innerHTML = '' +
      '<button class="cart-fab" type="button" data-cart-toggle aria-label="Cart">' +
        '<span class="cart-fab__label"></span>' +
        '<span class="cart-fab__count" data-cart-count>0</span>' +
      '</button>' +
      '<div class="cart-mask" data-cart-mask hidden></div>' +
      '<aside class="cart-drawer" data-cart-drawer aria-hidden="true">' +
        '<div class="cart-drawer__header">' +
          '<strong data-cart-title></strong>' +
          '<button class="cart-drawer__close" type="button" data-cart-close aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="cart-drawer__summary">' +
          '<span data-cart-lines></span>' +
          '<span data-cart-total></span>' +
        '</div>' +
        '<div class="cart-drawer__body" data-cart-items></div>' +
        '<div class="cart-drawer__footer">' +
          '<button class="cart-drawer__send" type="button" data-cart-submit></button>' +
        '</div>' +
      '</aside>';
    document.body.appendChild(wrapper);

    var toggle = document.querySelector("[data-cart-toggle]");
    var mask = document.querySelector("[data-cart-mask]");
    var closeButton = document.querySelector("[data-cart-close]");
    var submitButton = document.querySelector("[data-cart-submit]");
    var drawer = document.querySelector("[data-cart-drawer]");

    toggle.addEventListener("click", function () {
      setCartOpen(true);
    });

    mask.addEventListener("click", function () {
      setCartOpen(false);
    });

    closeButton.addEventListener("click", function () {
      setCartOpen(false);
    });

    submitButton.addEventListener("click", submitCart);

    drawer.addEventListener("click", function (event) {
      var button = event.target.closest("[data-cart-action]");
      var code;
      var item;

      if (!button) {
        return;
      }

      code = button.getAttribute("data-code");
      item = loadCart()[code];

      if (!item) {
        return;
      }

      if (button.getAttribute("data-cart-action") === "minus10") {
        changeCartQuantity(item, -10);
      } else if (button.getAttribute("data-cart-action") === "plus10") {
        changeCartQuantity(item, 10);
      } else if (button.getAttribute("data-cart-action") === "plus100") {
        changeCartQuantity(item, 100);
      }
    });



    drawer.addEventListener("change", function (event) {
      var input = event.target.closest("[data-cart-qty-input]");
      var code;
      var item;
      var part;

      if (!input) {
        return;
      }

      code = input.getAttribute("data-code");
      item = loadCart()[code];
      part = findCatalogPart(code) || item;
      commitQuantityInput(input, part);
    });

    drawer.addEventListener("keydown", function (event) {
      var input = event.target.closest("[data-cart-qty-input]");

      if (!input || event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      input.blur();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setCartOpen(false);
      }
    });
  }

  function setCartOpen(open) {
    var drawer = document.querySelector("[data-cart-drawer]");
    var mask = document.querySelector("[data-cart-mask]");

    if (!drawer || !mask) {
      return;
    }

    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    mask.hidden = !open;
  }

  function renderCartButton() {
    var button = document.querySelector("[data-cart-toggle]");
    var label = document.querySelector(".cart-fab__label");
    var count = document.querySelector("[data-cart-count]");
    var summary = getCartSummary();

    if (!button || !label || !count) {
      return;
    }

    button.setAttribute("aria-label", t("cart_title"));
    label.textContent = t("cart_label");
    count.textContent = String(summary.totalQuantity);
    count.hidden = summary.totalQuantity <= 0;
  }

  function renderCartDrawer() {
    var drawer = document.querySelector("[data-cart-drawer]");

    if (!drawer) {
      return;
    }

    var summary = getCartSummary();
    var title = drawer.querySelector("[data-cart-title]");
    var lines = drawer.querySelector("[data-cart-lines]");
    var total = drawer.querySelector("[data-cart-total]");
    var itemsHost = drawer.querySelector("[data-cart-items]");
    var submit = drawer.querySelector("[data-cart-submit]");
    var close = drawer.querySelector("[data-cart-close]");

    title.textContent = t("cart_title");
    lines.textContent = t("cart_lines", { count: formatNumber(summary.lineCount) });
    total.textContent = t("cart_total", { count: formatNumber(summary.totalQuantity) });
    submit.textContent = t("cart_send");
    submit.disabled = summary.lineCount === 0;
    close.setAttribute("aria-label", t("cart_close"));

    if (!summary.lineCount) {
      itemsHost.innerHTML = '<div class="empty-card">' + escapeHtml(t("cart_empty")) + "</div>";
      return;
    }

    itemsHost.innerHTML = summary.items.map(function (item) {
      return '' +
        '<article class="cart-item">' +
          '<img class="cart-item__image" src="' + resolveImage(item) + '" alt="' + escapeHtml(getPartName(item)) + '" draggable="false" data-protected-image>' +
          '<div class="cart-item__body">' +
            '<div class="cart-item__name">' + escapeHtml(getPartName(item)) + '</div>' +
            '<div class="cart-item__code">' + t("code_label") + ': ' + escapeHtml(item.code) + '</div>' +
            '<div class="cart-item__price">' + t("latest_price_label") + ': ' + escapeHtml(formatLatestPrice(item)) + '</div>' +
            '<div class="cart-item__controls">' +
              '<button class="control-btn control-btn--plain" type="button" data-cart-action="minus10" data-code="' + escapeHtml(item.code) + '">-10</button>' +
              '<div class="manual-box manual-box--cart">' +
                '<span>' + t("qty_label") + '</span>' +
                '<input class="manual-box__input" type="number" inputmode="numeric" min="0" step="1" value="' + escapeHtml(String(item.quantity)) + '" data-cart-qty-input data-code="' + escapeHtml(item.code) + '" aria-label="' + escapeHtml(t("qty_label")) + '">' +
              "</div>" +
              '<button class="control-btn control-btn--plain" type="button" data-cart-action="plus10" data-code="' + escapeHtml(item.code) + '">+10</button>' +
              '<button class="control-btn control-btn--plain" type="button" data-cart-action="plus100" data-code="' + escapeHtml(item.code) + '">+100</button>' +
            "</div>" +
          "</div>" +
        "</article>";
    }).join("");
  }

  function buildWhatsAppMessage(items, modelName) {
    var lines = items.map(function (item, index) {
      var price = getLatestPrice(item);
      var subtotal = price == null ? "N/A" : formatPriceAmount(price * item.quantity);
      return (index + 1) + ". " + getPartMessageName(item) + " | " + item.code + " | Qty: " + item.quantity + " | Prices: " + formatLatestPriceForMessage(item) + " | Subtotal: " + subtotal;
    });

    return [
      "Hello HIGHTAC, I want to inquire about these parts:",
      "",
      "Model: " + modelName,
      "Price note: prices come from the uploaded Excel file; final quotation applies.",
      "",
      lines.join("\n"),
      "",
      "Please send me the price and delivery time."
    ].join("\n");
  }

  function buildWhatsAppUrl(items, modelName) {
    return "https://wa.me/8613602489689?text=" + encodeURIComponent(buildWhatsAppMessage(items, modelName));
  }

  function submitCart() {
    var summary = getCartSummary();

    if (!summary.lineCount) {
      showToast(t("toast_empty"));
      return;
    }

    var modelName = state.catalog.model.name || "gobackhome";
    writeStorage(SUBMISSION_KEY, {
      model: modelName,
      items: summary.items,
      url: buildWhatsAppUrl(summary.items, modelName),
      createdAt: new Date().toISOString()
    });

    window.location.href = "./success.html";
  }

  function renderSuccessPage() {
    if (document.body.getAttribute("data-page") !== "success") {
      return;
    }

    var submission = readStorage(SUBMISSION_KEY, null);
    var text = document.getElementById("success-text");
    var list = document.getElementById("success-items");
    var openButton = document.getElementById("success-open");

    if (!text || !list || !openButton) {
      return;
    }

    if (!submission || !submission.items || !submission.items.length) {
      text.textContent = t("success_missing");
      openButton.href = "./parts.html";
      openButton.textContent = t("back_parts");
      list.innerHTML = '<div class="empty-card">' + escapeHtml(t("success_missing")) + "</div>";
      return;
    }

    text.textContent = t("success_ready");
    openButton.href = submission.url;
    list.innerHTML = submission.items.map(function (item) {
      return '' +
        '<article class="summary-item">' +
          '<div class="summary-item__main">' +
            '<div class="summary-item__name">' + escapeHtml(getPartName(item)) + '</div>' +
            '<div class="summary-item__code">' + t("code_label") + ': ' + escapeHtml(item.code) + '</div>' +
            '<div class="summary-item__price">' + t("latest_price_label") + ': ' + escapeHtml(formatLatestPrice(item)) + '</div>' +
          "</div>" +
          '<strong class="summary-item__qty">' + t("qty_label") + " " + formatNumber(item.quantity) + "</strong>" +
        "</article>";
    }).join("");
  }

  function showToast(message) {
    var root = document.getElementById("toast-root");

    if (!root) {
      return;
    }

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    root.appendChild(toast);

    window.requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    window.setTimeout(function () {
      toast.classList.remove("is-visible");
      toast.addEventListener("transitionend", function () {
        toast.remove();
      }, { once: true });
    }, 2000);
  }
})();
