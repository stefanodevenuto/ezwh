# Design Document 

Authors:
- Fabio Orazio Mirto
- Roberto Sirigu
- Peter Alhachem
- Stefano De Venuto

Date: 25-04-2022

Version: 1.0

# Contents

- [Design Document](#design-document)
- [Contents](#contents)
- [Instructions](#instructions)
- [High level design](#high-level-design)
- [Low level design](#low-level-design)
  - [Manager Package](#manager-package)
  - [Busines Logic Package](#busines-logic-package)
- [Verification traceability matrix](#verification-traceability-matrix)
- [Verification sequence diagrams](#verification-sequence-diagrams)
  - [Scenario 1.1](#scenario-11)
  - [Scenario 2.2](#scenario-22)
  - [Scenario 3.1](#scenario-31)
  - [Scenario 4.1](#scenario-41)
  - [Scenario 5.1.1](#scenario-511)
  - [Scenario 5.2.3](#scenario-523)
  - [Scenario 5.3.1](#scenario-531)
  - [Scenario 6.1](#scenario-61)
  - [Scenario 7.1](#scenario-71)
  - [Scenario 9.2](#scenario-92)
  - [Scenario 10.1](#scenario-101)
  - [Scenario 11.1](#scenario-111)
  - [Scenario 12.3](#scenario-123)

# Instructions

The design must satisfy the Official Requirements document, notably functional and non functional requirements, and be consistent with the APIs

# High level design 

```plantuml
@startuml HighLevelDesign
package it.polito.ezwh {
    package manager
    package businesslogic
    package exceptions
}
manager -- businesslogic
manager -- exceptions
@enduml
```
The architetural pattern choosed is MVC + 3 tier.<br>
it.polito.ezwh.exceptions contains the exceptions used in the API.

# Low level design

## Manager Package

```plantuml
@startuml LowLevelDesign
package it.polito.ezwh.manager{

    note "The HashMap inside every Manager class acts \nhas a decentralized cache towards the database calls.\n In that way, all the query that selects one or more objects\n can directly be fulfilled by the Hashmaps,\n and so no connection with the database is needed" as hashmap_note

    Class FacadeController {
        /' Delegated to SKU Manager'/
        + List<SKU> getAllSKUs()
        + SKU getSKU(String SKUID)
        + void deleteSKU(String SKUID)

        + SKU createSKU(String description, int weight, int volume, String notes, float price, int availableQuantity)
        + void modifySKU(String SKUID, String newDescription, int newWeight, int newVolume, Sting newNotes, float newPrice, int newAvailableQuantity)
        + void addModifySKUPosition(String SKUID, String positionID)

        /' Delegated to Restock Order Manager'/
        + List<RestockOrder> getAllRestockOrders()
        + List<RestockOrder> getAllIssuedRestockOrders()
        + RestockOrder getRestockOrderByID(String ID)
        + List<SKUItem> getRestockOrderItems(String ID)
        + void deleteRestockOrder(int ID)

        + RestockOrder createRestockOrder(String ID, Date issueDate, List<<Pair<SKU, int>> products, int supplierId)
        + void modifyRestockOrderState(String ID, String newState)
        + void addRestockOrderSKUItems(String ID, List<SKUItem> skuItems)
        + void addRestockOrderTransportNote(String ID, Date transportNote)

        + List<TestDescriptor> getAllTestDescriptors()
        + TestDescriptor getTestDescriptor(String ID)
        + void deleteTestDescriptor(String ID)

        + void createTestDescriptor(String ID, String name, String procedureDescription, String IdSKU)
        + void modifyTestDescriptor(String ID, String newName, String newProcedureDescription, String newIdSKU)

        /' Delegated to Internal Order Manager'/
        + List<InternalOrder> getAllInternalOrders()
        + List<InternalOrder> getAllIssuedInternalOrders()
        + List<InternalOrder> getAllAcceptedInternalOrders()
        + InternalOrder getInternalOrderByID(String ID)
        + void deleteInternalOrder(String ID)

        + InternalOrder createInternalOrder(Date issueDate, List<<Pair<SKU, int>> products)
        + void modifyStateInternalOrder(String ID, String newState, List<String> RFIDs)

        /' Delegated to Return Order Manager'/
        + List<ReturnOrder> getAllReturnOrders()
        + ReturnOrder getReturnOrderByID(String ID)
        + void deleteReturnOrder(String ID)

        + void createReturnOrder(String ID, Date returnDate, List<<Pair<SKU, SKUItem>> products, String restockOrderId)
        + void modifyReturnOrderState(String ID, String newState)

        /' Delegated to Warehouse Manager'/
        + List<Position> getAllPositions()
        + Position getPositionByID()
        + void deletePosition(String positionID)

        + void createPosition(String positionID, String aisleID, int row, int col, int maxWeight, int maxVolume)
        + void modifyPosition(String positionID, String newAisleID, int newRow, int newCol, int newMaxWeight, int newMaxVolume, int newOccupiedWeight, int newOccupiedVolume)
        + void modifyPositionID(String oldPositionID, String newPositionID)

        /' Delegated to Item Manager'/
        + List<Item> getAllItems()
        + Item getItem(String ID)
        + void deleteItem(String ID)

        + void createItem(String description, float price, String SKUId, String supplierId)
        + void modifyItem(String newDescription, float newPrice)

        /' Delegated to SKU Item Manager'/
        + List<SKUItem> getAllSKUItems()
        + List<SKUItem> getAllSKUItemsBySKUID(String SKUID)
        + List<SKUItem> getSKUItem(String RFID)

        + void createSKUItem(String RFID, String SKUID, Date dateOfStock)
        + void modifySKUItem(String newRFID, boolean newAvailable, newDateOfStock)
        + void deleteSKUItem(String RFID)

        /' Delegated to Test Result Manager'/
        + List<TestResult> getAllTestResults(String RFID)
        + TestResult getTestResult(String RFID, String ID)

        + TestResult createTestResult(String RFID, String ID, Date date, boolean result)
        + void modifyTestResult(String RFID, String ID, String newIdTestDescriptor, Date newDate, newResult)
        + void deleteTestResult(String RFID, String ID)

        /' Delegated to User Manager'/
        + List<User> getAllUsers()
        + List<User> getAllSuppliers()
        + void deleteUser(String username, String type)

        + User login(String username, String password)
        + void logout()

        + User createUser(String username, String name, String surname, String password, String type)
        + void modifyUserRights(String username, String oldType, String newType)
    }

    ' User management
    Class UserManager {
        + HashMap<User> users

        + List<User> getAllUsers()
        + List<User> getAllSuppliers()
        + void deleteUser(String username, String type)

        + User login(String username, String password)
        + void logout()

        + User createUser(String username, String name, String surname, String password, String type)
        + void modifyUserRights(String username, String oldType, String newType)
    }

    ' SKU Item & Test Result Management
    Class SKUItemManager {
        + HashMap<SKUItem> SKUItems
        + HashMap<TestResult> testResults

        + List<SKUItem> getAllSKUItems()
        + List<SKUItem> getAllSKUItemsBySKUID(String SKUID)
        + List<SKUItem> getSKUItem(String RFID)

        + void createSKUItem(String RFID, String SKUID, Date dateOfStock)
        + void modifySKUItem(String newRFID, boolean newAvailable, newDateOfStock)
        + void deleteSKUItem(String RFID)
        + void setNotAvailable(String RFID)

        .. Test Result ..
        + List<TestResult> getAllTestResults(String RFID)
        + TestResult getTestResult(String RFID, String ID)

        + TestResult createTestResult(String RFID, String ID, Date date, boolean result)
        + void modifyTestResult(String RFID, String ID, String newIdTestDescriptor, Date newDate, newResult)
        + void deleteTestResult(String RFID, String ID)
    }

    SKUItemManager .. hashmap_note
    SKUItemManager .[hidden]. hashmap_note

    ' Item Management
    Class ItemManager {
        + HashMap<Item> items

        + List<Item> getAllItems()
        + Item getItem(String ID)
        + void deleteItem(String ID)

        + void createItem(String ID, String description, float price, String SKUId, String supplierId)
        + void modifyItem(String ID, String newDescription, float newPrice)
    }

    ' Warehouse Management
    Class WarehouseManager {
        + HashMap<Position> currentPositions

        + List<Position> getAllPositions()
        + Position getPositionByID()
        + void deletePosition(String positionID)

        + void createPosition(String positionID, String aisleID, int row, int col, int maxWeight, int maxVolume)
        + void modifyPosition(String positionID, String newAisleID, int newRow, int newCol, int newMaxWeight, int newMaxVolume, int newOccupiedWeight, int newOccupiedVolume)
        + void modifyPositionID(String oldPositionID, String newPositionID)
        + increaseOccupation(String positionID, int qty)
    }

    ' Return Order Management
    Class ReturnOrderManager {
        + HashMap<ReturnOrder> returnOrders

        + List<ReturnOrder> getAllReturnOrders()
        + ReturnOrder getReturnOrderByID(String ID)
        + void deleteReturnOrder(String ID)

        + void createReturnOrder(String ID, Date returnDate, List<<Pair<SKU, SKUItem>> products, String restockOrderId)
        + void modifyReturnOrderState(String ID, String newState)
    }

    ' Internal Order Management
    Class InternalOrderManager {
        + HashMap<InternalOrder> internalOrders

        + InternalOrder getInternalOrderByID(String ID)
        + List<InternalOrder> getAllInternalOrders()
        + List<InternalOrder> getAllIssuedInternalOrders()
        + List<InternalOrder> getAllAcceptedInternalOrders()
        + void deleteInternalOrder(String ID)

        + InternalOrder createInternalOrder(String ID, Date issueDate, List<<Pair<SKU, int>> products)
        + void modifyStateInternalOrder(String ID, String newState, List<String> RFIDs)
    }

    Class RestockOrderManager {
        - HashMap<RestockOrder> restockOrders
        - HashMap<TestDescriptor> testDescriptors

        + RestockOrder getRestockOrderByID(String ID)       /' If you have it in the list, return; otherwise contact DB handler'/
        + List<RestockOrder> getAllRestockOrders()          /' Return from the hashmap '/
        + List<RestockOrder> getAllIssuedRestockOrders()    /' Return from the hashmap '/

        + RestockOrder createRestockOrder(Date issueDate, List<<Pair<SKU, int>> products, int supplierId)
        + void modifyRestockOrderState(RestockOrder restockOrder, String newState)
        + void addRestockOrderSKUItems(RestockOrder restockOrder, List<SKUItem> skuItems)
        + void addRestockOrderTransportNote(RestockOrder restockOrder, Date transportNote)

        .. Test Descriptor ..
        + List<TestDescriptor> getAllTestDescriptors()
        + TestDescriptor getTestDescriptor(String ID)

        + void createTestDescriptor(String ID, String name, String procedureDescription, String IdSKU)
        + void modifyTestDescriptor(String ID, String newName, String newProcedureDescription, String newIdSKU)
        + void deleteTestDescriptor(String ID)
    }

    ' SKU Management
    Class SKUManager {
        - HashMap<SKU> skus 

        + SKU getSKUByID(String SKUID)
        + List<SKU> getAllSKUs()
        + void deleteSKU(String SKUID)

        + SKU createSKU(String ID, String description, int weight, int volume, String notes, float price, int availableQuantity)
        + void modifySKU(SKU sku, String newDescription, int newWeight, int newVolume, Sting newNotes, float newPrice, int newAvailableQuantity)
        + void addModifySKUPosition(SKU sku, String positionID)
    }

    ' Persistence Management
    Class DBHandler {
        + List<SKU> getAllSKUs()
        + SKU getSKUByID(String SKUID)
        + void saveSKU(SKU sku)
        + void deleteSKU(String SKUID)

        + List<User> getAllUsers()
        + User login(String username, String password)
        + User createUser(User user)
        + void modifyUserRights(String username, String oldType, String newType)

        + List<RestockOrder> getAllRestockOrders()
        + RestockOrder getRestockOrderByID(String ID)
        + void saveRestockOrder(RestockOrder restockOrder)
        + void deleteRestockOrder(String ID)

        + List<InternalOrder> getAllInternalOrders()
        + InternalOrder getInternalOrderByID(String ID)
        + void saveInternalOrder(InternalOrder internalOrder)
        + void deleteInternalOrder(String ID)

        + List<Position> getAllPositions()
        + Position getPositionByID(String ID)
        + void savePosition(Position position)
        + void deletePosition(String ID)

        + List<Position> getAllReturnOrders()
        + ReturnOrder getReturnOrderByID(String ID)
        + void saveReturnOrder(ReturnOrder returnOrder)
        + void deleteReturnOrder(String ID)

        + List<TestDescriptor> getAllTestDescriptors()
        + TestDescriptor getTestDescriptorByID(String ID)
        + void saveTestDescriptor(TestDescriptor testDescriptor)
        + void deleteTestDescriptor(String ID)

        + List<Item> getAllItems()
        + Item getItemByID(String ID)
        + void saveItem(Item item)
        + void deleteItem(String ID)

        + List<SKUItem> getAllSKUItem()
        + SKUItem getSKUItemByID(String ID)
        + void saveSKUItem(SKUItem SKUitem)
        + void deleteSKUItem(String ID)

        + List<TestResult> getAllTestResults()
        + TestResult getTestResultByID(String ID)
        + void saveTestResult(TestResult testResult)
        + void deleteTestResult(String ID)
    }

    ' Database connections
    DBHandler <-up- ItemManager
    DBHandler <-up- SKUItemManager
    DBHandler <-up- WarehouseManager
    DBHandler <-up- ReturnOrderManager
    DBHandler <-up- RestockOrderManager
    DBHandler <-up- InternalOrderManager
    DBHandler <-up- UserManager

    ' FacadeController connections
    FacadeController --> SKUManager
    FacadeController --> RestockOrderManager
    FacadeController --> InternalOrderManager
    FacadeController --> ReturnOrderManager
    FacadeController --> WarehouseManager
    FacadeController --> ItemManager
    FacadeController --> SKUItemManager
    FacadeController --> UserManager

    ' Managers' -- Managers' connections
    SKUItemManager <-left- RestockOrderManager
    SKUManager <-right- RestockOrderManager
    SKUItemManager <-left- ReturnOrderManager
    SKUManager <-right- ReturnOrderManager
    SKUManager <-right- InternalOrderManager
}
    
@enduml
```

## Busines Logic Package

```plantuml
@startuml LowLevelDesign
top to bottom direction

package it.polito.ezwh.businesslogic{
    Class RestockOrderManager
    Class InternalOrderManager
    Class ReturnOrderManager
    Class WarehouseManager
    Class ItemManager
    Class SKUItemManager
    Class UserManager

    note "The various Order classes contains a whole list of references to SKU and SKUItems to which are related, \nin order to make the overall application scalable. Despite the fact those verbose information are not needed now\n(only few attributes are mandatory), in the future the APIs can change, resulting in more fields needed." as more_info

    Class User {
        + id
        + role
        + username
        + password
        + type: [MANAGER, CUSTOMER, CLERK, QUALITY, SUPPLIER, DELIVERY]

        + User(String username, String name, String surname, String password, String type)
        + void modifyRights(String newType)
    }

    Class SKUItem {
        + RFID (idSKUItem)
        + SKUid
        + boolean Available
        + DateOfStock

        + SKUItem(String RFID, String SKUID, Date dateOfStock)
        + void modify(boolean newAvailable, newDateOfStock)
    } 

    Class TestResult {
        + uniqueID
        + id
        + idTestDescriptor
        + RFID (idSKUItem)
        + date
        + result

        + TestResult(String RFID, String ID, Date date, boolean result)
        + void modify(String newIdTestDescriptor, Date newDate, boolean newResult)
    }

    Class Item {
        + id
        + description
        + price
        + SKUId
        + supplierId

        + Item(String ID, String description, float price, String SKUId, String supplierId)
        + void modify(String newDescription, float newPrice)
    }

    Class Position {
        + id
        + aisleID
        + row
        + col
        + maxWeight
        + maxVolume
        + occupiedWeight
        + occupiedVolume                                    
        
        + Position(String positionID, String aisleID, int row, int col, int maxWeight, int maxVolume);
        + void modify(String newAisleID, int newRow, int newCol, int newMaxWeight, int newMaxVolume, int newOccupiedWeight, int newOccupiedVolume)
        + void modifyID(String newPositionID)
        + void increaseOccupation(int qty)
    }

    Class ReturnOrder {
        + id
        + returnDate
        + List<Pair<SKU, int>>
        + List<SKUItem>
        + restockOrderId

        + ReturnOrder(Date returnDate, List<<Pair<SKU, SKUItem>> products, String restockOrderId)
        + void modifyState(String newState)
    }

    Class InternalOrder {
        + id
        + List<Pair<SKU, int>>
        + state: [ISSUED, ACCEPTED, REFUSED, CANCELED, COMPLETED]

        + InternalOrder(Date issueDate, List<<Pair<SKU, int>> products)
        + void modifyState(String newState, List<String> RFIDs)
    }

    Class RestockOrder {
        + id
        + List<Pair<SKU, int>>
        + List<SKUItem>
        + issueDate
        + transportNote
        + state: [ISSUED, DELIVERY, DELIVERED, TESTED, COMPLETEDRETURN, COMPLETED]

        + RestockOrder(Date issueDate, List<<Pair<SKU, int>> products, int supplierId)
        + List<SKUItem> getItems()
        + void modifyState(String newState)
        + void addSKUItems(List<SKUItem> skuItems)
        + void addTransportNote(Date transportNote)
    }

    RestockOrder .. more_info
    RestockOrder .[hidden]. more_info

    Class TestDescriptor {
        + id
        + name
        + procedureDescription
        + SKUId
        
        + TestDescriptor(String ID, String name, String procedureDescription, String IdSKU)
        + void modify(String newName, String newProcedureDescription, String newIdSKU)
    }

    Class SKU {
        + id
        + description
        + weight
        + volume
        + notes
        + price
        + availableQuantity
        + List<TestDescriptor>

        + SKU(String ID, String description, int weight, int volume, String notes, float price, int availableQuantity)
        + void modify(String newDescription, int newWeight, int newVolume, Sting newNotes, float newPrice, int newAvailableQuantity)
        + void addModifyPosition(String positionID)

        + void addTestDescriptor(TestDescriptor testDescriptor)
    }

    ' Managers' -- Business Logic connections: 
    SKUManager -- "*" SKU
    RestockOrderManager -- "*" RestockOrder
    RestockOrderManager -- "*" TestDescriptor
    InternalOrderManager -- "*" InternalOrder
    ReturnOrderManager -- "*" ReturnOrder
    WarehouseManager -- "*" Position
    ItemManager -- "*" Item
    SKUItemManager -- "*" SKUItem
    SKUItemManager -- "*" TestResult
    UserManager -- User

    ' Application Logic connections
    SKU --right- TestDescriptor
}

@enduml
```


# Verification traceability matrix

|       FR Code        |  FR1  |  FR2  |  FR3  |  FR4  |  FR5  |  FR6  |  FR7  |
| :------------------: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
|         EZWH         |   X   |   X   |   X   |   X   |   X   |   X   |   X   |
|     UserManager      |   X   |       |       |   X   |       |       |       |
|         User         |   X   |   X   |   X   |   X   |   X   |   X   |   X   |
|    SKUItemManager    |       |       |       |       |   X   |   X   |       |
|       SKUItem        |       |       |       |       |   X   |   X   |       |
|      TestResult      |       |       |       |       |   X   |       |       |
|     ItemManager      |       |       |       |       |       |       |   X   |
|         Item         |       |       |       |       |       |       |   X   |
|   WarehouseManager   |       |       |   X   |       |       |       |       |
|       Position       |       |       |   X   |       |       |       |       |
|  ReturnOrderManager  |       |       |       |       |   X   |       |       |
|     ReturnOrder      |       |       |       |       |   X   |       |       |
| InternalOrderManager |       |       |       |       |       |   X   |       |
|    InternalOrder     |       |       |       |       |       |   X   |       |
| RestockOrderManager  |       |       |   X   |       |   X   |       |       |
|     RestockOrder     |       |       |       |       |   X   |       |       |
|    TestDescriptor    |       |       |   X   |       |       |       |       |
|      SKUManager      |       |   X   |       |       |   X   |   X   |       |
|         SKU          |       |   X   |       |       |   X   |   X   |       |

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
