// Import necessary modules and dependencies
import express from 'express';
import hbs from 'hbs';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { readPosts, readUser, insertUser, insertPosts, likeFun, shareFun, deleteFun } from './oprations.js';

// Create Express app
const app = express();

// Set up Handlebars as the view engine
app.set('view engine', 'hbs');

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

// Route to render the login page
app.get('/', (req, res) => {
  res.render("login");
});

// Route to handle user login
app.post('/login', async (req, res) => {
  try {
    const output = await readUser(req.body.profile);
    const password = output[0].password;

    if (password === req.body.password) {
      const secret = "00add12754fbacb38b0b7af94d74443666cfba738d98ed511f753fbc94ceeb140f8a0e1df993fb0727e6a8bb4cef030c0f6f851dff9";
      const payload = { "profile": output[0].profile, "name": output[0].name, "headline": output[0].headline };
      const token = jwt.sign(payload, secret);

      res.cookie("token", token);
      res.redirect("/posts");
    } else {
      res.send("Incorrect UserName or Password");
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Route to render the posts page
app.get('/posts', verifyLogin, async (req, res) => {
  try {
    const output = await readPosts();
    res.render("posts", {
      data: output,
      userInfo: req.payload
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Route to handle like action
app.post('/like', async (req, res) => {
  try {
    await likeFun(req.body.content);
    res.redirect('/posts');
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Route to handle share action
app.post('/share', async (req, res) => {
  try {
    await shareFun(req.body.content);
    res.redirect('/posts');
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Route to handle delete action
app.post('/delete', async (req, res) => {
  try {
    await deleteFun(req.body.content);
    res.redirect('/posts');
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Route to handle adding new posts
app.post('/addposts', async (req, res) => {
  try {
    await insertPosts(req.body.profile, req.body.content);
    res.redirect("/posts");
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Middleware function to verify login token
function verifyLogin(req, res, next) {
  try {
    const secret = "00add12754fbacb38b0b7af94d74443666cfba738d98ed511f753fbc94ceeb140f8a0e1df993fb0727e6a8bb4cef030c0f6f851dff9";
    const token = req.cookies.token;

    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.payload = payload;
      next();
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

// Route to handle user registration
app.post('/addusers', async (req, res) => {
  try {
    if (req.body.password === req.body.cfnpassword) {
      await insertUser(req.body.name, req.body.profile, req.body.headline, req.body.password, req.body.cfnpassword);
      res.redirect('/');
    } else {
      res.send("Password and confirm password did not match.");
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Route to render the registration page
app.get('/register', (req, res) => {
  res.render("register");
});

// Start the server
app.listen(3000, () => {
  console.log("Server listening on port 3000...");
});
