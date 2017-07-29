Just run npm install and npm start. Created by cloning the start pack.

Although the JS directives said to use filename.js I didn't change the already existing file names as it could affect automated tests.

All the required features were implemented along with a few others:

*  1 - When a shelf of a book is updated the update request is sent to the server and the client imediattly does the change on the UI, if for some reason (i.e: no network connection) the server side update fails the client rollbacks the changes.
*  2 - Shareable search link. When a user does a search the URL is updated to allow sharing the page address.
*  3 - The BookApp isn't restricted to the 3 existing shelves, the server can return others and the Appp will behave correctly.
