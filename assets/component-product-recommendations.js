import Component from 'component';
import { assert, fetchDoc, toNum, replaceContent, docScriptLoader } from 'utils';
export const PRODUCT_ID_ATTR = 'product-id';
export const RECOMMENDATIONS_URL_ATTR = 'recommendations-url';
export const LIMIT_ATTR = 'product-limit';
customElements.define('x-product-recommendations', class extends Component {
    constructor() {
        super();
    }
    productId;
    srcUrl;
    limit;
    render() {
        assert(this.sectionId, `Section id is not defined`);
        assert(this.id, `id is not defined`);
        this.productId = this.getAttribute(PRODUCT_ID_ATTR);
        assert(this.productId, `Product url is not defined`);
        this.srcUrl = this.getAttribute(RECOMMENDATIONS_URL_ATTR);
        assert(this.srcUrl, `Recommendations url is not defined`);
        this.limit = toNum(this.getAttribute(LIMIT_ATTR));
        assert(this.limit !== null, `Invalid limit attr`);
        fetchDoc(this.srcUrl, {
            params: {
                product_id: this.productId,
                limit: this.limit
            },
            sectionId: this.sectionId,
            nullOn404: true
        }).then(doc => {
            if (!doc) {
                console.error('Doc is missing');
                return;
            }
            const target = doc.getElementById(this.id);
            if (!target) {
                console.error('target is missing');
                return;
            }
            replaceContent(this, target);
            docScriptLoader(doc);
        }).catch(console.error);
    }
});
