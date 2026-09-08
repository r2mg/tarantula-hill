import Component, { Topic } from 'component';
customElements.define('x-cart-indicator', class extends Component {
    constructor() {
        super();
    }
    render() {
        this.sub(Topic.CART_UPDATE, ({ data }) => {
            if (data) {
                const { indicator } = data;
                this.toggleAttribute('hidden', !indicator);
            }
        }, { global: true });
    }
});
