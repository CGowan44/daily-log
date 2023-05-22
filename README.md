# daily-log
A daily log website made to store posts per user.
This website uses mongodb to allow users to login and see their individual set of posts.
It has basic CRUD functionality with the ability to compose posts, read them, edit them, and delete them.
Bcrypt is used for password encryption.

There are comments in app.js that indicate where code can be adjusted to function locally.
In the current state, the app is running on render with mongodb atlas here:
https://daily-log.onrender.com

<- It should be noted that this app uses very basic authentication methods for users and is therefore not very secure in the grand scheme of things. ->

The current to do list is:
* Clean up/remove unused packages
* Styling Updates
* Improve mobile experience
* Use newer version of Bootstrap
* General code cleanup/optimization
* Improve Security
