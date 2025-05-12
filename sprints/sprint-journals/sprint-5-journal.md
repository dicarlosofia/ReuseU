# Sprint 5 Journal 

## (1) Adoption Plan (Preamble)
*Date written: 4/29/2025*

#### Is ReuseU ready for adoption?

- As of now, our product has a lot of performance issues that are not ideal for user deployment. As of our last demo `(demo 2)`, ReuseU takes around 30 seconds to load images (and the rest of the listings as a result). This is because we had to cut some corners since we are underfunded. The website as of now works somewhat locally, but we have yet to deploy it fully to a public server. So we will continue to keep developing our product for now. If we deploy ReuseU, it will most likely be is everything falls into place at the end. 
  - RISKS/BENEFITS:
    1. **Load Times** (Risk): Our product takes a long time to load when it comes to industry-standard runtimes. 
    2. **Base 64 Compression Use** (Risk): Base 64 as a practice will be always be a slower option for compression purposes. It adds more work on our servers.
    3. **Chats do not update in realtime** (Risk): This is something that is still in development, and as of now our chats function on the frontend does not work at all. It is only implemented on the backend however. 
    4. **ReuseU is not connected to the internet** (Risk): Right now, our Vercel deployment tests are mostly failing. We will need to have this fixed before we can deploy our site. 
    5. **This site would be dropping right when Grinnell needs it** (Benefit): If we get this website into its final version on time, then it could be used for move-out day (it's intended purpose) this year. It would be a fantastically quick turnaround. 

3: Continued development plan (if not ready for adoption)

  - *Will your product be ready for adoption after some future work? Why or why not?* 
    - Yes! Our product is on the cusp, for the lack of a better word. There a lot of things that are working well, like our listings functionality, but the performance issues are something that we would mainly have to tackle before we would be comfortable deploying it. We would also need to fix our chats functionality (make it work on the frontend and not just on the backend). 

### (1) Adoption Plan (Epilogue)

*Date written: 5/12/2025*

*What we did to carry out our plan, and the outcomes:* 

#### How we implemented our plan:
- All of the issues that I addressed above have been resolved. We are much closer to deployment now, and all we need to do now is make sure that images work now on our [working website url](https://reuse-u-ruddy.vercel.app/). We addressed one risk at a time, talking out each one as we went. We are very close to deployment now, and plan to have it completed after the semester is over to have a complete project for our coding portfolios.

## (3) Bug Logging
FOR COMPLETING THIS PART, SOFIA PUT THE INSTRUCTIONS IN [THIS ISSUE](https://github.com/dicarlosofia/ReuseU/issues/155)

<!--- (ADD LINKS BELOW) -->

* [BUG 1: Profile Page Not Loading](https://github.com/dicarlosofia/ReuseU/issues/163)
* [BUG 2: Delete_message function serves its purpose, but still returns an error](https://github.com/dicarlosofia/ReuseU/issues/166)
* [BUG 3: No Reset Password](https://github.com/dicarlosofia/ReuseU/issues/162) 



## (4) License
We have chosen the following license: **GNU General Public License v3.0**
* Navigation to it in our Repo: `ReuseU/LICENSE`

## (5) Wrap-up work
<!---
Make your repository presentable to future audiences.

Potential future audiences may include:

 - future 324 students looking for inspiration for their project proposals
 - prospective employers looking at your github
 - prospective users looking to get started with your product

Consider the following tasks to make it presentable

 - code cleanup
 - final documentation

Add a section to your Sprint Journal describing what you did.

--->
* **Sofia**: I commented my code before I submitted it for review with my teammates, so I went through and refined the README.md file to have better navigation.

## (7) Blog Post
<!--- PASTE THE BLOG POST BELOW: --->
