# Sprint 4 Journal 

## Part 1: External Documentation and Stakeholder Meetings

Who you met with
Melina Kouidou, Student. Meeting held on 4/18/2025 at 12pm.


Description of the test session and feedback

The stakeholder was presented with the following list of prompts:
1. Create a listing selling a chair
2. Search for an item of your choice on the home page
3. Modify your profile information (e.g. email, name)
4. Try messaging someone
5. Identify any listing and then view detailed information about it.


Below are descriptions of how the user navigated each of the prompts and what worked well or needs to be fixed: 

* Prompt 1: User found the button independently after a few seconds. Filled in all fields. Struggled with submitting a listing because chats were blockign the "SUBMIT" button. Chats need to be moved.
* Prompt 2: User navigated to search bar, which obviously didn't work... then user found filters. Noticed the scrolling issue with the filters. Continued to use filter. Specifically, she filtered by items above $500 and bottoms, but only electronics showed up. Filters don’t seem to really work by categories. Needs fixing.
* Prompt 3:  This wasy easy. User immediately found the profile page, identified the edit button and edited the information about herself. 
* Prompt 4: Clearly found the chats window and sent a message, though the message never appeared as sent (our issue)
* Prompt 5: Successfully completed, Melina clicked on a dell laptop to expand's its full description (also laughed at funny description).


The user quickly glanced over the documentation at the beginning and then quickly decided to continue completing the prompts.
Overall, the user succeeded with completing all the tasks to the extent the website made it possible. That is, the user only failed to complete a task if there was a clear functional issue with the website (e.g. search the bar not working), but otherwise Melina seemed to have a pretty intiutive interaction with the site. She also did not seem to need to rely on documentation very much. Once she quickly reviewed it at the beginning, she did not have to look back at it, which frankly is a good result which shows that our website is intuitive just given its visual interface.


No feedback was given on documentation as user's interactions with it were minimal, and the documentation appeared unimportant to the  user.


We further asked Melina the following questions, to which she provided the following answers:

* How simple / intuitive is it to navigate the website and achieve what you want to / need to do:
- pretty intuitive overall, though there's definitely some functional limitations like the serach bar.
* What have you encountered that might make you less likely to use the website?
- Chats. The chats were pretty annoying with being in the way. Also the search bar needs to work. Marketplace button is not super intuitive. I kind of remembered it from paper prototyping.
* What changes / additions would make you more likely to use the website?
- Move chats or make them collapsible and draggable. Fix the search bar, and change the marketplace icon. 





Cam Haaland, Research Associate. 4/27/25 7:00 PM
Candidate was in DASIL, immediately approached and interacted. Gave layout of how meeting would be undertaken.
Showed docs, then gave signin screen. Signed in, navigated around website while casually chatting.

Found the documentation pretty intuitive, quickly jumped into navigating website with no problem. Said that the documentation was intuitive and sufficient.

They absolutely succeeded in utilizing the website.

Our two questions:

Did you see any potential points of improvement when it comes to intuitiveness?

No, not really, I feel like I found everything ok.


What are your thoughts on the website design?

Its uh, pretty good. Layouts good. Solid aesthetics, no complaints. 

From this stakeholder meeting we will update our website with: adding actual chat functionality, fixing filter bug

Mason O'Bryan, Student (unemployed) 4/27/25 7:30 PM
Candidate was in DASIL, waiting his turn after previous candidate. Gave layout of how meeting would be undertaken.
Showed docs, then gave signin screen. Signed in, navigated around website while casually chatting.

Mason also fund documentation intuitive, started website navigation quickly and seemingly without issue. Said that documentation was good.

Succeeded in utilizing website.

Our two questions:

Did you see any potential points of improvement when it comes to intuitiveness?

I thought it was pretty intuitive overall, I found all the buttons.


What are your thoughts on the website design?

Seems like a good design, looks like the paper prototype if I remember correctly, you guys did well.
However, as an aside, I think the listings loading time is far too long. 

From this stakeholder meeting we will update ReuseU with: Fixing backend query time.







## Part 2: Internal Documentation

### Team 1: Krishna, Peter, Timur. 
Timur and Peter reviewing Krishna’s code
#### Code we worked on: 
ReuseU/backend/services/test_suite.py lines 1-566

#### Changes we made: 

* Made the testing menu case-insensitive for user input such as Y/y or N/n to make testing simpler. 
* Clarified the inclusive/exclusive nature of indices when deleting accounts. Made both indices inclusive for ease of use.
* Changed the menu message for when deleting accounts to  say smth closer to “enter starting index for range of accounts to delete (inclusive)”
* Possible change to be implemented later : ensure consistency in naming variables (snake case and capitalization of variables)

