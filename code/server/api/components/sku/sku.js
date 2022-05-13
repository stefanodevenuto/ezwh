class Sku {
    constructor(id = null, description, weight, volume, notes, positionId = null, availableQuantity, price, testDescriptorId = null) {
        this.id = id;
        this.description = description;
        this.weight = weight;
        this.volume = volume;
        this.notes = notes;
        this.positionId = positionId;
        this.availableQuantity = availableQuantity;
        this.price = price;
        this.testDescriptorId = testDescriptorId;
    }
}

module.exports = Sku;
