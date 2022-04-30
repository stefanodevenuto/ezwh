class SKU {
    constructor(description, weight, volume, notes, position, availableQuantity, price, testDescriptors) {
        this.id = null;
        this.description = description;
        this.weight = weight;
        this.volume = volume;
        this.notes = notes;
        this.position = position;
        this.availableQuantity = availableQuantity;
        this.price = price;
        this.testDescriptors = testDescriptors;
    }
}

module.exports = SKU;