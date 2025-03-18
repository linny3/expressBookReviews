const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is  not found, otherwise return false
    if (userswithsamename.length > 0) {
        return false;    
    } else {
        return true;
    }
}

const authenticatedUser = (username,password)=>{ 
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise fals
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({message: "Error loggin in"});
  }

  // Authenicate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: 60 * 60 });

    //store access token and username in session
    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).send("User succesfully logged in");
   } else {
    return res.status(208).json({message: "Invalid Login. Check username and password" });
   } 
});

regd_users.use("/auth", function auth(req, res, next) {
    // Check if user is logged in and has valid access token
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if(!err) {
                req.user = user;
                next(); // Proceed to the next middleware
            } else {
                return res.status(403).json({message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({message: "User not logged in" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const review = req.body.review;
    const isbn = req.params.isbn;
    books[isbn].reviews[req.session.authorization.username] = review;
    res.send(books[isbn].reviews)
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn
    delete books[isbn].reviews[req.session.authorization.username]
    res.send(books[isbn].reviews)
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
