import Component from 'component';
import Cache, { CacheKind } from 'cache';
import { debounce, fetchDoc, replaceContent } from 'utils';
import { PREDICTIVE_SEARCH_TEMPLATE_SELECTOR, ReqSection } from 'constants';
const MIN_INPUT_CHARS = 3;
const INPUT_DEBOUNCE = 300;
const QUERY_SRC_LIMIT = 10;
customElements.define('x-search-modal', class extends Component {
    constructor() {
        super();
        this.$element.results = this.querySelector('[data-search-modal-element="results"]');
        this.$element.input = this.querySelector('[data-search-modal-element="input"]');
    }
    predictiveSearchUrl = null;
    searchTerm = '';
    cache = new Cache(CacheKind.PREDICTIVE_SEARCH);
    render() {
        this.predictiveSearchUrl = this.getAttribute('predictive-search-url');
        if (!this.predictiveSearchUrl) {
            console.error('Predictive search url is not provided via attribute');
            return;
        }
        this.on(this.$element.input, 'input', debounce(this.onInput.bind(this), INPUT_DEBOUNCE));
        this.on(this.$element.input, 'focus', () => {
            this.toggleResultsDisplay(this.isSearchableTerm);
        });
    }
    async onInput(e) {
        const target = e.target;
        if (target) {
            this.searchTerm = target.value.trim();
            if (this.isSearchableTerm) {
                let doc;
                if (this.cache.has(this.searchTerm)) {
                    doc = this.cache.get(this.searchTerm);
                }
                else {
                    try {
                        doc = await fetchDoc(this.predictiveSearchUrl, {
                            sectionId: ReqSection.PREDICTIVE_SEARCH,
                            before: () => this.toggleSpinner(true),
                            after: () => this.toggleSpinner(false),
                            params: {
                                'q': this.searchTerm,
                                'resources[limit]': QUERY_SRC_LIMIT
                            }
                        });
                        this.cache.set(this.searchTerm, doc);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                this.showResults(doc);
            }
            else {
                this.toggleResultsDisplay(false);
            }
        }
    }
    get isSearchableTerm() {
        return this.searchTerm.length >= MIN_INPUT_CHARS;
    }
    toggleResultsDisplay(state) {
        this.classList.toggle('search-modal--show-results', state);
    }
    toggleSpinner(state) {
        this.classList.toggle('search-modal--loading', state);
    }
    showResults(doc) {
        if (!this.$element.results || !doc) {
            return;
        }
        const predictiveTemplate = doc.querySelector(`[${PREDICTIVE_SEARCH_TEMPLATE_SELECTOR}]`);
        if (!predictiveTemplate) {
            return;
        }
        replaceContent(this.$element.results, predictiveTemplate);
        this.toggleResultsDisplay(true);
    }
});
