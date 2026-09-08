import Component from 'component';
import { setDocumentClickHandler } from 'utils';
customElements.define('x-drop-down', class extends Component {
    constructor() {
        super();
        this.$element.details = this.querySelector('[data-drop-down-element="details"]');
    }
    toggleDocClickListener(state) { }
    render() {
        this.toggleDocClickListener = setDocumentClickHandler(this.handleOuterClick.bind(this));
        this.on(this.$element.details, 'toggle', this.handleDetailsToggle);
    }
    handleDetailsToggle() {
        this.toggleDocClickListener(this.$element.details.open);
    }
    handleOuterClick(e) {
        if (this.contains(e.target)) {
            return;
        }
        this.close();
    }
    close() {
        this.open = false;
    }
    set open(state) {
        this.$element.details.open = state;
    }
});
