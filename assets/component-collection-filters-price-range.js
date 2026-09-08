import Component, { Topic } from 'component';
import { toNum, debounce, assert } from 'utils';
export const RANGE_VALUE_ATTR = 'range-value';
class Src {
    element;
    type;
    rangeValue;
    value;
    param;
    srcLink;
    valueOffset;
    constructor(element, type, rangeValue) {
        this.element = element;
        this.type = type;
        this.rangeValue = rangeValue;
        const value = toNum(this.element.value);
        assert(value !== null, 'Invalid input value');
        this.value = value;
        const param = element.getAttribute('name');
        assert(param, 'Invalid input name');
        this.param = param;
        if (this.type === 'min') {
            this.valueOffset = -1;
        }
        else {
            this.valueOffset = 1;
        }
    }
    updateValue(value) {
        const _value = toNum(value);
        if (_value === null) {
            console.error('Invalid update value');
            return false;
        }
        this.value = _value;
        this.setLimits();
        return true;
    }
    link(src) {
        this.srcLink = src;
    }
    get isLimitReached() {
        if (!this.srcLink) {
            console.error('Src link is missing');
            return;
        }
        if (this.type === 'min') {
            return this.value > this.srcLink.value;
        }
        else {
            return this.value < this.srcLink.value;
        }
    }
    get styleProp() {
        return `--collection-filters-price-range-${this.type}`;
    }
    setLimits() {
        if (this.isLimitReached) {
            this.value = this.srcLink.value + this.valueOffset;
            this.element.value = String(this.value);
        }
    }
    get isDefaultValue() {
        if (this.type === 'min') {
            return this.value <= 0;
        }
        else {
            return this.value >= this.rangeValue;
        }
    }
    get pubData() {
        return {
            src: this.param,
            value: this.isDefaultValue ? null : this.value
        };
    }
}
customElements.define('x-collection-filters-price-range', class extends Component {
    constructor() {
        super();
        this.$element.minInput = this.querySelector('[data-collection-filters-price-range-element="min-input"]');
        this.$element.maxInput = this.querySelector('[data-collection-filters-price-range-element="max-input"]');
    }
    rangeValue;
    min;
    max;
    render() {
        assert(this.$element.minInput, 'minInput is not provided');
        assert(this.$element.maxInput, 'maxInput is not provided');
        this.rangeValue = toNum(this.getAttribute(RANGE_VALUE_ATTR));
        assert(this.rangeValue !== null, `Invalid range value`);
        this.min = new Src(this.$element.minInput, 'min', this.rangeValue);
        this.max = new Src(this.$element.maxInput, 'max', this.rangeValue);
        this.min.link(this.max);
        this.max.link(this.min);
        this.resetInitialPrice();
        [this.min, this.max].forEach(src => {
            this.on(src.element, 'input', this.handleSrcInput(src));
            this.on(src.element, 'change', debounce(this.handleSrcChange(src), 100));
        });
    }
    async resetInitialPrice() {
        const min = this.min.pubData;
        const max = this.max.pubData;
        const data = [];
        if (min.value === null) {
            data.push(min.src);
        }
        if (max.value === null) {
            data.push(max.src);
        }
        await customElements.whenDefined('x-collection-provider');
        this.pub(Topic.COLLECTION_FILTER_PRICE_INIT, data);
    }
    handleSrcInput(src) {
        return (e) => {
            e.stopPropagation();
            const target = e.target;
            src.updateValue(target.value);
            this.style.setProperty(src.styleProp, String(src.value));
        };
    }
    handleSrcChange(src) {
        return (e) => {
            e.stopPropagation();
            this.pub(Topic.COLLECTION_FILTER_PRICE_UPDATE, src.pubData);
        };
    }
});