#### Existing documentation that was helpful

We found menu comments/directions in the test-suite for the tester to follow to be particularly useful and well-organized by use-case. Doc strings for functions in the code file were also helpful tho more needed.
The larger one-line comments that separate code into logical sections

#### Commit hash for new documentation and link:
* Commit hash: 48e5318a88c1532675d863914aade1209df3989f
* Link: https://github.com/dicarlosofia/ReuseU/commit/48e5318a88c1532675d863914aade1209df3989f



### Team 1.1: Krishna, Peter, Timur. 
Timur and Krishna reviewing Peter’s code
	
#### Code we worked on: 
* ReuseU/backend/services/message_service.py lines 25-74, and 
* ReuseU/backend/services/transaction_service.py lines 20-50

#### Changes we made: 

* Clarified some of the documentation in add_message function, specifically how the indexing for creating new message works. 
* Removed debugging print statements for code cleanliness.
*  Included comments to explain the if else branch for appending a message vs creating a new one. 
* Also deleted OLD LOOP code.
* Removed unnecessary spacing between the documentation strings and the function definitions.

#### Existing documentation that was helpful

I found the doc strings at function definitions that talk about input formats were helpful in understanding what the function is expected to take in as a parameter and then understand how it operates on that parameter. 



#### Commit hash for new documentation and link:
* Commit hash: c70dad086cc1f5a4007907259da851a32f817040
* Link: https://github.com/dicarlosofia/ReuseU/commit/c70dad086cc1f5a4007907259da851a32f817040




### Team 2: Sofia, Howie, Trung
	
#### Code we worked on: 
* ReuseU/frontend/src/Context/GlobalContext.tsx
* ReuseU/backend/services openai_price_fill.py lines 43-94
* ReuseU/backend/services blob_storage.py lines 28-64

#### Changes we made: 
* Trung on Howie: Added comprehensive docstrings to GlobalContext, describing all state, methods, and usage patterns for global app state, authentication, and filters.
* Example usage and filter/category structures are now clearly documented for future contributors.
* Sofia: Added documentation to `connect_to_blob_db_resource()`, and added header comments to `get_all_files()` and `(get_files_listing_id)`

#### Existing documentation that was helpful
* I found help from existing prop and function docstrings in GlobalContext.tsx and component files; Menu comments and logical section comments in both backend and frontend files.

#### Commit hash for new documentation and link:
* Commit hash(es)
dece7f506bf111c2b9515c5b0cfc91694c6d9b62
4091b4ba36d6499275a1b6b5e42b5ff7c5279f1b
1dccc4f9d6adb7b87203611f6f9a1c8a8e924047
* Link:
  https://github.com/dicarlosofia/ReuseU/compare/main...labdoc2
---







## Part 3: Self-Selected Work toward Minimum Viable Product (MVP)

#### Non-functional Requirements

1. Users must have a **.edu email address** for security.
2. Each university’s email network should have a **separate webpage/database** accessible only by users of that university.
3. User emails should be hidden from other users—only usernames should be visible.



#### External Requirements

- ReuseU will be a web-based platform accessible via a public URL.
- Instructions will be provided for setting up another instance of the website on a local server.
- Security measures will be implemented, including requiring a university email.
- The project will include documentation to facilitate contributions and system understanding.

##### REQUIREMENT UPDATES FROM PEER FEEDBACK
    - to prevent malignant usage and emphasize code stability, ReuseU will not be made open source.
    - Users should be able to list items for sale and trade with price parameters they define themselves
    - A **moderation** system should allow administrators to report or remove inappropriate listings
    - Listings should **expire automatically** after a set period to prevent outdated post clutter
    - A **category-based search and filter should be implemented for easy item searching**
    - interface should be **mobile-friendly**

##### REQUIREMENT UPDATES FROM CIDER LAB
    - preferred payment method tags will be added as to not be restrictive
    - there will be an optional "delivery method" tag that can be used if items are large/far away, etc.

##### PHYSICAL REQUIREMENTS FROM PROTOTYPE TESTING
    - Report functionality for a listing/user
    - Profile section with settings
    - back buttons
    - better tag placement

#### Scope and Feature List

#### **Major Features**
1. Unique **Databases** for each university **.edu address**.
2. Page displaying **available products** at each university.
3. **Login implementation** with unique users grouped by university.
4. Separate **buying and selling interfaces**.


