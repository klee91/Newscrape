var commentId;
// Whenever someone clicks a p tag
$(document).on("click", ".article", function() {
  // Empty the notes from the note section
  $("#commentSpan").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    .done(function(data) {
      console.log(JSON.stringify(data));

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
            //----------------------------------------------------------------------------------------------------
            //fill out----------------------------------------------------------------------------------------------------
            //----------------------------------------------------------------------------------------------------
            // name.html()
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
    });
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
      // Empty the notes section
      $("#commentSpan").empty();
    });

  $("#commentInput").val("");
});

$(document).on("click", ".closeX", function(e) {
  e.preventDefault();
  commentId = $(this).attr('data-id');

  console.log(commentId);
});

$(document).on('click', "#deleteConfirm", function(e) {
  e.preventDefault();
  console.log("confirm loc: " + commentId);
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