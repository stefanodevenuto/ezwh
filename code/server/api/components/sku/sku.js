class Sku {
    constructor(id = null, description, weight, volume, notes, positionId = null, availableQuantity, price, testDescriptor = null) {
        this.id = id;
        this.description = description;
        this.weight = weight;
        this.volume = volume;
        this.notes = notes;
        this.positionId = positionId;
        this.availableQuantity = availableQuantity;
        this.price = price;
        this.testDescriptor = testDescriptor;
    }
}

module.exports = Sku;
