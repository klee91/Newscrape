//Require Mongoose
var mongoose = require('mongoose');
//Create Schema class
var Schema = mongoose.Schema;

//Create article schema
var ArticleSchema = new Schema ({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    comments : [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
})

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;