class Sku {
    constructor(id = null, description, weight, volume, notes, positionId = null, availableQuantity, price, testDescriptors) {
        this.id = id;
        this.description = description;
        this.weight = weight;
        this.volume = volume;
        this.notes = notes;
        this.positionId = positionId;
        this.availableQuantity = availableQuantity;
        this.price = price;
        this.testDescriptors = testDescriptors !== null ? [testDescriptors] : [];
    }
}

module.exports = Sku;
