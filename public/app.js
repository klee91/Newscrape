var commentId;

var getComments = function(thisId) {
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  }).done(function(data) {
      // The title of the article
      $("#commentSpan").append("<h2>" + data[0].title + "</h2>");
      
    // If there are comments...
      if (data[0].comments) {
        for (var i = 0; i < data[0].comments.length; i++) {
            var div = $('<div class="comment">');
            var close = $('<div>');
            var closeSpan = $('<span>')
            // var name = $('<h4>');
            var p = $('<p>');
            p.html(data[0].comments[i].body).appendTo(div);

            closeSpan.attr('data-id', data[0].comments[i]._id).attr('data-toggle',"modal").attr('data-target', "#deleteModal")
            .addClass('closeX glyphicon glyphicon-remove').appendTo(close);
            close.addClass('close').appendTo(div);

            div.appendTo('#commentSpan');
        }
      }
      // A textarea to add a new note body
      $("#commentSpan").append("<textarea id='commentInput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#commentSpan").append("<button data-id='" + data[0]._id + "' id='postComment'>Post Comment</button>");
  })
};

$(document).on('click', '#scrapeBtn', function(e) {
  e.preventDefault();

  $.ajax({
    method: "GET",
    url: "/scraped"
  }).done(function(data) {
    console.log(data);
    location.reload();
  })
})

// Whenever someone clicks an article
$(document).on("click", ".article", function() {
  $("#commentSpan").empty();
  var thisId = $(this).attr("data-id");
  //get comments for this article id
  getComments(thisId);
});

// When you click the postcomment button
$(document).on("click", "#postComment", function(e) {
  e.preventDefault();
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  
  // Run a POST request to post comment, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from note textarea
      body: $("#commentInput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      $("#commentSpan").empty();
      getComments(thisId);
    });

  $("#commentInput").val("");
});

//comment X button event
$(document).on("click", ".closeX", function(e) {
  e.preventDefault();
  commentId = $(this).attr('data-id');
});

$(document).on('click', "#deleteConfirm", function(e) {
  e.preventDefault();
  $.ajax({
    method: "DELETE",
    url: "/articles/" + commentId
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#commentSpan").empty();
    });
})