
// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var mongoose = require("mongoose");

var app = express();
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Requiring our Note and Article models
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Use morgan and body parser with our app
// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Make public a static dir
app.use(express.static("./public"));

// Database configuration with mongoose
//heroku link: mongodb://heroku_6g70dlvh:Kevlee91@ds147681.mlab.com:47681/heroku_6g70dlvh
mongoose.connect("mongodb://localhost/newscraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes
// ======
app.get("/", function(req, res) {
    var hbsObject;

  request("http://www.kotaku.com/", function(error, response, html) {
    var $ = cheerio.load(html);

    $("h1.headline.entry-title").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      })

    });
  });
    Article.find({}).limit(25).exec( function(error, doc) {
        if (error) {
            console.log(error);
        }
        hbsObject = {
            articles: doc
        }
        res.render("index", hbsObject)
    });
    
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.find({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("comments")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


// Create a new comment
app.post("/articles/:id", function(req, res) {
  // Create a new comment and pass the req.body to the entry
  var newComment = new Comment(req.body);

  // And save the new comment to the db
  newComment.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's comment
      Article.findOneAndUpdate({"_id": req.params.id }, { $push: { "comments": doc._id }} , {new: true})
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});

//delete comment route
app.delete("/articles/:id", function(req,res) {
    Comment.remove({"_id" : req.params.id}, function(err, doc) {
        if (err) {
          console.log(err)
        } else {
          res.send(doc);
        }
    })
})

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
