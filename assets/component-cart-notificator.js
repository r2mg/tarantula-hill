import Component, { Topic } from 'component';
import { ReqSection } from 'constants';
import { replaceContent, assert } from 'utils';
export const PRODUCT_TEMPLATE_ATTR = 'data-notifier-product-template';
export const CLOSE_VALUE = 'close-notification';
const DISPLAY_TIMEOUT = 3000;
customElements.define('x-cart-notificator', class extends Component {
    constructor() {
        super();
        this.$element.stage = this.querySelector('[data-cart-notificator-element="stage"]');
    }
    timeout;
    render() {
        assert(this.$element.stage, `Stage element is missing`);
        this.on(this, 'change', (e) => {
            const target = e.target;
            if (target.value === CLOSE_VALUE) {
                this.close();
                clearTimeout(this.timeout);
            }
        });
        this.sub(Topic.CART_UPDATE, ({ data, error }) => {
            if (data) {
                const { sections } = data;
                if (ReqSection.PRODUCT_NOTIFIER in sections) {
                    const template = sections[ReqSection.PRODUCT_NOTIFIER].querySelector(`[${PRODUCT_TEMPLATE_ATTR}]`);
                    if (!template) {
                        console.error('Notification template is missing');
                        return;
                    }
                    clearTimeout(this.timeout);
                    replaceContent(this.$element.stage, template);
                    this.classList.add('cart-notificator--show');
                    this.timeout = setTimeout(this.close.bind(this), DISPLAY_TIMEOUT);
                }
            }
        }, { global: true });
    }
    close() {
        this.classList.remove('cart-notificator--show');
        replaceContent(this.$element.stage, null);
    }
});
