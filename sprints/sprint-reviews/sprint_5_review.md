# Sprint 5 Review Report

## Work Completed

- **Sofia**: Commented code for readability and refined the README.md file to have better navigation for future users.

- **Timur**: Worked on the backend of reviews, handling both the review functionality and implementing the star rating system for sellers.

- **Howie**: Overhauled frontend, enhanced new components on Chats, Profile, and Listings, fixed authentication bugs and implemented filtering and WebSocket chats.

- **Trung**: Deployed the website on Vercel and worked with Krishna on automated deployment.

- **Peter**: Built the upload profile pictures feature from the ground up and added a corresponding bucket in R2 blob storage. Implemented React code in profiles to add this to front-end. Connected the open-ai price fill to frontend and implemented rate limiting.

- **Krishna**: Finished automated testing and finalized visual/artistic choices such as logo, mascot and icon.

## Sprint 5 In Review

1. _How has your product improved or progressed from a customer perspective? (Describe in terms of high-level features that a non-technical user could recognize and appreciate.)_

- Website is now deployed and accessible online at https://reuse-u-ruddy.vercel.app/
- Profile pictures can now be uploaded and displayed
- Reviews and star ratings for sellers have been implemented
- Chat functionality now works properly with real-time updates using WebSockets
- Overall performance improvements with faster loading times
- Improved user interface with finalized visual elements including logo, mascot, and icons
- Price suggestion feature using AI is now available when creating listings

### Features and activation instructions

**Creating a listing**: In the top right corner (on the dashboard), find and click on the plus icon (between the searchbar and the profile icon). Fill in the title, description, and price fields, upload photos of the listing, and assign tags to the listing. The AI will suggest a price based on your description. Then scroll down and click "SUBMIT" button to submit your new listing.

**Filtering listings**: Use filters on the left to filter by price or tags. For instance, to view listings between $0.00 and $50.00, click on the price drop-down and check the boxes for "Under $10" and also "$10-$50". To look at laptops, click on the electronics drop-down and check the box next to "laptops".

**Viewing and editing profile**: To view your profile, simply click on the little person/profile icon in the top left corner on the dashboard. You can now upload a profile picture to personalize your account.

**Viewing and rating sellers**: When viewing a listing, you can see the seller's star rating. After a transaction, you can leave a review for the seller.

**Chat with sellers**: Use the new WebSocket-powered chat system for real-time communication with sellers about their listings.

2. _What progress have you made that is not visible to a common user?_

- Fixed several critical bugs including:
  - Profile page loading issues
  - Delete_message function error handling
  - Password reset functionality
- Implemented automated deployment through Vercel
- Completed the automated testing suite for continuous integration
- Added proper licensing (GNU General Public License v3.0) to the project
- Significant performance optimizations that reduced image loading times from ~30 seconds to normal speeds
- Code cleanup and extensive documentation for future maintainers
- Rate limiting for AI-powered features to manage API costs

## Adoption Status

The team has successfully addressed the performance issues and bugs that were preventing deployment:

- Loading times have been significantly improved
- Base64 compression issues have been resolved
- Chat functionality now works properly on both frontend and backend
- Successfully deployed to Vercel with working functionality

The product is now ready in beta for adoption with a functioning deployment at https://reuse-u-ruddy.vercel.app/ and only minor issues remaining with image loading in the production environment that the team plans to resolve after the semester.
