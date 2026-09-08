import Component, { Topic } from 'component';
import { fetchDoc, replaceContent, assert } from 'utils';
import { PRODUCT_OPTIONS_PARAM } from 'constants';
export const PRODUCT_URL_ATTR = 'product-url';
export const INITIAL_OPTIONS_ATTR = 'initial-options';
export const PRODUCT_ID_ATTR = 'product-id';
customElements.define('x-product-quick-view', class extends Component {
    constructor() {
        super();
    }
    productUrl;
    options;
    productId;
    render() {
        this.productUrl = this.getAttribute(PRODUCT_URL_ATTR);
        assert(this.productUrl, `Product url is not defined`);
        const optionsAttr = this.getAttribute(INITIAL_OPTIONS_ATTR);
        assert(optionsAttr, `Options attribute is not defined`);
        this.options = optionsAttr.split(',');
        this.productId = this.getAttribute(PRODUCT_ID_ATTR);
        assert(this.productId, `Product id is not defined`);
        this.sub(Topic.PRODUCT_OPTION_CHANGE, async ({ id, position, productId }) => {
            if (productId !== this.productId) {
                return;
            }
            this.options[position - 1] = id;
            const doc = await fetchDoc(this.productUrl, {
                sectionId: this.sectionId,
                params: {
                    [PRODUCT_OPTIONS_PARAM]: this.options.join(',')
                },
                nullOn404: true
            });
            if (!doc) {
                console.error('No fetch document');
                return;
            }
            replaceContent(this, doc);
        });
    }
});
