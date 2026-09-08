import Component, { Topic } from 'component';
import { assert, uuid } from 'utils';
import { BUTTON_LOADING_ATTR } from 'constants';
export const ADD_BUTTON_ATTR = 'data-add-button';
export const VARIANT_ID_ATTR = 'variant-id';
export const IGNORE_NOTE_ATTR = 'no-notifier';
customElements.define('x-add-to-cart', class extends Component {
    constructor() {
        super();
    }
    button;
    variantId;
    TUID = null;
    render() {
        this.button = this.querySelector(`[${ADD_BUTTON_ATTR}]`);
        this.variantId = this.getAttribute(VARIANT_ID_ATTR);
        assert(this.variantId, `Variant id is not defined`);
        this.sub(Topic.CART_UPDATE, ({ TUID, error }) => {
            if (this.TUID === TUID) {
                this.loading(false);
            }
            if (error) {
                console.error(error);
            }
        }, { global: true });
        this.on(this, 'click', (e) => {
            const fd = new FormData();
            fd.set('id', this.variantId);
            this.TUID = uuid();
            this.pub(Topic.CART_ADD, {
                formData: fd,
                TUID: this.TUID,
                ignoreNotifier: this.hasAttribute(IGNORE_NOTE_ATTR)
            });
            this.loading(true);
        });
    }
    loading(state) {
        if (this.button) {
            this.button.toggleAttribute(BUTTON_LOADING_ATTR, state);
        }
    }
});
