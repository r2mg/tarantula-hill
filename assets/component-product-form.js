import Component, { Topic } from 'component';
import { assert, uuid, qtyInputOverflowHandle } from 'utils';
import { BUTTON_LOADING_ATTR } from 'constants';
export const FORM_ATTR = 'data-product-form';
export const ADD_BUTTON_ATTR = 'data-add-button';
export const VARIANT_ID_INPUT = 'id';
export const QTY_INPUT = 'quantity';
customElements.define('x-product-form', class extends Component {
    constructor() {
        super();
    }
    form;
    TUID = null;
    addButton = null;
    render() {
        this.form = this.querySelector(`[${FORM_ATTR}]`);
        assert(this.form, "Product form element is not defined");
        this.addButton = this.querySelector(`[${ADD_BUTTON_ATTR}]`);
        this.sub(Topic.CART_UPDATE, ({ TUID, data, error }) => {
            if (this.TUID && this.TUID === TUID) {
                this.loading(false);
                this.TUID = null;
            }
        }, { global: true });
        this.on(this.form, 'submit', (e) => {
            e.preventDefault();
            if (this.TUID) {
                console.error('Previous transaction is not resolved yet');
            }
            const data = new FormData(this.form);
            if (!data.get(VARIANT_ID_INPUT)) {
                console.error('Variant id is missing');
                return;
            }
            for (const [key, value] of [...data.entries()]) {
                if (typeof value === 'string' && value.trim() === "")
                    data.delete(key);
            }
            this.loading(true);
            this.TUID = uuid();
            this.pub(Topic.CART_ADD, {
                TUID: this.TUID,
                formData: data
            });
        });
    }
    loading(state) {
        if (this.addButton) {
            this.addButton.toggleAttribute(BUTTON_LOADING_ATTR, state);
        }
    }
    handleQtyInput(e) {
        const target = e.target;
        qtyInputOverflowHandle(target);
    }
});
