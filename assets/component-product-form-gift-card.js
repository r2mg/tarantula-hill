import Component from 'component';
import { assert } from 'utils';
export const TOGGLER_ATTR = 'data-display-toggle';
customElements.define('x-product-form-gift-card', class extends Component {
    constructor() {
        super();
        this.$element.fieldset = this.querySelector('[data-product-form-gift-card-element="fieldset"]');
    }
    render() {
        assert(this.$element.fieldset, `Fieldset is not defined`);
        this.on(this, 'change', (e) => {
            const target = e.target;
            if (target.hasAttribute(TOGGLER_ATTR)) {
                this.$element.fieldset.toggleAttribute('disabled', !target.checked);
            }
        });
    }
});
