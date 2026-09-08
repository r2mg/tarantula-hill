import Component, { Topic } from 'component';
customElements.define('x-carousel-pagination', class extends Component {
    constructor() {
        super();
        this.$element.radio = this.querySelectorAll('[data-carousel-pagination-element="radio"]');
    }
    render() {
        this.on(this, 'change', (e) => {
            const target = e.target;
            this.pub(Topic.CAROUSEL_PAGINATION_UPDATE, +target.value);
        });
        this.sub(Topic.CAROUSEL_PAGINATION_SET, (index) => {
            const target = this.$element.radio?.item(index);
            if (target) {
                target.checked = true;
            }
        });
    }
});
