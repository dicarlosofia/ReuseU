# Sprint 3 Journal 


## Changes to Requirements Document: 
We have not made any changes to our Requirements Document during this sprint. 


## Non-user-facing Progress Made: 
Significant progress has been made toward streamlining database operations for the front-end team. We've modularized core entities—transactions, reviews, accounts, listings, and messages to be manipulated withing their dedicated tables. By the end of the sprint, full CRUD (Create, Read, Update, Delete) functionality is operational and stable across these tables, with no critical regressions observed on the ReuseU platform. Robust data validation mechanisms are now in place to enforce type safety and schema consistency. Additionally, RESTful API endpoints have been implemented to allow seamless integration between the front-end and the database layer. 


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