import Component from 'component';
export const PASSWORD_FORM_ERRORS_ID = 'password-form-errors';
customElements.define('x-password-form-modal', class extends Component {
    constructor() {
        super();
    }
    modal;
    formErrors = null;
    async render() {
        await customElements.whenDefined('x-modal');
        this.modal = this.querySelector(`[id=${this.getAttribute('modal-id')}]`);
        this.formErrors = this.querySelector(`[id=${PASSWORD_FORM_ERRORS_ID}]`);
        if (this.formErrors)
            this.modal?.open();
    }
});
