export var CacheKind;
(function (CacheKind) {
    CacheKind["PREDICTIVE_SEARCH"] = "predictive-search";
    CacheKind["PRODUCT_VARIANT"] = "product-variant";
    CacheKind["COLLECTION_FILTERS"] = "collection-filters";
})(CacheKind || (CacheKind = {}));
;
const cache = new Map();
export default class Cache {
    kind;
    constructor(kind) {
        this.kind = kind;
    }
    key(keyValue) {
        return `${this.kind}-${keyValue}`;
    }
    get(key) {
        return cache.get(this.key(key));
    }
    set(key, value) {
        return cache.set(this.key(key), value);
    }
    has(key) {
        return cache.has(this.key(key));
    }
    delete(key) {
        return cache.delete(this.key(key));
    }
}
