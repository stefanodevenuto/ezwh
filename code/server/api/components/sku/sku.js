class Sku {
    constructor(id = null, description, weight, volume, notes, position = null, availableQuantity, price, testDescriptors = []) {
        this.id = id;
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

module.exports = Sku;
