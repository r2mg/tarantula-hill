import Component from 'component';
import { assert } from 'utils';
customElements.define('x-localization', class extends Component {
    constructor() {
        super();
    }
    form;
    render() {
        this.form = this.querySelector('form');
        assert(this.form, `Form not defined`);
        this.on(this.form, 'change', e => {
            e.stopPropagation();
            this.form.submit();
        });
    }
});
