# Easy Warehouse 

First approach to NodeJS and ExpressJS to build APIs, along with the required documentations!

## Informal Description
Medium __companies__ and __retailers__ need a simple application to manage the relationship with __suppliers__ and the inventory of physical __items__ stocked in a physical __warehouse__.
The warehouse is supervised by a __manager__, who supervises the availability of items. When a certain item is in short supply, the manager issues an __order__ to a supplier. In general the same item can be purchased by many suppliers. The warehouse _keeps a list_ of possible suppliers per item.

After some time the items ordered to a supplier are received. The items must be quality checked and stored in specific __positions__ in the warehouse. The quality check is performed by specific roles (quality office), who apply specific __tests__ for item (different items are tested differently). Possibly the tests are not made at all, or made randomly on some of the items received. If an item does not pass a quality test it may be rejected and sent back to the supplier.

Storage of items in the warehouse must take into account the availability of physical __space__ in the warehouse. Further the __position__ of items must be traced to guide later recollection of them.

The warehouse is part of a company. Other __organizational units__ (OU) of the company may ask for items in the warehouse. This is implemented via __internal orders__, received by the warehouse. Upon reception of an internal order the warehouse must collect the requested item(s), prepare them and deliver them to a __pick up area__. When the item is collected by the other OU the internal order is completed.

EZWH (EaSy WareHouse) is a software application to support the management of a warehouse.

## Docs
- [Requirements Document](./docs/RequirementsDocument.md)
- [Final Requirement Document](./docs/OfficialRequirements.md)
- [Design Document](./docs/DesignDocument.md)
- [API Document](./docs/API.md)
- [Unit Testing Report](./docs/UnitTestReport.md)
- [API Testing Report](./docs/ApiTestReport.md)

## Technologies
- [NodeJS](https://nodejs.org/it/)
- [ExpressJS](https://expressjs.com/it/)
- [Jest](https://jestjs.io/)
- [Mocha](https://mochajs.org/)
