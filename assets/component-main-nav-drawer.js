import Component from 'component';
import { ENTER_KEY_IDENTIFIER } from 'constants';
export const LEVEL_INPUT_ATTR = 'data-drawer-level';
export const LABEL_TRIGGER_ATTR = 'data-label-trigger';
customElements.define('x-main-nav-drawer', class extends Component {
    constructor() {
        super();
    }
    activeInput;
    render() {
        this.on(this, 'change', (e) => {
            const target = e.target;
            if (target.hasAttribute(LEVEL_INPUT_ATTR)) {
                this.style.setProperty('--main-nav-drawer-level', target.value);
                this.activeInput = target;
            }
        });
    }
    onDesktop() {
        this.on(this, 'keypress', (e) => {
            if (e.code === ENTER_KEY_IDENTIFIER && document.activeElement?.hasAttribute(LABEL_TRIGGER_ATTR)) {
                document.activeElement.click();
                setTimeout(() => {
                    if (this.activeInput) {
                        const next = this.activeInput.nextElementSibling;
                        if (next) {
                            next.tagName === 'LABEL' ? next.focus() : next?.querySelector('label')?.focus();
                        }
                    }
                }, 100);
            }
        });
    }
});