#### Work remaining to MVP:
Each university’s email network should have a **separate webpage/database** accessible only by users of that university.
ReuseU will be a web-based platform accessible via a public URL.
- The project will include documentation to facilitate contributions and system understanding. (not entirely done)
- A **moderation** system should allow administrators to report or remove inappropriate listings
- Listings should **expire automatically** after a set period to prevent outdated post clutter
interface should be **mobile-friendly**
- preferred payment method tags will be added as to not be restrictive
    - there will be an optional "delivery method" tag that can be used if items are large/far away, etc.
    - Report functionality for a listing/user
    - better tag placement
Unique **Databases** for each university **.edu address**.
**Login implementation** with unique users grouped by university.






## Part 4: Generative AI Experiment
* Sofia used OpenAI to implement a Price suggestion feature.
   1. Going into using OpenAI for the first time in this way, I was expecting the AI to very in the price range that it gave. I was hoping that this AI would help circumvent our need to cross-check different listings in our database and use the LLM's database instead for price-matching. Especially because there may not always be many, or any other listings of the same type to cross-reference in thr first place.
   2. How I prompted it: In my function, `get_price_prediction`, I pass in `name`, `category`(s), and `description`(optional), and use these aspects of a listing to generate a price range suggestion to provide when a user creates a listing and goes to input a price. I used the following prompt: 
      1. _"Give me a good general price for `{name}`, in the `{category}` category(s), described as `{description}`"_
      2. I put the following in the `instructions` field: _"Do not restate the prompt, just provide the price range for the item with no dollar signs in this format: `<lower_price>-<upper_price>`"_
   3. This Ai experiment helped me move on to help complete other pressing matters more quickly. We were unable to create an API route for it in time. But, without OpenAI, I wouldn’t not have been able to help Timur fix the messages service.
   4. *OpenAI* helped immensely with easing the process of price suggestions. It is a feature that we originally pushed off as a stretch goal due to the complexity of our original approach, but this turned it into a very doable deliverable.



* Sofia and Timur used cursor to implement a delete_chat function in the backend/services/message_service.py file
   1.  Going into using Cursor, we were expecting it to assist us in coding the function with its auto-complete suggestions. The goal was to write this function faster, and hopefully validating its correctness with a few potential fixes.
   2. We didn't have to promopt Cursor AI explicitly. Instead, we identified roughly 4-5 steps of what the function is supposed to achieve and how, and wrote those out as comments in the code, a skeleton so to speak. Then, as we started writing code and the cursor would automatically suggest to finish lines of code and/or write additional ones. 
   3.  **TODO:** It assisted the product development in that it seemed to suggest code for what we were already going to do in the developemnt process. Once we identified the right steps to follow in our function, we just had to finish writing the actual code, and at times perhaps loop up syntax/functionality online, but with Cursor it felt like it was either reminding us of existing funcitonality or "finishing our (code) sentences" in a way we would have done, just more slowly if we did it independently.
   Here is a [link to a Pull Request](https://github.com/dicarlosofia/ReuseU/pull/145) where this function can be found
   4. We think the use of Cursor AI achieved our goals of writing the function and confirmed our expectations pretty well. It was easy to use, assisted us in th process, and was very clear to understand. We also liked that we didn't have to go out of our way much to have it work and be seamlessly integrated into the IDE.

* Trung and Peter used Windsurf GPT-4.1 to debug and implement image display from Cloudflare blob storage
   1. While working on displaying images for listings, I noticed that the TypeScript type used for listing data was missing an image field. This omission was preventing the frontend from accessing and displaying images retrieved from the backend.
   2. I realized that the images returned from the backend were encoded in base64, and that the frontend needed to properly decode these images to display them in the UI. This required both updating the TypeScript types and implementing base64 decoding logic in the React components. Additionally, in the blob storage service, image data had to be stored using a buffer to be efficient.
   3. To address these issues efficiently, I prompted Windsurf GPT-4.1 for help. The AI assisted me in:
      - Updating the TypeScript type definitions to include the image field.
      - Writing the logic to decode base64 image data and render it as an image element in React.
      - Debugging integration issues between the backend (Cloudflare blob storage) and the frontend display.
      - Decoding color/black-white data into a parsable format
   4. Using Windsurf GPT-4.1 made it much faster to identify and resolve the missing type and decoding logic, compared to searching for solutions manually. The AI provided clear code suggestions and explanations that I could adapt directly into the codebase.
 
* Krishna and Howie used Grok to safely copy a private key for our database safely into the repository for the automation to run.

	1. Going into using Grok, we expected it would give us a possible solution to copying in the private key. We could not simply commit it from our local drives to the repo, but it was needed for our backend functions to run.
	2. Using placeholder names for our files, we directly gave it the issue and asked how to safely transfer the key into the repo to run.
	3. We were able to successfully run the automation with the strategy given. Now there’s only one part left, to automate deployment!
	4. Our expectations were met, as the solution given ended up working quite well.
