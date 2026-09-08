import Component, { Topic } from "component";
import { assert, toNum, isFn, fetchDoc, docScriptLoader, replaceContent } from "utils";
import { ENTER_KEY_IDENTIFIER, BUTTON_LOADING_ATTR } from "constants";
import formatMoney from "format-money";
const MSG_ATTR = "msg";
const DISPLAY_TIMEOUT = 5e3;
customElements.define("x-toast", class extends Component {
  constructor() {
    super();
    this.$element.content = this.querySelector('[data-toast-element="content"]');
  }
  timeout;
  render() {
    this.sub(Topic.SHOW_TOAST, ({ type, msg }) => {
      this.dataset.msgType = type;
      this.$element.content?.setAttribute(MSG_ATTR, msg);
      this.showPopover();
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.hidePopover();
      }, DISPLAY_TIMEOUT);
    }, {
      global: true
    });
    this.addEventListener("change", (e) => {
      e.stopPropagation();
      clearInterval(this.timeout);
      this.hidePopover();
    });
  }
});
const TRIGGER_CHANGE_ATTR = "trigger-change";
const ALLOW_ZERO_ATTR = "allow-zero";
customElements.define("x-product-qty", class extends Component {
  constructor() {
    super();
    this.$element.dec = this.querySelector('[data-product-qty-element="dec"]');
    this.$element.input = this.querySelector('[data-product-qty-element="input"]');
    this.$element.inc = this.querySelector('[data-product-qty-element="inc"]');
  }
  value;
  max;
  triggerChange = false;
  allowZero = false;
  render() {
    this.triggerChange = this.hasAttribute(TRIGGER_CHANGE_ATTR);
    this.allowZero = this.hasAttribute(ALLOW_ZERO_ATTR);
    assert(this.$element.input, "input element is not defined");
    assert(this.$element.dec, "dec element is not defined");
    assert(this.$element.inc, "inc element is not defined");
    this.value = toNum(this.$element.input.value);
    assert(this.value !== null, "value is not defined");
    this.max = toNum(this.$element.input.max) || void 0;
    this.checkButtons();
    this.on(this.$element.inc, "click", () => {
      this.updateValue(1);
    });
    this.on(this.$element.dec, "click", () => {
      this.updateValue(-1);
    });
  }
  checkButtons() {
    if (!this.allowZero) {
      this.$element.dec.toggleAttribute("disabled", this.value === 1);
    }
    this.$element.inc.toggleAttribute("disabled", Boolean(this.max && this.value === this.max));
  }
  updateValue(amount) {
    this.value += amount;
    this.$element.input.value = String(this.value);
    this.checkButtons();
    if (this.triggerChange) {
      this.$element.input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
});
const DELTA_THRESHOLD = 0.5;
customElements.define("x-mouse-tracker", class extends Component {
  constructor() {
    super();
  }
  prevY = 0;
  onDesktop() {
    this.on(this, "pointermove", (e) => {
      requestAnimationFrame(() => {
        const rect = this.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        const height = this.offsetHeight;
        const width = this.offsetWidth;
        const x = this.nVec(offsetX, width, 1);
        const y = this.nVec(offsetY, height, -1);
        const delta = Math.abs(Number(y) - this.prevY);
        if (delta > DELTA_THRESHOLD) {
          this.classList.add("mouse-tracker--transition");
          setTimeout(() => {
            this.classList.remove("mouse-tracker--transition");
          }, 200);
        }
        this.style.setProperty("--mouse-tracker-x", x);
        this.style.setProperty("--mouse-tracker-y", y);
        this.prevY = Number(y);
      });
    }, { passive: true });
    this.on(this, "pointerleave", () => {
      this.prevY = 0;
    });
  }
  nVec(pos, total, v) {
    return ((pos / total * 2 - 1) * v).toFixed(2);
  }
});
customElements.define("x-modal", class extends Component {
  constructor() {
    super();
    this.$element.dialog = this.querySelector('[data-modal-element="dialog"]');
    this.$element.content = this.querySelector('[data-modal-element="content"]');
  }
  url;
  urlSection;
  urlLoaded = false;
  beforeOpen;
  beforeClose;
  beforeLoaded;
  afterLoaded;
  render() {
    this.url = this.getAttribute("url");
    this.urlSection = this.getAttribute("url-section");
    this.on(this.$element.dialog, "click", this.handleBackdropClick);
    this.on(this.$element.dialog, "close", () => {
      this.lenis("start");
      this.removeAttribute("opened");
    });
  }
  open() {
    if (!this.dialogOpened) {
      this.openModal();
    }
  }
  async openModal() {
    this.lenis("stop");
    this.$element.dialog?.showModal();
    if (this.url && !this.urlLoaded) {
      await this.fetchUrl();
    }
    this.setAttribute("opening", "");
    if (isFn(this.beforeOpen)) {
      this.beforeOpen();
    }
    await this.animationsComplete(this.$element.content);
    this.removeAttribute("opening");
    this.setAttribute("opened", "");
  }
  async close() {
    this.lenis("start");
    this.removeAttribute("opened");
    this.setAttribute("closing", "");
    if (isFn(this.beforeClose)) {
      this.beforeClose();
    }
    await this.animationsComplete(this.$element.content);
    this.$element.dialog?.close();
    this.removeAttribute("closing");
  }
  refreshLayer() {
    if (!this.dialogOpened) {
      return;
    }
    this.$element.dialog?.close();
    this.$element.dialog?.showModal();
    setTimeout(() => {
      this.lenis("stop");
      this.setAttribute("opened", "");
    }, 1);
  }
  async fetchUrl() {
    if (isFn(this.beforeLoaded)) {
      this.beforeLoaded();
    }
    const res = await fetchDoc(this.url, {
      sectionId: this.urlSection || void 0
    });
    if (!res) {
      console.error("No modal result");
      return;
    }
    docScriptLoader(res);
    replaceContent(this.$element.content, res.body);
    if (isFn(this.afterLoaded)) {
      this.afterLoaded();
    }
    this.urlLoaded = true;
  }
  handleBackdropClick({ target }) {
    if (target === this.$element.dialog) {
      this.close();
    }
  }
  animationsComplete(element) {
    return Promise.allSettled(element.getAnimations().map((animation) => animation.finished));
  }
  lenis(action) {
    if ("lenis" in window) {
      window.lenis[action]();
    }
  }
  get dialogOpened() {
    return this.$element.dialog?.open;
  }
});
const LOADER_BUTTON_ATTR = "data-loader-button";
customElements.define("x-modal-trigger", class extends Component {
  constructor() {
    super();
  }
  target = null;
  targetId = this.getAttribute("target-id");
  loaderButton;
  async render() {
    this.loaderButton = this.querySelector(`[${LOADER_BUTTON_ATTR}]`);
    await customElements.whenDefined("x-modal");
    this.on(this, "click", this.handleClick);
    this.on(this, "keydown", this.handleEnterKey);
  }
  handleClick() {
    if (!this.target) {
      this.target = document.getElementById(this.targetId);
      if (!this.target) {
        console.error(`There is not target modal component with id - '${this.targetId}' in DOM`);
        return;
      }
    }
    if (this.loaderButton) {
      this.target.beforeLoaded = () => this.loading(true);
      this.target.afterLoaded = () => this.loading(false);
    }
    this.target.open();
  }
  handleEnterKey(e) {
    if (e.key === ENTER_KEY_IDENTIFIER && e.target === this) {
      e.preventDefault();
      e.stopPropagation();
      this.handleClick();
    }
  }
  loading(state) {
    if (this.loaderButton) {
      this.loaderButton.toggleAttribute(BUTTON_LOADING_ATTR, state);
    }
  }
});
customElements.define("x-modal-close", class extends Component {
  constructor() {
    super();
  }
  target = null;
  targetId = this.getAttribute("target-id");
  async render() {
    await customElements.whenDefined("x-modal");
    this.on(this, "click", this.handleClick);
    this.on(this, "keydown", this.handleEnterKey);
  }
  handleClick() {
    if (this.target === null) {
      this.target = document.getElementById(this.targetId);
      if (!this.target) {
        throw new Error(`There is not target modal component with id - '${this.targetId}' in DOM`);
      }
    }
    this.target.close();
  }
  handleEnterKey(e) {
    if (e.key === ENTER_KEY_IDENTIFIER && e.target === this) {
      e.preventDefault();
      e.stopPropagation();
      this.handleClick();
    }
  }
});
const CART_TOTAL_PRICE_ATTR = "cart-total-price";
customElements.define("x-free-shipping-progress-bar", class extends Component {
  constructor() {
    super();
    this.$element.freeShippingMsg = this.querySelector('[data-free-shipping-progress-bar-element="free-shipping-msg"]');
    this.$element.freeShippingBar = this.querySelector('[data-free-shipping-progress-bar-element="free-shipping-bar"]');
    this.$element.progress = this.querySelector('[data-free-shipping-progress-bar-element="progress"]');
    this.$element.shortage = this.querySelector('[data-free-shipping-progress-bar-element="shortage"]');
  }
  rate = 0;
  total = 0;
  freeShippingMinAmmount = 0;
  threshold = 0;
  diff = 0;
  freeShipping = false;
  progressBar = null;
  progressValue = 0;
  render() {
    this.rate = toNum(window.Shopify.currency.rate) || 1;
    this.total = toNum(this.getAttribute(CART_TOTAL_PRICE_ATTR));
    this.freeShippingMinAmmount = toNum(this.getAttribute("free-shipping-min-ammount"));
    if (this.total === null || this.freeShippingMinAmmount == null) {
      console.error("Invalid data to calculate required amount for free shipping.");
      return;
    }
    this.threshold = this.freeShippingMinAmmount * this.rate;
    this.diff = this.threshold - this.total;
    this.freeShipping = this.diff <= 0;
    this.handleProgress(this.freeShipping);
  }
  handleProgress(isFree) {
    if (isFree) {
      this.$element.freeShippingMsg?.removeAttribute("hidden");
    } else {
      this.progressBar = this.$element.progress;
      this.progressValue = toNum((this.total / this.threshold).toFixed(2));
      if (this.progressValue === null) {
        console.error("Invalid progress element value");
        return;
      }
      this.progressBar.value = this.progressValue;
      this.$element.shortage.innerHTML = formatMoney(this.diff);
      this.$element.freeShippingBar?.removeAttribute("hidden");
    }
  }
});
