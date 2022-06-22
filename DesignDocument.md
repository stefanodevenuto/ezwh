# Design Document 

Authors:
- Fabio Orazio Mirto
- Roberto Sirigu
- Peter Alhachem
- Stefano De Venuto

Date: 25-04-2022

Version: .0

# Contents

- [Design Document](#design-document)
- [Contents](#contents)
- [Instructions](#instructions)
- [High level design](#high-level-design)
- [Low level design](#low-level-design)
  - [Manager Package](#manager-package)
- [Verification traceability matrix](#verification-traceability-matrix)
- [Verification sequence diagrams](#verification-sequence-diagrams)
  - [UC1](#uc1)
    - [Scenario 1.1](#scenario-11)
  - [UC2](#uc2)
    - [Scenario 2.2](#scenario-22)
  - [UC3](#uc3)
    - [Scenario 3.1](#scenario-31)
  - [UC4](#uc4)
    - [Scenario 4.1](#scenario-41)
  - [UC5](#uc5)
    - [Scenario 5.1.1](#scenario-511)
    - [Scenario 5.2.3](#scenario-523)
    - [Scenario 5.3.1](#scenario-531)
  - [UC6](#uc6)
    - [Scenario 6.1](#scenario-61)
  - [UC7](#uc7)
    - [Scenario 7.1](#scenario-71)
  - [UC9](#uc9)
    - [Scenario 9.2](#scenario-92)
  - [UC10](#uc10)
    - [Scenario 10.1](#scenario-101)
  - [UC11](#uc11)
    - [Scenario 11.1](#scenario-111)
  - [UC12](#uc12)
    - [Scenario 12.3](#scenario-123)

# Instructions

The design must satisfy the Official Requirements document, notably functional and non functional requirements, and be consistent with the APIs

# High level design 

```plantuml
@startuml HighLevelDesign

package server {
    package api {
        package components
    }
    package db
    package error
}

components -- db
components -- error
@enduml
```
The architetural pattern choosed is MVC + 3 tier.<br>
# Low level design

To make the diagram more readable, every component will be presented separated from the rest.

```plantuml
@startuml LowLevelDesign
top to bottom direction
allow_mixing

package db {
    Class AppDAO {
        + Database db
        + transaction

        + run(sql, params = [])
        + get(sql, params = [])
        + all(sql, params = [])
        + startTransaction()
        + commitTransaction()
        + rollbackTransaction()
    }
}

package api {
    package sku
    package skuItem
    package position
    package test_descriptor
    package test_result
    package user
    package restock_order
    package return_order
    package internal_order
    package item
}

sku - AppDAO
skuItem - AppDAO
position - AppDAO
test_descriptor - AppDAO
test_result - AppDAO
user - AppDAO
restock_order - AppDAO
return_order - AppDAO
internal_order - AppDAO
item - AppDAO

@enduml
```

### User Component

```plantuml
@startuml 
    package user {
        Class UserRoutes {
            - ErrorHandler errorHandler
            - UserController controller

            + UserRoutes()

            + initRoutes()
        }

        Class UserController {
            + UserDAO dao

            + UserController()

            + getAllUsers()
            + getAllSuppliers()
            + getUserInfo(email)

            + createUser(username, name, surname, password, type)
            + loginManager(username, password)
            + loginCustomer(username, password)
            + loginSupplier(username, password)
            + loginClerk(username, password)
            + loginQualityEmployee(username, password)
            + loginDeliveryEmployee(username, password)
            + modifyRight(username, oldType, newType)
            + deleteUser(username, type)

            - login(username, password, type)
        }

        Class UserDAO extends AppDAO {
            + UserDAO()

            + getAllUsers() 
            + getAllUsersByType(type) 
            + getUserByID(id)

            + createUser(username, name, surname, password, type) 
            + checkUser(email, password) 
            + modifyRight(username, oldType, newType) 
            + deleteUser(userUsername, userType) 

            - getUserByEmailAndType(email, type)
            - deleteAllUser()
        }

        Class User {
            - {static} ADMINISTRATOR     = "administrator";
            - {static} MANAGER           = "manager";
            - {static} INTERNAL_CUSTOMER = "INTERNAL_CUSTOMER";
            - {static} CUSTOMER          = "customer";
            - {static} SUPPLIER          = "supplier";
            - {static} CLERK             = "clerk";
            - {static} QUALITY_EMPLOYEE  = "qualityEmployee";
            - {static} DELIVERY_EMPLOYEE = "deliveryEmployee";

            - id
            - name
            - surname
            - email
            - password
            - type

            + User(id, name, surname, email, password, type)

            - {static} isValidType(type)
            - {static} mockUser()
            - {static} mockUserCustomer()

        }

        UserRoutes -> UserController
        UserController -> UserDAO
        UserController .> User : <<import>>
    }
@enduml
```

### Sku Component

```plantuml
@startuml 
    package sku {
        Class SkuRoutes {
            - ErrorHandler errorHandler
            - SkuController controller

            + SkuRoutes()

            + initRoutes()

        }

        Class SkuController {
            + SkuDAO dao

            + SkuController()

            + SKURoutes()

            + getAllSkus()
            + getSkuByID(skuId)

            + createSku(description, weight, volume, notes, price, availableQuantity)
            + modifySku(skuId, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity)
            + addModifySkuPosition(skuId, newPosition)
            
            + deleteSku(skuId)
            + getSkuByIDInternal(skuId) 
        }

        Class SkuDAO extends AppDAO {
            + SkuDAO()

            + getAllSkus()
            + getSkuByID(skuId)

            + createSku(description, weight, volume, notes, price, availableQuantity)
            + modifySku(skuId, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity)
            + addModifySkuPosition(skuId, newPosition)
            
            + deleteSku(skuId)
            + getSkuByIDInternal(skuId) 
        }

        Class Sku {

            - id
            - description
            - weight
            - volume
            - notes
            - positionId
            - availableQuantity
            - price    
            - testDescriptors

            + Sku(id, description, weight, volume, notes, positionId, availableQuantity, price, testDescriptors)

            - {static} intoJson(all)
            - {static} mockTestSku()
        }

        SkuRoutes -> SkuController
        SkuController -> SkuDAO
        SkuController .> Sku : <<import>>
    }
@enduml
```

### Sku Item Component

```plantuml
@startuml 
    package skuItem {
        Class SKUItemRoutes {
            - ErrorHandler errorHandler
            - SKUItemController controller

            + SKUItemRoutes()

            + initRoutes()

        }

        Class SkuItemController {
            + SKUItemDAO dao

            + skuController()

            + getAllSKUItems()
            + getSKUItemBySKUID(skuId)
            + getSKUItemByRFID(SKUItemId)

            + createSKUItem(RFID, SKUId, DateOfStock)
            + modifySKUItem(SKUItemId, newRFID, newAvailable, newDateOfStock)
            + deleteSKUItem(SKUItemId)

            + getSKUItemByRFIDInternal(rfid) 
            + getAllSkuItemsByRestockOrder(restockOrderId)
            + getItemByRFIDInternal(RFID, restockOrderId)
        }

        Class SKUItemDAO extends AppDAO {
            + SKUItemDAO()

            + getAllSKUItems()
            + getSKUItemBySKUID(skuId)
            + getSKUItemByRFID(SKUItemId)

            + createSKUItem(RFID, SKUId, DateOfStock)
            + modifySKUItem(SKUItemId, newRFID, newAvailable, newDateOfStock)
            + deleteSKUItem(SKUItemId)
            + deleteAllSKUItem()

            + getAllSkuItemsByRestockOrder(restockOrderId) 
            + getSupplierIdByRestockOrderId(restockOrderId)
            + getSkuAndSKUItemByRFIDInternal(rfid, supplierId)
        }

        Class SkuItem {

            - RFID
            - SKUId
            - available
            - dateOfStock
            - restockOrderId
            - returnOrderId
            - internalOrderId

            + Sku(id , description, weight, volume, notes, positionId, availableQuantity, price, testDescriptors)

            - {static} intoJson(all)
            - {static} mockTestSkuItem()
        }

        SKUItemRoutes -> SkuItemController
        SkuItemController -> SKUItemDAO
        SkuItemController .> SkuItem : <<import>>
    }
@enduml
```

### Position Component

```plantuml
@startuml 
    package position {
        Class PositionRoutes {
            - ErrorHandler errorHandler
            - PositionController controller

            + PositionRoutes()

            + initRoutes()

        }

        Class PositionController {
            + PositionDAO dao

            
            + getAllPositions()
            + getPositionByID(id)

            + createPosition(positionID, aisleID, row, col, maxWeight, maxVolume)
            + modifyPosition(positionID, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume,
        newOccupiedWeight, newOccupiedVolume)
            + modifyPositionID(oldPositionId, newPositionId)
            + deletePosition(positionID)
        }

        Class PositionDAO extends AppDAO {
            + PositionDAO()

            + getAllPositions()
            + getPositionByID(id)

            + createPosition(positionID, aisleID, row, col, maxWeight, maxVolume)
            + modifyPosition(positionID, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume,
        newOccupiedWeight, newOccupiedVolume)
            + modifyPositionID(oldPositionId, newPositionId)
            + deletePosition(positionID)
            + deleteAllPosition()
        }

        Class Position {

            - positionID
            - aisleID
            - row
            - col
            - maxWeight
            - maxVolume
            - occupiedWeight
            - occupiedVolume

            + Position(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume)

            - {static} mockTestPosition()
        }

        PositionRoutes -> PositionController
        PositionController -> PositionDAO
        PositionController .> Position : <<import>>
    }
@enduml
```

### Test Descriptor Component

```plantuml
@startuml 
    package testDescriptor {
        Class TestDescriptorRoutes {
            - ErrorHandler errorHandler
            - TestDescriptorController controller

            + TestDescriptorRoutes()

            + initRoutes()

        }

        Class TestDescriptorController {
            + TestDescriptorDAO dao

            
           
            + getAllTestDescriptors()
            + getTestDescriptorByID(testDescriptorId)

            + createTestDescriptor(name, procedureDescription, idSKU)
            + modifyTestDescriptor(testDescriptorId, newName, newProcedureDescription, newIdSKU)
            + deleteTestDescriptor(testDescriptorId)
        }

        Class TestDescriptorDAO extends AppDAO {
            + TestDescriptorDAO()

            + getAllTestDescriptors()
            + getTestDescriptorByID(testDescriptorId)

            + createTestDescriptor(name, procedureDescription, idSKU)
            + modifyTestDescriptor(testDescriptorId, newName, newProcedureDescription, newIdSKU)
            + deleteTestDescriptor(testDescriptorId)
            + deleteAllTestDescriptor()
        }

        Class TestDescriptor {

            - id
            - name
            - procedureDescription
            - idSKU

            + TestDescriptor(id, name, procedureDescription, idSKU)

            - {static} mockTestTestDescriptor()
        }

        TestDescriptorRoutes -> TestDescriptorController
        TestDescriptorController -> TestDescriptorDAO
        TestDescriptorController .> TestDescriptor : <<import>>

    }
@enduml
```

### Test Result Component
```plantuml
@startuml 
    package testResult {
        Class TestResultRoutes {
            - ErrorHandler errorHandler
            - TestResultController controller

            + TestResultRoutes()

            + initRoutes()

        }

        Class TestResultController {
            + TestResultDAO dao

            + skuItemController
           
            + getAllTestResults(rfid)
            + getTestResultByID(rfid, testResultId)

            + createTestResult(rfid, idTestDescriptor, Date, Result)
            + modifyTestResult(rfid, id, newIdTestDescriptor, newDate, newResult)
            + deleteTestResult(rfid, id)

            + hasFailedTestResultsByRFID(RFID)
        }

        Class TestResultDAO extends AppDAO {
            + TestResultDAO()

           + getAllTestResults(rfid)
            + getTestResultByID(rfid, testResultId)

            + createTestResult(rfid, idTestDescriptor, Date, Result)
            + modifyTestResult(rfid, id, newIdTestDescriptor, newDate, newResult)
            + deleteTestResult(rfid, id)

            + hasFailedTestResultsByRFID(RFID)
        }

        Class TestResult {

            - id;
            - date
            - result
            - testDescriptorId
            - RFID

            + TestResult(id, date, result, testDescriptorId, RFID)

            - intoJson()
            - {static} mockTestTestResult()
        }

        TestResultRoutes -> TestResultController
        TestResultController -> TestResultDAO
        TestResultController .> TestResult : <<import>>
    }
@enduml
```

### Restock Order Component

```plantuml
@startuml 
    package restock_order {
        Class RestockOrderDAO extends AppDAO {
            + getAllRestockOrders()
            + getAllIssuedRestockOrders()
            + getRestockOrderByID(restockOrderId)
            + createRestockOrder(issueDate, supplierId, state, products)
            + modifyState(restockOrderId, newState)
            + modifyRestockOrderSkuItems(restockOrderId, skuItems)
            + modifyTransportNote(restockOrderId, deliveryDate)
            + deleteRestockOrder(restockOrderId)
            + deleteAllRestockOrder()
        }

        Class RestockOrderController {
            - RestockOrderDAO dao
            - TestResultController testResultController
            - SkuItemController skuItemController
            - ItemController itemController

            + RestockOrderController(testResultController, skuItemController, itemController)

            + getAllRestockOrders()
            + getAllIssuedRestockOrders()
            + getRestockOrderByID(restockOrderId)
            + getRestockOrderReturnItemsByID(restockOrderId)
            + createRestockOrder(issueDate, products, supplierId)
            + modifyState(restockOrderId, newState)
            + modifyRestockOrderSkuItems(restockOrderId, skuItems)
            + modifyTransportNote(restockOrderId, deliveryDate)
            + deleteRestockOrder(restockOrderId)

            - buildRestockOrders(rows)
            - getRestockOrderByIDInternal(restockOrderId)
        }

        Class RestockOrderRoutes {
            - ErrorHandler errorHandler
            - RestockOrderController controller

            + RestockOrderRoutes(testResultController, skuItemController, itemController)

            + initRoutes()
        }

        Class RestockOrder {
            {static} ISSUED = "ISSUED"
            {static} DELIVERY = "DELIVERY"
            {static} DELIVERED = "DELIVERED"
            {static} TESTED = "TESTED"
            {static} COMPLETEDRETURN = "COMPLETEDRETURN"
            {static} COMPLETED = "COMPLETED"

            + id
            + issueDate
            + state
            + deliveryDate
            + supplierId
            + products
            + skuItems

            + RestockOrder(id, issueDate, state, deliveryDate, supplierId, products, skuItems = [])

            + intoJson()
            + {static} isVaidState()
            + {static} mockRestockOrder()
        }

        Class Product {
            + Item item
            + qty

            + Product(item, qty)
        }

        RestockOrder - "*" Product
        RestockOrderController -up-> RestockOrderDAO
        RestockOrderRoutes -> RestockOrderController
        RestockOrderController .> RestockOrder : <<import>>
    }
@enduml
```

### Return Order Component

```plantuml
@startuml 
    package return_order {
        Class ReturnOrderDAO extends AppDAO {
            + getAllReturnOrders()
            + getReturnOrderByID(returnOrderID)
            + createReturnOrder(returnDate, restockOrderId, products)
            + deleteReturnOrder(returnOrderID)
        }

        Class ReturnOrderController {
            + ReturnOrderDAO dao
            + SkuItemController skuItemController

            + ReturnOrderController(skuItemController)

            + getAllReturnOrders()
            + getReturnOrderByID(returnOrderID)
            + createReturnOrder(returnDate, products, restockOrderId)
            + deleteReturnOrder(returnOrderID)
            
            - buildReturnOrders(rows)
        }

        Class ReturnOrderRoutes {
            - ErrorHandler errorHandler
            - ReturnOrderController controller

            + ReturnOrderRoutes(testResultController, skuItemController, itemController)

            + initRoutes()
        }

        Class ReturnOrder {
            + id
            + returnDate
            + products
            + restockOrderId

            + ReturnOrder(id = null, returnDate, products, restockOrderId)
        }

        Class Products {
            + SKUId
            + description
            + price
            + RFID
            
            + Products(SKUId, description, price, RFID)
        }

        ReturnOrder - "*" Products
        ReturnOrderController -up-> ReturnOrderDAO
        ReturnOrderRoutes -> ReturnOrderController
        ReturnOrderController .> ReturnOrder : <<import>>
    }

@enduml
```

### Internal Order Component

```plantuml
@startuml 
    package internal_order {
        Class InternalOrderDAO extends AppDAO {
            + getAllInternalOrders()
            + getInternalOrderByID(internalOrderID)
            + getInternalOrdersAccepted()
            + getInternalOrdersIssued()
            + createInternalOrder(issueDate, customerId, state, products)
            + modifyStateInternalOrder(internalOrderId, newState, products = undefined)
            + deleteInternalOrder(internalOrderID)
            + deleteAllInternalOrder()
        }

        Class InternalOrderController {
            + InternalOrderDAO dao
            + SkuController skuController

            + getAllInternalOrders() {
            + getInternalOrdersAccepted() {
            + getInternalOrdersIssued() {
            + getInternalOrderByID(internalOrderID) {
            + createInternalOrder(issueDate, products, customerId) {
            + modifyStateInternalOrder(internalOrderId, newState, products) {
            + deleteInternalOrder(internalOrderID) {
            
            - buildInternalOrders(rows) {
            - getInternalOrderByIDInternal(internalOrderId) {
        }

        Class InternalOrderRoutes {
            - ErrorHandler errorHandler
            - InternalOrderController controller

            + InternalOrderRoutes(suController)

            + initRoutes()
        }

        Class InternalOrder {
            + {static} ISSUED = "ISSUED"
            + {static} ACCEPTED = "ACCEPTED"
            + {static} REFUSED = "REFUSED"
            + {static} CANCELED = "CANCELED"
            + {static} COMPLETED = "COMPLETED"

            + id
            + issueDate
            + state
            + products
            + customerId

            + InternalOrder(id = null, issueDate, state, products, customerId)

            + {static} isValidState(state)
            + {static} mockTestInternalOrder() 
            + {static} mockTestInternalOrder2()
        }

        InternalOrderController -up-> InternalOrderDAO
        InternalOrderRoutes -> InternalOrderController
        InternalOrderController .> InternalOrder : <<import>>
    }

@enduml
```

```plantuml
@startuml 
    package item {
        Class ItemDAO extends AppDAO {
            + getAllItems()
            + getItemByItemIdAndSupplierId(itemId, supplierId)
            + createItem(id, description, price, SKUId, supplierId)
            + modifyItem(id, supplierId, description, price)
            + deleteItem(id, supplierId)
            + getItemBySkuIdAndSupplierId(skuId, supplierId)
            + deleteAllItem()
        }

        Class ItemController {
            + ItemDAO dao

            + ItemController()

            + getAllItems()
            + getItemByIdAndSupplierId(itemId, supplierId)
            + createItem(id, description, price, SKUId, supplierId)
            + modifyItem(id, supplier, description, price)
            + deleteItem(id, supplierId)
        }

        Class ItemRoutes {
            - ErrorHandler errorHandler
            - ItemController controller

            + ItemRoutes()

            + initRoutes()
        }

        Class Item {
            + id
            + description
            + price
            + SKUId
            + supplierId

            + Item(id = null, description, price, SKUId, supplierId)

            + {static} mockItem()
        }

        ItemController -up-> ItemDAO
        ItemRoutes -> ItemController
        ItemController .> Item : <<import>>
    }
@enduml
```
To make the diagram more readable, we extrapolated the Error classes in the following diagram:

```plantuml
@startuml ErrorDiagram
package user {
    Class UserErrorFactory {
        + {static} newCustomerNotFound
        + {static} newUserNotFound
        + {static} newWrongCredential
        + {static} newTypeNotFound
        + {static} newUserConflict
        + {static} newAttemptCreationPrivilegedAccount
    }
}

package sku {
    Class SkuErrorFactory {
        + {static} newSkuNotFound
        + {static} newPositionNotCapable
        + {static} newPositionAlreadyOccupied
        + {static} newSkuWithAssociatedSkuItems
    }
}

package skuItem {
    Class SkuItemErrorFactory {
        + {static} newSKUItemNotFound
        + {static} newSKUItemRFIDNotUnique
        + {static} newSKUItemRelatedToItemNotOwned
    }
}

package position {
    Class PositionErrorFactory {
        + {static} newPositionNotFound
        + {static} newPositionIdNotSymmetric
        + {static} newPositionIDNotUnique
        + {static} newGreaterThanMaxWeightPosition
        + {static} newGreaterThanMaxVolumePosition
    }
}

package test_descriptor {
    Class TestDescriptorErrorFactory {
        + {static} newTestDescriptorNotFound
        + {static} newSKUAlreadyWithTestDescriptor
        + {static} newTestDescriptorWithAssociatedTestResults
    }
}

package test_result {
    Class TestResultErrorFactory {
        + {static} newTestResultNotFound
        + {static} newTestDescriptorOrSkuItemNotFound
    }
}
 package restock_order {
     Class RestockOrderErrorFactory {
        + {static} newRestockOrderNotFound()
        + {static} newRestockOrderNotReturned()
        + {static} newRestockOrderNotDelivered()
        + {static} newRestockOrderNotDelivery()
        + {static} newRestockOrderDeliveryBeforeIssue()
    }
 }

package return_order {
    Class ReturnOrderErrorFactory {
        + {static} newReturnOrderNotFound()
    }
}

package item {
    Class ItemErrorFactory {
        + {static} itemNotFound()
        + {static} skuAlreadyAssociatedForSupplier()
        + {static} itemAlreadySoldBySupplier()
        + {static} newSkuOrSupplierNotFound()
    }
}
@enduml
```

# Verification traceability matrix

|       FR Code           |  FR1  |  FR2  |  FR3  |  FR4  |  FR5  |  FR6  |  FR7  |
| :------------------:    | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
|         EZWH            |   X   |   X   |   X   |   X   |   X   |   X   |   X   |
|     UserController      |   X   |       |       |   X   |       |       |       |
|         User            |   X   |   X   |   X   |   X   |   X   |   X   |   X   |
|    SKUItemController    |       |       |       |       |   X   |   X   |       |
|       SKUItem           |       |       |       |       |   X   |   X   |       |
|      TestResult         |       |       |       |       |   X   |       |       |
|     ItemController      |       |       |       |       |       |       |   X   |
|         Item            |       |       |       |       |       |       |   X   |
|   WarehouseController   |       |       |   X   |       |       |       |       |
|       Position          |       |       |   X   |       |       |       |       |
|  ReturnOrderController  |       |       |       |       |   X   |       |       |
|     ReturnOrder         |       |       |       |       |   X   |       |       |
| InternalOrderController |       |       |       |       |       |   X   |       |
|    InternalOrder        |       |       |       |       |       |   X   |       |
| RestockOrderController  |       |       |   X   |       |   X   |       |       |
|     RestockOrder        |       |       |       |       |   X   |       |       |
|    TestDescriptor       |       |       |   X   |       |       |       |       |
|      SKUController      |       |   X   |       |       |   X   |   X   |       |
|         SKU             |       |   X   |       |       |   X   |   X   |       |

# Verification sequence diagrams

## UC1

### Scenario 1.1
```plantuml
@startuml

actor "Sku Manager" as Sku_Manager

Sku_Manager -> FacadeController : createSKU(description, weight, volume, notes,  price, availableQuantity)
activate FacadeController
FacadeController -> SKUManager : createSKU()
activate SKUManager
 
SKUManager -> SKU : new
activate SKU
SKU --> SKUManager: SKU
deactivate SKU

SKUManager -> SKUManager.SKUs : add
activate SKUManager.SKUs
deactivate SKUManager.SKUs


database "DBHandler" as DBHandler

SKUManager -> DBHandler : saveSKU()
activate DBHandler
deactivate DBHandler

SKUManager --> FacadeController : 201 Created
deactivate SKUManager

FacadeController --> Sku_Manager : 201 Created
deactivate FacadeController

@enduml
```

## UC2

### Scenario 2.2
```plantuml
@startuml
actor "Manager"


    Manager -> FacadeController : modifyPosition(positionID, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume)
    activate FacadeController

    FacadeController -> WarehouseManager : modifyPosition()
    activate WarehouseManager

    WarehouseManager -> WarehouseManager.currentPosition : getPositionByID()
    activate WarehouseManager.currentPosition

    WarehouseManager.currentPosition --> WarehouseManager : position
    deactivate WarehouseManager.currentPosition

    WarehouseManager -> WarehouseManager : position.modify()

    database "DBHandler" as DBHandler
    WarehouseManager -> DBHandler : savePosition(position)
    activate DBHandler
    deactivate DBHandler

    WarehouseManager --> FacadeController: 200 OK
    deactivate WarehouseManager

    FacadeController --> Manager : 200 OK
    deactivate FacadeController

@enduml
```
## UC3

### Scenario 3.1
```plantuml
@startuml 
actor Manager

    Manager -> FacadeController : createRestockOrder(issueDate, products, supplierId)
    activate FacadeController

    FacadeController -> RestockOrderManager: createRestockOrder
    activate RestockOrderManager

    RestockOrderManager -> SKUManager : getSKUByID(SKU)
    activate SKUManager
    note left : for each SKU\n in products

    SKUManager -> SKUManager.SKUs : get
    activate SKUManager.SKUs

    SKUManager <-- SKUManager.SKUs: skus
    deactivate SKUManager.SKUs

    RestockOrderManager <-- SKUManager : skus
    deactivate SKUManager

    RestockOrderManager -> RestockOrder: new(List<Pair<SKU, qty> SKUs>, issueDate, supplierId)
    activate RestockOrder

    RestockOrder -> RestockOrder: this.SKUs = SKUs
    RestockOrder -> RestockOrder: this.SKUItems = null
    RestockOrder -> RestockOrder: this.issueDate = issueDate
    RestockOrder -> RestockOrder: this.supplierId = supplierId
    
    RestockOrderManager <-- RestockOrder: restockOrder
    deactivate RestockOrder

    RestockOrderManager -> RestockOrderManager.restockOrders: add
    activate RestockOrderManager.restockOrders
    deactivate RestockOrderManager.restockOrders

    RestockOrderManager -> DBHandler : saveRestockOrder(restockOrder)
    activate DBHandler
    deactivate DBHandler
    
    RestockOrderManager --> FacadeController : 201 Created
    deactivate RestockOrderManager
    FacadeController --> Manager : 201 Created
    deactivate FacadeController

@enduml

```
## UC4

### Scenario 4.1

```plantuml

@startuml

actor "User Manager" as User_Manager 

User_Manager -> FacadeController : createUser(username, name, surname, password, type)
activate FacadeController

FacadeController -> UserManager : createUser()
activate UserManager

UserManager -> User : new
activate User

User --> UserManager : User
deactivate User

UserManager -> UserManager.users : add
activate UserManager.users
deactivate UserManager.users


database "DBHandler" as DBHandler
UserManager -> DBHandler : saveUser()
activate DBHandler
deactivate DBHandler

UserManager --> FacadeController : 200 OK
deactivate UserManager

FacadeController --> User_Manager : 200 OK
deactivate FacadeController

@enduml 

```
## UC5

### Scenario 5.1.1

```plantuml
@startuml 
actor Clerk

    Clerk -> FacadeController : getAllRestockOrders(restockOrderId)
    activate FacadeController

    FacadeController -> RestockOrderManager: getAllRestockOrders()
    activate RestockOrderManager

    RestockOrderManager -> RestockOrderManager.restockOrders : values()
    RestockOrderManager.restockOrders --> RestockOrderManager : restockOrders

    FacadeController <-- RestockOrderManager: restockOrders
    deactivate RestockOrderManager

    FacadeController --> Clerk  : restockOrders
    deactivate FacadeController

    Clerk -> FacadeController : createSKUItem(RFID, SKUID, dateOfStock)
    activate FacadeController
    note left: for every item\n in a RestockOrder

    FacadeController -> SKUItemManager: createSKUItem()
    activate SKUItemManager

    SKUItemManager -> SKUItem : new
    activate SKUItem

    SKUItemManager <-- SKUItem : skuItem
    deactivate SKUItem

    SKUItemManager -> SKUItemManager.SKUItems : add
    activate SKUItemManager.SKUItems
    deactivate SKUItemManager.SKUItems
    
    database DBHandler

    SKUItemManager -> DBHandler : saveSKUItem(skuItem)
    activate DBHandler
    deactivate DBHandler

    SKUItemManager --> FacadeController : 201 Created
    deactivate SKUItemManager

    FacadeController --> Clerk  : 201 Created
    deactivate FacadeController

    Clerk -> FacadeController : modifyRestockOrderState(restockOrderId, newState)
    activate FacadeController

    FacadeController -> RestockOrderManager: modifyRestockOrderState()
    activate RestockOrderManager

    RestockOrderManager -> RestockOrderManager.restockOrders : get
    activate RestockOrderManager.restockOrders

    RestockOrderManager <-- RestockOrderManager.restockOrders : restockOrder
    deactivate RestockOrderManager.restockOrders

    RestockOrderManager -> RestockOrderManager : restockOrder.setState(DELIVERED)
    
    RestockOrderManager -> DBHandler : saveRestockOrder(restockOrder)
    activate DBHandler
    deactivate DBHandler
    
    database "DBHandler" as DBHandler

    FacadeController <-- RestockOrderManager: 200 OK
    deactivate RestockOrderManager

    FacadeController --> Clerk  : 200 OK
    deactivate FacadeController

@enduml
```
### Scenario 5.2.3

```plantuml

@startuml
    actor Manager
        
        Manager -> FacadeController : getRestockOrderByID(restockOrderId)
        activate FacadeController

        FacadeController -> RestockOrderManager : getRestockOrderByID()
        activate RestockOrderManager

        RestockOrderManager -> RestockOrderManager.restockOrders : get
        activate RestockOrderManager.restockOrders

        RestockOrderManager.restockOrders --> RestockOrderManager : restockOrder
        deactivate RestockOrderManager.restockOrders

        RestockOrderManager --> FacadeController : restockOrder
        deactivate RestockOrderManager

        FacadeController --> Manager : restockOrder
        deactivate FacadeController

        note left: in Restock Order \nis present a list of SKUItems

        Manager -> FacadeController : createTestResult(RFID, ID, date, result)
        activate FacadeController

        FacadeController -> SKUItemManager : createTestResult(RFID, ID, date, result)
        activate SKUItemManager

        SKUItemManager  -> TestResult : new
        activate TestResult

        TestResult --> SKUItemManager : testResult
        deactivate TestResult

        SKUItemManager  -> SKUItemManager.testResults : add
        activate SKUItemManager.testResults
        deactivate SKUItemManager.testResults

        database "DBHandler" as DBHandler
        SKUItemManager -> DBHandler : saveTestResult(testResult)
        activate DBHandler
        deactivate DBHandler
        
        SKUItemManager --> FacadeController : 201 Created
        deactivate SKUItemManager

        FacadeController --> Manager : 201 Created
        deactivate FacadeController
        
        Manager -> FacadeController : modifyRestockOrderState(restockOrderId, newState)
        activate FacadeController

        FacadeController -> RestockOrderManager : modifyRestockOrderState(resostockOrderId, newState)
        activate RestockOrderManager

        RestockOrderManager -> RestockOrderManager.restockOrders : get
        activate RestockOrderManager.restockOrders

        RestockOrderManager <-- RestockOrderManager.restockOrders : restockOrder
        deactivate RestockOrderManager.restockOrders

        RestockOrderManager -> RestockOrderManager : restockOrder.modifyState("TESTED")

        database "DBHandler" as DBHandler

        RestockOrderManager -> DBHandler :  saveRestockOrder(restockOrder)
        activate DBHandler
        deactivate DBHandler

        RestockOrderManager --> FacadeController: 200 OK
        deactivate RestockOrderManager

        FacadeController --> Manager : 200 OK
        deactivate FacadeController

@enduml
```
### Scenario 5.3.1
```plantuml

@startuml
    actor Clerk
        Clerk -> FacadeController : getRestockOrderByID(restockOrderId)
        activate FacadeController

        FacadeController -> RestockOrderManager : getRestockOrderByID()
        activate RestockOrderManager

        RestockOrderManager -> RestockOrderManager.restockOrders : get
        activate RestockOrderManager.restockOrders

        RestockOrderManager.restockOrders --> RestockOrderManager : restockOrder
        deactivate RestockOrderManager.restockOrders

        RestockOrderManager --> FacadeController : restockOrder
        deactivate RestockOrderManager

        FacadeController --> Clerk : restockOrder
        deactivate FacadeController

        database "DBHandler" as DBHandler

        Clerk -> FacadeController : addModifySKUPosition(skuId, positionID)
        activate FacadeController
        note left: in Restock Order \nis present a list of SKU

        FacadeController -> SKUManager : addModifySKUPosition()
        activate SKUManager

        SKUManager -> SKUManager.SKUs : get
        activate SKUManager.SKUs

        SKUManager.SKUs --> SKUManager : sku
        deactivate SKUManager.SKUs

        SKUManager -> SKUManager : SKU.setPosition("positionID")
        SKUManager -> SKUManager : SKU.setAvailableQuantity("qty")

        SKUManager -> WarehouseManager : modifyPosition(positionId)
        activate WarehouseManager

        WarehouseManager -> WarehouseManager.currentPositions : get
        activate WarehouseManager.currentPositions

        WarehouseManager.currentPositions -> WarehouseManager : position
        deactivate WarehouseManager.currentPositions

        WarehouseManager -> WarehouseManager : position.setOccupation()

        WarehouseManager -> DBHandler : savePosition(position)
        activate DBHandler
        deactivate DBHandler

        deactivate WarehouseManager

        SKUManager -> DBHandler : saveSKU(sku)
        activate DBHandler
        deactivate DBHandler

        SKUManager --> FacadeController: 200 OK
        deactivate SKUManager 

        FacadeController --> Clerk : 200 OK
        deactivate FacadeController 

        Clerk -> FacadeController : modifyRestockOrderState(restockOrderId, newState)
        activate FacadeController

        FacadeController -> RestockOrderManager : modifyRestockOrderState()
        activate RestockOrderManager

        RestockOrderManager -> RestockOrderManager.restockOrders : get
        activate RestockOrderManager.restockOrders

        RestockOrderManager -> RestockOrderManager.restockOrders : restockOrder
        deactivate RestockOrderManager.restockOrders

        RestockOrderManager -> RestockOrderManager : restockOrder.modifyState("COMPLETED")

        database "DBHandler" as DBHandler

        RestockOrderManager -> DBHandler :  saveRestockOrder(restockOrder)
        activate DBHandler
        deactivate DBHandler

        RestockOrderManager --> FacadeController: 200 OK
        deactivate RestockOrderManager

        FacadeController --> Clerk : 200 OK
        deactivate FacadeController

@enduml
```
## UC6

### Scenario 6.1

```plantuml

@startuml
    actor Manager
        
        FacadeController -> ReturnOrderManager :  createReturnOrder(returnOrderId, returnDate, products, restockOrderId)
        activate ReturnOrderManager

        ReturnOrderManager -> RestockOrder.restockOrders : get
        activate RestockOrder.restockOrders

        RestockOrder.restockOrders --> ReturnOrderManager : restockOrder
        deactivate RestockOrder.restockOrders

        ReturnOrderManager -> SKUItemManager : setNotAvailable(skuItemId)
        activate SKUItemManager
        note left: for every skuItem\n in internalOrder

        SKUItemManager -> SKUItemManager.SKUItems : get
        activate SKUItemManager.SKUItems
        SKUItemManager <-- SKUItemManager.SKUItems: skuItem
        deactivate SKUItemManager.SKUItems

        SKUItemManager -> SKUItemManager : skuItem.setAvailable(false)
        
        database "DBHandler" as DBHandler
        
        SKUItemManager -> DBHandler : saveSKUItem(skuItem)
        activate DBHandler
        deactivate DBHandler

        deactivate SKUItemManager

        ReturnOrderManager -> TestResult.testResults : values()
        activate TestResult.testResults

        TestResult.testResults --> ReturnOrderManager : testResults
        deactivate TestResult.testResults

        ReturnOrderManager -> ReturnOrderManager : testResults.filter(test.result === "false")
        ReturnOrderManager -> ReturnOrder : new
        activate ReturnOrder

        ReturnOrder --> ReturnOrderManager : returnOrder
        deactivate ReturnOrder

        ReturnOrderManager -> ReturnOrderManager.returnOrders : add
        activate ReturnOrderManager.returnOrders
        deactivate ReturnOrderManager.returnOrders

        database "DBHandler" as DBHandler
        ReturnOrderManager -> DBHandler :  saveReturnOrder(returnOrder)
        activate DBHandler
        deactivate DBHandler

        ReturnOrderManager --> FacadeController: 201 Created
        deactivate ReturnOrderManager
        FacadeController --> Manager : 201 Created
        deactivate FacadeController
@enduml
```
## UC7

### Scenario 7.1

```plantuml

@startuml

actor "User Manager" as User_Manager 

User_Manager -> FacadeController : login(username, password)
activate FacadeController

FacadeController -> UserManager : login()
activate  UserManager

database "DBHandler" as DBHandler
UserManager -> DBHandler : login()
activate DBHandler

deactivate DBHandler

UserManager --> FacadeController : 200 OK
deactivate UserManager

FacadeController --> User_Manager : 200 OK
deactivate FacadeController
@enduml 

```
## UC9

### Scenario 9.2

```plantuml

@startuml 
actor Customer
actor Manager
    ' Customer
    Customer -> FacadeController : createInternalOrder(issueDate, products, customerId)
    activate FacadeController

    FacadeController -> InternalOrderManager: createInternalOrder()
    activate InternalOrderManager

    InternalOrderManager -> InternalOrder : new()
    activate InternalOrder

    InternalOrderManager <-- InternalOrder : internalOrder
    deactivate InternalOrder

    InternalOrderManager -> WarehouseManager : increaseOccupation(positionId, qty)
    activate WarehouseManager

    WarehouseManager -> WarehouseManager.positions : get
    activate WarehouseManager.positions

    WarehouseManager <-- WarehouseManager.positions : position
    deactivate WarehouseManager.positions

    WarehouseManager -> WarehouseManager : position.increaseOccupation(qty)

    database DBHandler

    WarehouseManager -> DBHandler : savePosition(position)
    activate DBHandler
    deactivate DBHandler

    deactivate WarehouseManager

    InternalOrderManager -> InternalOrderManager.internalOrders : add
    activate InternalOrderManager.internalOrders
    deactivate InternalOrderManager.internalOrders

    FacadeController <-- InternalOrderManager: 201 Created
    deactivate InternalOrderManager

    FacadeController --> Customer  : 201 Created
    deactivate FacadeController

    ' Manager
    Manager -> FacadeController : modifyInternalOrderState(internalOrderId, newState)
    activate FacadeController
    database DBHandler
    FacadeController -> InternalOrderManager: modifyInternlOrderState()
    activate InternalOrderManager

    InternalOrderManager -> InternalOrderManager.internalOrders : get
    activate InternalOrderManager.internalOrders

    InternalOrderManager <-- InternalOrderManager.internalOrders : internalOrder
    deactivate InternalOrderManager.internalOrders

    InternalOrderManager -> InternalOrderManager : internalOrder.setState(REFUSED)
    
    InternalOrderManager -> DBHandler : saveInternalOrder(internalOrder)
    activate DBHandler
    deactivate DBHandler

    FacadeController <-- InternalOrderManager: 200 OK
    deactivate InternalOrderManager

    FacadeController --> Manager  : 200 OK
    deactivate FacadeController

@enduml

```
## UC10

### Scenario 10.1

```plantuml

@startuml 
actor DeliveryEmployee

    DeliveryEmployee -> FacadeController : modifyStateInternalOrder(internalOrderId, newState, skuItemIDs)
    activate FacadeController

    FacadeController -> InternalOrderManager: modifyStateInternalOrder()
    activate InternalOrderManager

    InternalOrderManager -> InternalOrderManager.internalOrders : get
    activate InternalOrderManager.internalOrders

    InternalOrderManager <-- InternalOrderManager.internalOrders: internalOrder
    deactivate InternalOrderManager.internalOrders

    InternalOrderManager -> SKUItemManager : setNotAvailable(skuItemId)
    activate SKUItemManager
    note left: for every skuItem\n in internalOrder

    SKUItemManager -> SKUItemManager.SKUItems : get
    activate SKUItemManager.SKUItems

    SKUItemManager <-- SKUItemManager.SKUItems: skuItem
    deactivate SKUItemManager.SKUItems

    SKUItemManager -> SKUItemManager : skuItem.setAvailable(false)
    deactivate SKUItemManager.SKUItems

    database DBHandler

    SKUItemManager -> DBHandler : saveSKUItem(skuItem)
    activate DBHandler
    deactivate DBHandler

    deactivate SKUItemManager

    InternalOrderManager -> InternalOrderManager : internalOrder.setSKUItems(skuItems)
    InternalOrderManager -> InternalOrderManager : internalOrder.setState(COMPLETED)
    InternalOrderManager -> DBHandler : saveInternalOrder(internalOrder)
    activate DBHandler
    deactivate DBHandler

    InternalOrderManager --> FacadeController : 200 OK
    deactivate InternalOrderManager

    FacadeController --> DeliveryEmployee : 200 OK
    deactivate FacadeController

@enduml

```
## UC11

### Scenario 11.1

```plantuml

@startuml
actor Supplier

    Supplier -> FacadeController : createItem(description, price, skuId, supplierId)
    activate FacadeController

    FacadeController -> ItemManager: createItem()
    activate ItemManager

    ItemManager -> Item : new
    activate Item

    ItemManager <-- Item : item
    deactivate Item

    ItemManager -> ItemManager.items : add
    activate ItemManager.items
    deactivate ItemManager.items

    ItemManager -> DBHandler : saveItem(item)
    activate DBHandler
    deactivate DBHandler

    ItemManager --> FacadeController : 201 Created
    deactivate ItemManager

    FacadeController --> Supplier : 201 Created
    deactivate FacadeController

@enduml

```
## UC12

### Scenario 12.3

```plantuml

@startuml 
actor Manager

    Manager -> FacadeController : deleteTestDescriptor(testDescriptorId)
    activate FacadeController

    FacadeController -> RestockOrderManager: deleteTestDescriptor()
    activate RestockOrderManager

    RestockOrderManager -> RestockOrderManager.testDescriptors : remove
    activate RestockOrderManager.testDescriptors
    deactivate RestockOrderManager.testDescriptors

    database DBHandler

    RestockOrderManager -> DBHandler : deleteTestDescriptor(testDescriptorId)
    activate DBHandler
    deactivate DBHandler

    RestockOrderManager --> FacadeController : 204 No Content
    deactivate RestockOrderManager

    FacadeController --> Manager  : 204 No Content
    deactivate FacadeController

@enduml

```
