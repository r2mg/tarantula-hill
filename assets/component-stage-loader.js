import Component, { Topic } from 'component';
customElements.define('x-stage-loader', class extends Component {
    constructor() {
        super();
    }
    render() {
        this.sub(Topic.STAGE_LOAD, (state) => {
            this.classList.toggle('stage-loader--active', state);
        });
    }
});
