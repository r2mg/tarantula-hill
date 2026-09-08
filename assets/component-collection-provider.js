import Component, { Topic } from 'component';
import Cache, { CacheKind } from 'cache';
import { fetchDoc, replaceContent, assert, updateWindowHistory } from 'utils';
export const FORM_SRC_ATTR = 'data-src-form';
export const RESET_PRICE_ATTR = 'data-price-reset';
export const RESET_ALL_ATTR = 'data-reset-all';
export const FORM_ID_ATTR = 'form-id';
export const COLLECTION_URL_ATTR = 'collection-url';
export const DRAWER_FILTER_ID_ATTR = 'drawer-filter-id';
export const SORT_NAME_PARAM = 'sort_by';
export const PAGE_NAME_PARAM = 'page';
const SEARCH_TERM_PARAM = 'q';
customElements.define('x-collection-provider', class extends Component {
    constructor() {
        super();
        this.$element.container = this.querySelector('[data-collection-provider-element="container"]');
        this.$element.form = this.querySelector('[data-collection-provider-element="form"]');
    }
    collectionURL;
    formData;
    formId;
    drawerFilterId = null;
    drawerFilterContainer = null;
    pageChanged = false;
    cache = new Cache(CacheKind.COLLECTION_FILTERS);
    render() {
        assert(this.sectionId, `Section id is not provided for collection provider`);
        assert(this.$element.form, `Form element is not provided`);
        assert(this.$element.container, `Container element is not provided`);
        this.collectionURL = this.getAttribute(COLLECTION_URL_ATTR);
        assert(this.collectionURL, `Collection url is missing`);
        this.formId = this.getAttribute(FORM_ID_ATTR);
        assert(this.formId, 'form id is missing');
        this.formData = new FormData(this.$element.form);
        this.initDrawer();
        this.sub(Topic.COLLECTION_FILTER_PRICE_INIT, (srcs) => {
            srcs.forEach(src => this.formData.delete(src));
        }, { once: true });
        this.sub(Topic.COLLECTION_FILTER_PRICE_UPDATE, ({ src, value }) => {
            if (value === null) {
                this.formData.delete(src);
            }
            else {
                this.formData.set(src, String(value));
            }
            this.formData.delete(PAGE_NAME_PARAM);
            this.fetchUpdatedCollection();
        });
        this.on(this, 'change', this.handleChange.bind(this));
    }
    initDrawer() {
        this.drawerFilterId = this.getAttribute(DRAWER_FILTER_ID_ATTR);
        if (this.drawerFilterId) {
            this.drawerFilterContainer = this.querySelector(`#${this.drawerFilterId}`);
        }
    }
    handleChange(e) {
        const target = e.target;
        if (this.updateFormdata(target)) {
            this.fetchUpdatedCollection();
        }
    }
    updateFormdata(target) {
        if (!this.isValidChangeTarget(target)) {
            return false;
        }
        if (target.name === PAGE_NAME_PARAM) {
            this.pageChanged = true;
        }
        else {
            this.formData.delete(PAGE_NAME_PARAM);
        }
        if (target.hasAttribute(RESET_ALL_ATTR)) {
            new Set(this.formData.keys()).forEach(k => {
                if (k !== SORT_NAME_PARAM && k !== SEARCH_TERM_PARAM) {
                    this.formData.delete(k);
                }
            });
            return true;
        }
        if (target.hasAttribute(RESET_PRICE_ATTR)) {
            const resetValues = target.getAttribute(RESET_PRICE_ATTR).split(',').map(v => v.trim());
            if (resetValues.length !== 2) {
                console.error('Invalid values for price reset');
                return false;
            }
            resetValues.forEach(v => this.formData.delete(v));
            return true;
        }
        if (target.type === 'checkbox') {
            if (target.checked === false) {
                const values = this.formData.getAll(target.name);
                const restValues = values.filter(v => v !== target.value);
                this.formData.delete(target.name);
                restValues.forEach(v => {
                    this.formData.append(target.name, v);
                });
            }
            else {
                this.formData.append(target.name, target.value);
            }
        }
        else {
            this.formData.set(target.name, target.value);
        }
        return true;
    }
    isValidChangeTarget(target) {
        return target.getAttribute(FORM_SRC_ATTR) === this.formId;
    }
    async fetchUpdatedCollection() {
        const params = new URLSearchParams(this.formData);
        const historyParams = params.toString();
        params.append('section_id', this.sectionId);
        let doc;
        if (this.cache.has(historyParams)) {
            doc = this.cache.get(historyParams);
        }
        else {
            doc = await fetchDoc(`${this.collectionURL}?${params.toString()}`, {
                nullOn404: true,
                before: () => this.loading(true),
                after: () => this.loading(false)
            });
            this.cache.set(historyParams, doc);
        }
        if (!doc) {
            console.error(`collection provider fetch wasnt return a document`);
            return;
        }
        const documentContainer = doc.getElementById(this.$element.container.id);
        if (!documentContainer) {
            console.error(`collection provider fetch wasnt return a container`);
            return;
        }
        replaceContent(this.$element.container, documentContainer);
        this.replaceDrawer(doc);
        if (this.pageChanged) {
            this.pageChanged = false;
            this.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        updateWindowHistory(historyParams);
    }
    replaceDrawer(doc) {
        if (!this.drawerFilterId || !this.drawerFilterContainer) {
            return;
        }
        const updatedDrawer = doc.getElementById(this.drawerFilterId);
        if (!updatedDrawer) {
            console.error('drawer element is not found on updated doc');
            return;
        }
        replaceContent(this.drawerFilterContainer, updatedDrawer);
    }
    loading(state) {
        this.pub(Topic.STAGE_LOAD, state);
    }
});
