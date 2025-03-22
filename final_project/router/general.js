const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
   const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (isValid(username)) {
            //Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
  
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null, 4));
  
});
// Get the book list using promises
public_users.get('/books/', function (req,res) {
    // Create promise for getting books
    const get_books = new Promise((resolve, reject) => {
        resolve("Books Found");
    })
    // Call get_books promise
    get_books
    // If resolved 
    .then((message) => {
        console.log(message);
        res.send(JSON.stringify(books, null, 4));
    })
    // If error
    .catch(() => {
        console.log("Books not found");
        return res.status(404).json("Books Not Found");
    })
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn])

 });

 // Get book detail based on ISBN using promises
public_users.get('/books/isbn/:isbn', function (req,res) {
    // Get isbn number
    const isbn = req.params.isbn;
    // New Promise for getting book
    const bookISBN = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve("Book found");
        } else {
            reject("Book not found");
        }
    });
    // Call book promise
    bookISBN
    // If promise successful
    .then((message) => {
        console.log(message);
        res.send(books[isbn]);
    })
    // If promise failed
    .catch((error) => {
        console.log(error);
        res.status(404).json(error);
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let booksbyauthor = [];
    // Get author
    const author = req.params.author;
    // Get keys for books array
    const isbns = Object.keys(books);
    // Iterate through books and get each book for author adding it to booksbyauthor array
    isbns.forEach((isbn) => {
        if(books[isbn].author === author) {
            booksbyauthor.push({"isbn": isbn, "title":books[isbn]["title"], "reviews":books[isbn]["reviews"]});
        }
    });
    res.send(JSON.stringify({booksbyauthor}, null, 4));

});

// Get book detail based on author using promises
public_users.get('/books/author/:author', function(req, res) {
    let authorsBooks = [];
    const booksByAuthor = new Promise((resolve,reject) => {
        
        // Get author
        const author = req.params.author;
        // Get keys for books array
        const isbns = Object.keys(books);
        // Iterate through books and get each book for author adding it to booksByAuthor
        isbns.forEach((isbn) => {
            if(books[isbn].author === author) {
                authorsBooks.push({"isbn":isbn, "title":books[isbn]["title"], "review":books[isbn]["review"]});
            }
        });
        // If books found for author resolve promise else reject promise
        if (authorsBooks.length > 0) {
            resolve("Books by author found");
        } else {
            reject("No books found for author");
        }
    });

    booksByAuthor
    // if books were found
    .then((message) => {
        console.log(message);
        res.send(JSON.stringify({authorsBooks}, null, 4));
    })
    // if books weren't found
    .catch((error) => {
        console.log(error);
        res.status(404).json(error)

    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    // Get book title
    const title = req.params.title;
    // Get keys for books array
    const isbns = Object.keys(books);
    // Iterate through books and get title of the requested book and list book
    isbns.forEach((isbn) => {
        if(books[isbn].title === title) {
            res.send(books[isbn])
        }
    })
});

// Get all books based on title using promises
public_users.get('/books/title/:title', function (req,res) {
    // Get book title
    let title = req.params.title;
    // Get keys for books array
    const isbns = Object.keys(books);
    // Create books by title promise
    const booksByTitle = new Promise((resolve, reject) => {
        // Iterate through books and get title of the requested book and list book
        isbns.forEach((isbn) => {
            if(books[isbn].title === title) {
                resolve("Book found")
                title = books[isbn]
            } else {
                reject("No books under that title")
            };
        });
    });
    
    booksByTitle
    // If promise resolved
    .then((message) => {
        console.log(message);
        res.send(title);
    })
    // If promise not resolved
    .catch((error) => {
        console.log(error);
        res.status(404).json(error);
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    // Get book isbn
    const isbn = req.params.isbn;
    res.send(books[isbn].reviews)
});

module.exports.general = public_users;
