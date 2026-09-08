import Component from 'component';
customElements.define('x-customer-address-country-selector', class extends Component {
    constructor() {
        super();
    }
    countrySelector;
    provinceSelector;
    render() {
        this.countrySelector = this.querySelector('[data-country-selector]');
        this.provinceSelector = this.querySelector('[data-province-selector]');
        const defaultCountry = this.countrySelector.getAttribute('data-default')?.replaceAll('&', 'And');
        if (defaultCountry) {
            const defaultOption = this.countrySelector.querySelector(`[value="${defaultCountry}"]`);
            if (defaultOption) {
                defaultOption.selected = true;
                this.setProvince(defaultOption, true);
            }
        }
        this.on(this.countrySelector, 'change', (e) => {
            const option = this.countrySelector.options[this.countrySelector.selectedIndex];
            this.setProvince(option);
        });
    }
    setProvince(option, setDefault = false) {
        let defaultProvince = null;
        if (setDefault) {
            defaultProvince = this.provinceSelector.getAttribute('data-default');
        }
        const rawProvinces = option.getAttribute('data-provinces');
        const provinces = JSON.parse(rawProvinces);
        if (provinces && provinces.length == 0) {
            this.provinceSelector.setAttribute('disabled', 'true');
            this.provinceSelector.replaceChildren();
        }
        provinces.map((province) => {
            const option = document.createElement('option');
            if (defaultProvince && defaultProvince === province[1]) {
                option.selected = true;
                defaultProvince = null;
            }
            option.value = province[0];
            option.innerHTML = province[1];
            this.provinceSelector.appendChild(option);
        });
        this.provinceSelector.removeAttribute('disabled');
    }
});
