# Sprint 3 Journal 


## Changes to Requirements Document: 
We have not made any changes to our Requirements Document during this sprint. 


## Non-user-facing Progress Made: 
Significant progress has been made toward streamlining database operations for the front-end team. We've modularized core entities—transactions, reviews, accounts, listings, and messages to be manipulated withing their dedicated tables. By the end of the sprint, full CRUD (Create, Read, Update, Delete) functionality is operational and stable across these tables, with no critical regressions observed on the ReuseU platform. Robust data validation mechanisms are now in place to enforce type safety and schema consistency. Additionally, RESTful API endpoints have been implemented to allow seamless integration between the front-end and the database layer.

1. **CRUD Services**
Two seperate folders were made for the backend: services and routes. Peter and Sofia implememted full database functionality within the services folder. The accounts file was the first implemented which involved creating an account from an account data dictionary and deleting/getting an account using the account id. In a very similar fashion, the transaction file was also implemented. Creating CRUD operations for reviews was a little more tricky, since it needed to be ensured that a particular listing exists prior to its review being created. The messages file was not fully completed. Messages need to be stored in two seperate tables: Chat and Message tables. The chat table contains the entire conversation as a field alongside the listing id (since chats are tied to a listing), while messages contain who was the seller/buyer, timestamp and content. Adding the message and its corresponding chat was implemented, but we had some road blocks in deletion due to having to iterate through messages in a chat which was not intuitive. This will be completed next sprint

2. **API Routes**
Trung, Howie and Peter focused on connecting the database function in services to the front end through the API...

3. **Backend Testing**
Sofia and Krishna created and used a separate test file, `test_suite.py`, to easily, manually test database CRUD functions. Sofia introduced a menu system to help with easing the testing process, where the user can manipulate the database directly from the test suite menu in the terminal. The test suite adds test entries for all tables in the database (Listings, Reviews, Transactions, Messages, and Accounts), as well as seeing all entries, seeing individual entries, and deleting a user-specified range of values. This way, the backend team does not need to manually create test data and can perform CRUD operations in an automated process.


## Git Tag for Demo Code: 
<!-- put in the last git tag we’ll use for demo code here  -->

## Manual Testing Justification for Frontend Development: 
In the development of the ReuseU website, Howie and Timur opted for manual testing over automated testing for the frontend components for the following reasons: 

1. **Visual Nature of Components**
A significant portion of our frontend consists of visual elements with specified colors, borders, box-sizes, buttons, etc, which are naturally challenging and often redundant when checked automatically. For instance, evaluating the layout and the color scheme based on the visual inspection is largely advantageous to testing it based on predefined automated tests, which would be harder to set up and offer little to no value in actually assessing the visual aesthetics of the UI components. Similarly, responsiveness of interactive elements (buttons, scrolling) often requires visual judgment, something current automated test frameworks often struggle with or require complex setups to approximate. 

2. **Limited Experience with UI Testing**
Our team has limited prior experience in writing automated tests for .tsx components with visual interfaces that combine react, tailwind css, and javascript. Without established fluency in frameworks like Jest with React Testing Library or Cypress for UI testing, we decided that manual testing offered a more reliable and time-efficient method, especially given the unusually short timeline for initial release (Sprint 3). 

3. **Simplicity of Manual Testing**
Given the relatively small number of components and pages on the ReuseU site, we believe manual testing offers a simple and efficient approach. It allows us to directly observe and verify use cases, component layouts, and the general functionality without the complexity of setting up and maintaining automated test infrastructure. 

4. **Course Context**
While our class lectures emphasized the importance of testing in software development and introduced a variety of testing approaches, we believe they primarily focused on backend logic, such as testing file permission bits or checking mathematical logic. There was unfortunately little in-class guidance on implementing tests for visual frontends. This further contributed to our decision to rely on manual testing. 
