# Integration and API Test Report

Date:

Version:

# Contents

- [Dependency graph](#dependency graph)

- [Integration and API Test Report](#integration-and-api-test-report)
- [Contents](#contents)
- [Dependency graph](#dependency-graph)
- [Integration approach](#integration-approach)
- [Integration Tests](#integration-tests)
  - [Step 1](#step-1)
  - [Step 2](#step-2)
  - [Step 3](#step-3)
- [API testing - Scenarios](#api-testing---scenarios)
  - [Scenario UCx.y](#scenario-ucxy)
- [Coverage of Scenarios and FR](#coverage-of-scenarios-and-fr)
- [Coverage of Non Functional Requirements](#coverage-of-non-functional-requirements)
    - [](#)

- [Tests](#tests)

- [Scenarios](#scenarios)

- [Coverage of scenarios and FR](#scenario-coverage)
- [Coverage of non-functional requirements](#nfr-coverage)



# Dependency graph 

     <report the here the dependency graph of the classes in EzWH, using plantuml or other tool>
     
# Integration approach

    <Write here the integration sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence
    (ex: step1: class A, step 2: class A+B, step 3: class A+B+C, etc)> 
    <Some steps may  correspond to unit testing (ex step1 in ex above), presented in other document UnitTestReport.md>
    <One step will  correspond to API testing>
    


#  Integration Tests

   <define below a table for each integration step. For each integration step report the group of classes under test, and the names of
     Jest test cases applied to them, and the mock ups used, if any> Jest test cases should be here code/server/unit_test

## Step 1
| Classes  | mock up used |Jest test cases |
|Sku.dao|--|"Create Sku"|
|--|--|"Add Position to a inexistent Sku"|
|--|--|"Add inexistent Position to a Sku"|
|--|--|"Add a not occupied Position to Sku without a previous Position"|
|--|--|"Add occupied Position to Sku without a previous Position"|
|--|--|"Add Position to Sku with a previous Position"|
|--|--|"Add a Position to a Sku with Weight exceeding"|
|--|--|"Add a Position to a Sku with Volume exceding"|
|--|--|"Modify inexistent Sku"|
|--|--|"Modify Sku with no related Position"|
|--|--|"Modify Sku with a Position associated"|
|--|--|"Modify Sku with a Position associated exceeding Weight"|
|--|--|"Modify Sku with a Position associated exceeding Volume"|
|--|--|"Delete inexistent Sku"|
|--|--|"Delete existent Sku"|
|skuitem.dao|--|"Create SKUItem after check SKUId"|
|--|--|"Modify SKUItem after create"|
|--|--|"Delete inexistent SkuItem"|
|--|--|"Delete SKUItem after create"|
|user.dao|--|"Create User"|
|--|--|"Modify inexistent User"|
|--|--|"Modify User"|
|--|--|"Check inexistent User"|
|--|--|"Check inexistent User"|
|--|--|"Delete inexistent User"|
|--|--|"Delete User"|
|testdescriptor.dao|--|"Get All Test Descriptors"|
|--|--|"Get Test Descriptor by Id"|
|--|--|"Creating Test Descriptor"|
|--|--|"Create test descriptor with inexistent sku"|
|--|--|"Create test descriptor with sku with an already assigned one"|
|--|--|"Create test descriptor"|
|--|--|"Modifing test descriptor"|
|--|--|"Modify test descriptor fields"|
|--|--|"Modify not existent test descriptor"|
|--|--|"Modify Test Descriptor with already assigned Sku"|
|--|--|"Deleting test descriptor"|
|--|--|"Deleting inexistent test descriptor"|
|testresult.dao|--|"Get All Test Results"|
|--|--|"Get Test Result"|
|--|--|"Get inexistent Test Result"|
|--|--|"Create Test Result with inexistent Test Descriptor"|
|--|--|"Creating test result"|
|--|--|"Modify existing test result"|
|--|--|"Modifying Test Result with not existing Test Descriptor"|
|--|--|"Modifying not existing Test Result"|
|--|--|"Delete existing test result"|
|--|--|"Delete not existing test result"|
|internalorder.dao|--|"Create Internal Order after check SKUId"|
|--|--|"Modify inexistent Internal Order"|
|--|--|"Modify Internal Order ACCEPTED"|
|--|--|"Modify Internal Order COMPLETED"|
|--|--|"Delete inexistent Internal Order"|
|--|--|"Delete Internal Order after create"|
|restockorder.dao|--|"Create a Restock Order"|
|--|--|"Modify State of inexistent Restock Order"|
|--|--|"Modify State of Restock Order"|
|--|--|"Modify Sku Item list with valid Sku Items"|
|--|--|"Modify Sku Item list of inexistent Restock Order"|
|--|--|"Modify Sku Item list with inexistent Sku Items"|
|--|--|"Modify Transport Note with Delivery Date before Issue Date"|
|--|--|"Modify Transport Note of inexistent Restock Order"|
|--|--|"Modify with valid Transport Note"|
|--|--|"Delete Restock Order with inexistent id"|
|--|--|"Delete valid Restock Order"|
|--|--|--|






## Step 2
| Classes  | mock up used |Jest test cases |
|--|--|--|
|Sku.controller|--|"Get All SKUs"|
|--|--|"Get SKUs by ID"|
|--|--|"Create valid SKU"|
|--|--|"Modify inexistent SKU"|
|--|--|"Add or modify position of a SKU"|
|--|--|"Add or modify position that does not exist of a SKU"|
|--|--|"Add or modify position of a SKU that does not exist"|
|--|--|"Delete inexistent SKU"|
|--|--|"Delete SKU t"|
|InternalOrder.controller||"Create valid Internal Order"|
|--||"Get All Internal Orders"|
|--|--|"Modify inexistent Internal Order"|
|--|--|"Modify state Internal Order ACCEPTED"|
|--|--|"Modify state Internal Order COMPLETED"|
|--|--|"Delete internal Order"|
|--|--|"Delete inexistent internal Order"|
|skuitem.controller|--|"Get All SKUItems"|
|--|--|"Get SKUItems by ID"|
|--|--|"Create invalid SKUItem"|
|--|--|"Create valid SKUItem"|
|--|--|"Create double SKUItem"|
|--|--|"Modify inexistent SKUItem"|
|--|--|"Modify valid SKUItem"|
|--|--|"Modify SKUItem with a RFID that already exist"|
|--|--|"Delete inexistent SKUitem"|
|--|--|"Delete SKUItem"|
|testdescriptor.controller|--|"Get all Test Descriptors"|
|--|--|"Get Test Descriptor by Id"|
|--|--|"Get inexistent Test Descriptor"|
|--|--|"Create a valid test descriptor"|
|--|--|"Create an invalid test descriptor (SKU not found)"|
|--|--|"Create an invalid test descriptor (provided SKU already assigned)"|
|--|--|"Modify test descriptor with an invalid id"|
|--|--|"Modify test descriptor with an invalid SKUId"|
|--|--|"Modify test descriptor of a SKU that have already a Test Descriptor"|
|--|--|"Delete test descriptor"|
|--|--|"Delete inexistent test descriptor"|
|testresult.controller|--|"Get All Test Result"|
|--|--|"Get Test Result by RFID and ID"|
|--|--|"Create valid Test Result"|
|--|--|"Create Test Result with inexistent Test Descriptor"|
|--|--|"Modify inexistent Test Result"|
|--|--|"Modify Test Result with inexistent Sku Item"|
|--|--|"Modify Test Result with inexistent Test Descriptor"|
|--|--|"Modify Test Result with all valid parameters"|
|--|--|"Sku Item has some failed Test Result"|
|--|--|"Sku Item has no failed Test Result"|
|restockorder.controller|--|"Create Restock Order with invalid Item"|
|--|--|"Create Restock Order"|
|--|--|"Modify State of inexistent Restock Order"|
|--|--|"Create Restock Order with invalid Item"|
|--|--|"Modify State of valid Restock Order"|
|--|--|"Modify Sku Item list of inexistent Restock Order"|
|--|--|"Modify Sku Item list of Restock Order not in DELIVERED state"|
|--|--|"Modify Sku Item list of Restock Order with invalid ones"|
|--|--|"Modify Sku Item list with valid Sku Items"|
|--|--|"Modify Transport Note of inexistent Restock Order"|
|--|--|"Modify Transport Note of Restock Order not in DELIVERY state"|
|--|--|"Modify Transport Note with Delivery Date before Issue Date"|
|--|--|"Modify with valid Transport Note"|
|--|--|--|




## Step 3 

   
| Classes  | mock up used |Jest test cases |
|internalorderRouter|--|"Get Internal Order by Id"|
|--|--|"Create Internal Order"|
|--|--|"Modify State of inexistent Internal Order"|
|--|--|"Modify State (COMPLETED) of inexistent Internal Order"|
|--|--|"Modify State of Internal Order"|
|--|--|"Modify State (COMPLETED) of Internal Order"|
|--|--|"Delete inexistent Restock Order"|
|--|--|"Delete Restock Order"|
|restockorderrouter|--|"Get Restock Order by Id"|
|--|--|"Create Restock Order"|
|--|--|"Modify State of inexistent Restock Order"|
|--|--|"Modify State of Restock Order"|
|--|--|"Modify Sku Item list of inexistent Restock Order"|
|--|--|"Modify Sku Item list of Restock Order not in DELIVERED state"|
|--|--|"Modify Sku Item list with inexistent Sku Items"|
|--|--|"Modify Sku Item list with valid Sku Items"|
|--|--|"Modify Transport Note of inexistent Restock Order"|
|--|--|"Modify Transport Note of Restock Order not in DELIVERY state"|
|--|--|"Modify Transport Note with Delivery Date before Issue Date"|
|--|--|"Modify with valid Transport Note"|
|--|--|"Delete inexistent Restock Order"|
|--|--|"Delete Restock Order"|
|--|--|--|





# API testing - Scenarios


<If needed, define here additional scenarios for the application. Scenarios should be named
 referring the UC in the OfficialRequirements that they detail>

## Scenario UCx.y

| Scenario |  name |
| ------------- |:-------------:| 
|  Precondition     |  |
|  Post condition     |   |
| Step#        | Description  |
|  1     |  ... |  
|  2     |  ... |



# Coverage of Scenarios and FR


<Report in the following table the coverage of  scenarios (from official requirements and from above) vs FR. 
Report also for each of the scenarios the (one or more) API Mocha tests that cover it. >  Mocha test cases should be here code/server/test




| Scenario ID | Functional Requirements covered | Mocha  Test(s)      | 
| ----------- | ------------------------------- | -----------         | 
|  1-1        | FR2.1                             |"Create Sku"         |             
|  1-2        | FR2.1                             |"Modify Sku location"|             
|  1-3        |                                 |"Modify Sku weight and volume"|             
|  2-1        | FR3.1.1                                |"Create Position"    |             
|  2-2        | FR3.1.1                                |"Modify positionID of P" |             
|  2-3        | FR3.1.4                                |"Modify weight and volume of P"    |     
|  2-4        | FR3.1.4                                |"Modify aisle ID, row and column of P"             |
|  2-5        | FR3.1.2                                |"Delete position P"  |
|  3-1        | FR5.6                                |"Restock Order of SKU S issued by quantity / by supplier"             |
|  3-2        | FR5.6                                |"Restock Order of SKU S issued by quantity / by supplier"             |
|  4-1        | FR1.1                                |"Create user and define rights"             |
|  4-2        | FR1.1                               |"Modify user rights"             |        
|  4-3        | FR1.2                                |"Delete user"        |
|  5-1-1      | FR5.8                                |"Record restock order arrival"             |
|  5-2-1      | FR5.8                                |"Record positive and/or negative test results of all SKU items of a RestockOrder"             |
|  5-2-2      | FR5.8                                |"Record positive and/or negative test results of all SKU items of a RestockOrder"             |
|  5-2-3      | FR5.8.2                                |"Record positive and/or negative test results of all SKU items of a RestockOrder"             |
|  5-3-1      | FR5.8.3                                |"Stock all SKU items of a RO"             |
|  5-3-2      | FR5.8.3                                |"Stock zero SKU items of a RO"             |
|  5-3-3      | FR5.8.3                                |"Stock some SKU items of a RO"             |
|  9-1        | FR6.1                                |"Create Internal Order"             |
|  9-2        | FR6.6                                |"Create and Refuse Internal Order"             |
|  9-3        | FR6.4                                |"Create and Delete Internal Order"             |
| 10-1        | FR6.7                                |"Internal Order IO Completed"             |
| 11-1        | FR7                                |"Create Item I"            |
| 11-2        | FR7                                |"Modify Item description and price"             |
| 12-1        | FR3.2.1                                |"Create test description"             |
| 12-2        | FR3.2.2                                |"Update test description"             |
| 12-3        | FR3.2.3                                |"Delete test description"             |



# Coverage of Non Functional Requirements


<Report in the following table the coverage of the Non Functional Requirements of the application - only those that can be tested with automated testing frameworks.>


### 

| Non Functional Requirement | Test name |
| -------------------------- | --------- |
|                            |           |

