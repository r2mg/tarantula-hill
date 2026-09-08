import Component from 'component';
export const SPOT_TRIGGER_ATTR = 'data-spot-trigger';
customElements.define('x-hot-spots', class extends Component {
    constructor() {
        super();
        this.$element.image = this.querySelector('[data-hot-spots-element="image"]');
    }
    activeTrigger = null;
    onDesktop() {
        this.on(this.$element.image, 'click', this.handleImageClick);
        this.on(this, 'change', this.handleChange);
    }
    handleImageClick() {
        if (!this.activeTrigger)
            return;
        this.activeTrigger.checked = false;
        this.activeTrigger = null;
    }
    handleChange(e) {
        e.stopPropagation();
        const target = e.target;
        if (!target.hasAttribute(SPOT_TRIGGER_ATTR) || this.activeTrigger === target)
            return;
        if (this.activeTrigger)
            this.activeTrigger.checked = false;
        this.activeTrigger = target;
    }
});
