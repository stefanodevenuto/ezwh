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

    intoJson(all = false) {
        let result = {
            id: this.id,
            description: this.description,
            weight: this.weight,
            volume: this.volume,
            notes: this.notes,
            position: this.positionId,
            availableQuantity: this.availableQuantity,
            price: this.price,
            testDescriptors: this.testDescriptors,
        }

        if (all === true) {
            const { id, ...single} = result;
            result = single;
        }

        return result;
    }
    

    static mockTestSku() {
        const sku = new Sku(null, "test sku", 20, 20, "test sku", null, 50, 10, [])
        return sku;        
    }

}

module.exports = Sku;
