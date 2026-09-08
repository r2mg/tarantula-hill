import Component, { Topic } from 'component';
import { assert, parseHTML } from 'utils';
import { ReqSection } from 'constants';
var Url;
(function (Url) {
    Url["CHANGE"] = "change";
    Url["ADD"] = "add";
    Url["UPDATE"] = "update";
    Url["BASE"] = "base";
})(Url || (Url = {}));
export const CHANGE_URL_ATTR = 'change-url';
export const ADD_URL_ATTR = 'add-url';
export const UPDATE_URL_ATTR = 'update-url';
export const CART_URL_ATTR = 'cart-url';
export const DRAWER_ATTR = 'drawer';
export const NOTIFICATION_ATTR = 'notification';
export const IS_CART_PAGE_ATTR = 'cart-page';
const URL_ATTS = {
    [Url.CHANGE]: CHANGE_URL_ATTR,
    [Url.ADD]: ADD_URL_ATTR,
    [Url.UPDATE]: UPDATE_URL_ATTR,
    [Url.BASE]: CART_URL_ATTR
};
customElements.define('x-cart-provider', class extends Component {
    constructor() {
        super();
    }
    fetchSections = new Set();
    withNotificator = false;
    ignoreNotifier = false;
    withDrawer = false;
    urls = {
        [Url.CHANGE]: '',
        [Url.ADD]: '',
        [Url.UPDATE]: '',
        [Url.BASE]: ''
    };
    render() {
        this.validateUrls();
        this.initFetchSections();
        this.sub(Topic.CART_ADD, ({ formData, TUID, ignoreNotifier }) => {
            this.ignoreNotifier = !!ignoreNotifier;
            this.addToCart(formData, TUID);
        }, { global: true });
        this.sub(Topic.CART_CHANGE, ({ id, qty, TUID, sectionId }) => {
            if (sectionId) {
                this.fetchSections.add(sectionId);
            }
            this.changeCart(id, qty, TUID);
        }, { global: true });
        this.sub(Topic.CART_NOTES, (notes) => {
            const res = fetch(this.urls[Url.UPDATE], {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    note: notes
                })
            }).catch(console.error);
        }, { global: true });
    }
    validateUrls() {
        let key;
        for (key in URL_ATTS) {
            if (!this.hasAttribute(URL_ATTS[key])) {
                assert(false, `Cart provider missing ${URL_ATTS[key]} attr`);
            }
            this.urls[key] = this.getAttribute(URL_ATTS[key]);
            if (key !== Url.BASE) {
                this.urls[key] += '.js';
            }
        }
    }
    initFetchSections() {
        if (this.hasAttribute(DRAWER_ATTR)) {
            this.fetchSections.add(ReqSection.CART_DRAWER);
            this.withDrawer = true;
        }
        if (this.hasAttribute(NOTIFICATION_ATTR)) {
            this.withNotificator = true;
        }
    }
    get sectionsList() {
        return Array.from(this.fetchSections).join(',');
    }
    async fetchCart(url, data) {
        if (url !== Url.ADD && url !== Url.CHANGE) {
            console.error('Wrong cart fetch url');
            return;
        }
        const fetchUrl = this.urls[url];
        let res;
        if (url === Url.CHANGE) {
            res = await fetch(fetchUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    sections: this.sectionsList,
                    sections_url: this.urls[Url.BASE]
                }),
            });
        }
        if (url === Url.ADD) {
            data.append('sections', this.sectionsList);
            res = await fetch(fetchUrl, {
                method: 'POST',
                headers: {
                    ['X-Requested-With']: 'XMLHttpRequest'
                },
                body: data,
            });
        }
        const rData = await res.json();
        if (!res.ok) {
            throw new Error(rData.description);
        }
        return rData;
    }
    handleError(TUID, error) {
        console.error(error);
        this.pub(Topic.CART_UPDATE, {
            TUID,
            error: error.message
        });
        if ('message' in error && typeof error.message === 'string') {
            this.pub(Topic.SHOW_TOAST, {
                type: 'error',
                msg: error.message
            });
        }
    }
    getSectionsData(data) {
        const res = {};
        Object.keys(data.sections).forEach(sectionKey => {
            res[sectionKey] = parseHTML(data.sections[sectionKey]);
        });
        return res;
    }
    async changeCart(id, quantity, TUID) {
        try {
            const data = await this.fetchCart(Url.CHANGE, { id, quantity });
            this.pub(Topic.CART_UPDATE, {
                TUID,
                data: {
                    indicator: Number(data['item_count']) > 0,
                    openDrawer: false,
                    sections: this.getSectionsData(data)
                }
            });
        }
        catch (e) {
            this.handleError(TUID, e);
        }
    }
    async addToCart(formData, TUID) {
        let useNotifier = this.withNotificator && !this.ignoreNotifier;
        try {
            const data = await this.fetchCart(Url.ADD, formData);
            const sections = this.getSectionsData(data);
            if (this.withNotificator && !this.ignoreNotifier) {
                const notifierData = await this.getNotifierData(data.url);
                if (notifierData) {
                    useNotifier = true;
                    sections[ReqSection.PRODUCT_NOTIFIER] = notifierData;
                }
            }
            if (!useNotifier && !this.withDrawer) {
                window.location.href = this.urls[Url.BASE];
            }
            this.pub(Topic.CART_UPDATE, {
                TUID,
                data: {
                    indicator: !!data,
                    openDrawer: !useNotifier,
                    sections
                }
            });
        }
        catch (e) {
            this.handleError(TUID, e);
        }
    }
    async getNotifierData(productUrl) {
        try {
            const nres = await fetch(productUrl + `&sections=${ReqSection.PRODUCT_NOTIFIER}`);
            const ndata = await nres.json();
            return parseHTML(ndata[ReqSection.PRODUCT_NOTIFIER]);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
});
