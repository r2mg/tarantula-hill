import { assert, toNum, uuid, replaceContent } from 'utils';
import Component, { Topic } from 'component';
export const CONTAINER_ID_ATTR = 'container-id';
export const CHANGE_INPUT_KEY_ATTR = 'data-line-item-key';
customElements.define('x-cart', class extends Component {
    constructor() {
        super();
        this.$element.container = this.querySelector('[data-cart-element="container"]');
    }
    containerId;
    transaction;
    render() {
        assert(this.$element.container, 'container element is missing');
        assert(this.hasAttribute(CONTAINER_ID_ATTR), 'container id attribute is missing');
        assert(this.sectionId, 'missing section id');
        this.containerId = this.getAttribute(CONTAINER_ID_ATTR);
        this.on(this, 'change', this.handleChange);
        this.sub(Topic.CART_UPDATE, ({ TUID, data, error }) => {
            if (TUID === this.transaction) {
                this.loading(false);
                if (error) {
                }
                if (data) {
                    const targetSection = data.sections[this.sectionId];
                    if (!targetSection) {
                        console.error('missing cart section');
                        return;
                    }
                    const targetContainer = targetSection.getElementById(this.containerId);
                    if (!targetContainer) {
                        console.error('missing cart container within section');
                        return;
                    }
                    replaceContent(this.$element.container, targetContainer);
                }
            }
        }, { global: true });
    }
    handleChange(e) {
        const target = e.target;
        if (target.hasAttribute(CHANGE_INPUT_KEY_ATTR)) {
            const key = target.getAttribute(CHANGE_INPUT_KEY_ATTR);
            const value = toNum(target.value);
            if (value === null) {
                console.error('Invalid cart input value');
                return;
            }
            this.transaction = uuid();
            this.loading(true);
            this.pub(Topic.CART_CHANGE, {
                TUID: this.transaction,
                qty: value,
                id: key,
                sectionId: this.sectionId
            });
        }
    }
    loading(state) {
        this.pub(Topic.STAGE_LOAD, state);
    }
});
