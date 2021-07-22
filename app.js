require("dotenv").config();
require("./config/database").connect();

const express = require("express");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

const User = require("./model/user");
const auth = require("./middleware/auth");

app.use(express.json());

app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

app.post("/register", async (req, res) => {
  // Our register logic starts here
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user

    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

// Login route

app.post("/login", async (req, res) => {
  // logic starts here

  try {
    const { email, password } = req.body;

    // validate user input

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    // validate user if exist in our database

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // create token

      const token1 = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token1;

      // returning user

      // const { password, token, ...info } = user._doc;

      // user
      res.status(200).json(user);
    }
    res.status(400).json("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
