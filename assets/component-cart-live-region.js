import Component, { Topic } from 'component';
import { replaceContent, parseHTML } from 'utils';
customElements.define('x-cart-live-region', class extends Component {
    sectionId;
    targetElement;
    constructor() {
        super();
        this.sectionId = this.getAttribute('section-id');
        this.targetElement = this.getAttribute('id');
    }
    async render() {
        await customElements.whenDefined('x-cart-provider');
        this.pub(Topic.CART_SUBSCRIPTION, this.sectionId);
        this.sub(Topic.CART_UPDATE, this.rerender, { global: true });
    }
    rerender({ sections }) {
        const targetSection = sections && sections[this.sectionId];
        if (!targetSection) {
            console.error(`target section ${targetSection} do not exists`);
            return;
        }
        const doc = parseHTML(targetSection);
        replaceContent(this, doc.getElementById(this.targetElement));
    }
});
