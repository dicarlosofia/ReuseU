# Sprint 4 Review Report 


## Work Completed 

- **Sofia**: For the sprint, I created a price fill functionality on backend, using open AI. I also worked in collaboration with Timur to fix the message service on the backend.

- **Timur**: Helped identify the cross-platform issue with mac and locahosts vs explicit ip address. Interviewed Melina, one of the stakeholders. Helped on the backend and worked collaboratively with Sofia on message services.

- **Trung**:  I refactored API routes for better error handling, assisted Krishna in configuring GitHub Actions for automated testing and helped frontend displaying image from blob storage

- **Howie**: Further frontend development, interviewed two stakeholders (mason and cam). Created user-facing documentation.

- **Peter**: I implemented blob storage for uploading and receiving one or multiple images for a particular listing. The listing routes automatically handle image data. I also implemented image downscaling during listing creation.
 
- **Krishna**: I’ve made significant progress on the CI/CD testing suite and automation. When a push is made, the test files now run automatically. All that remains now is to implement automated deployment and similar test files for newly implemented chat functions.

 

## Sprint 4 In Review 

1. _How has your product improved or progressed from a customer perspective? (Describe in terms of high-level features that a non-technical user could recognize and appreciate.)_ 

- New visual color pallete
-  working filters, 
- better looking profiles page,
- the log in /sign up page now working.
- images now supported



### Features and activation instructions 

**Creating a listing**: In the top right corner (on the dashboard), find and click on the plus icon (between the searchbar and the profile icon). Fill in the title, desciption, and price fields, upload photos of the listing, and assign tags to the listing. Then scroll down and click “SUBMIT” button to submit your new listing. 

**Filtering listings**. Use filters on the left to filter by price or tags. For instance, to view listings between $0.00 and $50.00, click on the price drop-down and check the boxes for “Under $10” and also “$10-$50”. To look at laptops, click on the electronics drop-down and check the box next to “laptops” 

**Viewing and editing profile**. To view your profile, simply click on the little person/profile icon in the top left corner on the dashboard (between settings gear icon and the marketplace icon). 

**Viewing a listing in full**. Find a listing of interest and simply click on its title. A new page will show up.

**Favoriting a listing**: Find a listing of interest and simply click on the heart in the bottom right corner of the rectangular container. 

**Chats**: In the bottom right corner, find the chat menu/interface. Simply click on the up/down arrod to expand/collapse the chat interface. Click on the user profile to open the respective chat window and type away!

 
 
2. _What progress have you made that is not visible to a common user?_ 

- We continued making progress on making database manipulation intuitive and accessible for our front-end team, and also further implemented a more thorough test suite to ensure the database works as expected. We included image support with blob storage for our database, so that the listings now can display images. We also finalyl figured out the tricky nature of chats+messages being stored in two different tables yet being connected on a strucutral level. We finihsed implemention necessary functions that properly update both tables when new messages are being added in a chat or when en entire chat gets deleted. We also refactored API routes for better error handling and configured GitHub Actions for automated testing.

 

 

 