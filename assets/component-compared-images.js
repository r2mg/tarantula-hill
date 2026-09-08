import Component from 'component';
customElements.define('x-compared-images', class extends Component {
    constructor() {
        super();
        this.$element.range = this.querySelector('[data-compared-images-element="range"]');
    }
    render() {
        this.on(this.$element.range, 'input', this.handleRange);
    }
    handleRange(e) {
        const target = e.target;
        this.style.setProperty('--compared-images-separator-position', `${target.value}`);
    }
});
