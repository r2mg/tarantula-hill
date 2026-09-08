import Component, { Topic } from 'component';
import { assert, fetchDoc, replaceContent, updateWindowHistory } from 'utils';
export const SEARCH_URL_ATTR = 'search-url';
customElements.define('x-search-provider', class extends Component {
    constructor() {
        super();
        this.$element.form = this.querySelector('[data-search-provider-element="form"]');
        this.$element.container = this.querySelector('[data-search-provider-element="container"]');
    }
    searchUrl;
    render() {
        assert(this.$element.form, `Form element is missing`);
        assert(this.$element.container, `Container element is missing`);
        assert(this.sectionId, `Section id is missing`);
        this.searchUrl = this.getAttribute(SEARCH_URL_ATTR);
        assert(this.searchUrl, `Search url attribute is missing`);
        this.on(this.$element.form, 'submit', async (e) => {
            e.preventDefault();
            const doc = await fetchDoc(this.searchUrl, {
                sectionId: this.sectionId,
                params: {
                    q: this.formData.get('q')
                },
                nullOn404: true,
                before: () => this.pub(Topic.STAGE_LOAD, true),
                after: () => this.pub(Topic.STAGE_LOAD, false)
            });
            if (!doc) {
                console.error('No document for search result');
                return;
            }
            const updatedContainer = doc.getElementById(this.$element.container.id);
            if (!updatedContainer) {
                console.error('No container for search result');
            }
            replaceContent(this.$element.container, updatedContainer);
            updateWindowHistory(new URLSearchParams(this.formData).toString());
        });
    }
    get formData() {
        return new FormData(this.$element.form);
    }
});
