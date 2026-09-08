import Component from 'component';
customElements.define('x-moving-line', class extends Component {
    constructor() {
        super();
        this.$element.content = this.querySelector('[data-moving-line-element="content"]');
    }
    contentWidth = 0;
    render() {
        this.contentWidth = this.$element.content?.offsetWidth;
        if (!this.contentWidth) {
            this.remove();
            return;
        }
        this.setContent();
        this.style.setProperty('--moving-line-content-width', `${this.contentWidth}`);
    }
    setContent() {
        const items = [...Array(this.duplicates)].map(this.cloneContent.bind(this));
        this.replaceChildren(...items);
    }
    cloneContent() {
        return this.$element.content?.cloneNode(true);
    }
    get duplicates() {
        return Math.ceil(window.innerWidth / this.contentWidth) + 2;
    }
});
