import Component, { Topic } from 'component';
import { fetchDoc, replaceContent, isElementEmpty, assert, updateWindowHistory } from 'utils';
import Cache, { CacheKind } from 'cache';
import { GlobAttr, PRODUCT_OPTIONS_PARAM } from 'constants';
export const LIVE_REGION_ATTR = 'data-life-region';
export const INITIAL_OPTION_IDS_ATTR = 'initial-option-ids';
export const PRODUCT_URL_ATTR = 'product-url';
export const PRODUCT_SECTION_ATTR = 'product-section';
customElements.define('x-product-info', class extends Component {
    constructor() {
        super();
    }
    regions = new Map();
    options = [];
    productUrl;
    isProductSection = false;
    cache = new Cache(CacheKind.PRODUCT_VARIANT);
    render() {
        const initialOptions = this.getAttribute(INITIAL_OPTION_IDS_ATTR);
        assert(this.sectionId, `section id is not defined for product info`);
        this.productUrl = this.getAttribute(PRODUCT_URL_ATTR);
        assert(this.productUrl, `product url is not defined for product info`);
        this.isProductSection = this.hasAttribute(PRODUCT_SECTION_ATTR);
        if (initialOptions) {
            this.options = initialOptions.split(',');
        }
        else {
            this.options = new URL(window.location.href).searchParams.get(PRODUCT_OPTIONS_PARAM)?.split(',');
        }
        assert(this.options, `Initial options are not provided`);
        this.initRegions();
        this.sub(Topic.PRODUCT_OPTION_CHANGE, ({ id, position, mediaPosition }) => {
            this.options[position - 1] = id;
            this.fetchRegions();
            if (mediaPosition !== null) {
                this.pub(Topic.PRODUCT_GALLERY_UPDATE, mediaPosition);
            }
        });
    }
    initRegions() {
        this.querySelectorAll(`[${LIVE_REGION_ATTR}]`).forEach(element => {
            if (!element.id) {
                console.warn('Life region is missing id', element);
                return;
            }
            this.hideEmpty(element);
            this.regions.set(element.id, element);
        });
    }
    hideEmpty(element, force) {
        element.toggleAttribute(GlobAttr.HIDDEN, force !== undefined ? force : isElementEmpty(element));
    }
    async fetchRegions() {
        const optionsParams = this.options.toString();
        let doc;
        if (this.cache.has(optionsParams)) {
            doc = this.cache.get(optionsParams);
        }
        else {
            doc = await fetchDoc(this.productUrl, {
                before: () => this.loading(true),
                after: () => this.loading(false),
                sectionId: this.sectionId,
                nullOn404: true,
                params: {
                    [PRODUCT_OPTIONS_PARAM]: optionsParams
                }
            });
            this.cache.set(optionsParams, doc);
        }
        if (!doc) {
            console.error(`Invalid document for ${optionsParams} option params`);
            return;
        }
        this.regions.forEach((element, elementId) => {
            const updatedElement = doc.getElementById(elementId);
            if (!updatedElement) {
                console.warn(`Life region element with ${elementId} is missing`);
                this.hideEmpty(element, true);
                return;
            }
            replaceContent(element, updatedElement);
            this.hideEmpty(element);
        });
        if (this.isProductSection) {
            updateWindowHistory(`${PRODUCT_OPTIONS_PARAM}=${this.options.toString()}`);
        }
    }
    loading(state) {
        this.pub(Topic.STAGE_LOAD, state);
    }
    destroy() {
        this.regions.clear();
    }
});
