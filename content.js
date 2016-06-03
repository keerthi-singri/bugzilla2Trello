$(document).ready(function() {
    var newButton = $('<input/>').attr({
        type: "button",
        id: "addToTrello",
        href: "#addToTrello_link",
        value: '+Trello',
    });


    $('#bugState').append(newButton);
    $('#bugState').append('<div id="dialogHolder">Some text</div>');
    $('#addToTrello').css({"float": "right"});
    $('#dialogHolder').dialog({
       title: "Test",
       autoOpen: false,
       modal: false,
       draggable: true,
       position: { my: 'center', at: 'center', of: window },
       width: 500,
       height: 300,
       dialogClass: 'no-close success-dialog',
       buttons: [
         {
           text: 'Trello Login',
           click: function() {
             Trello.authorize({
                type: "popup",
                name: "Bugzilla2Trello",
                scope: {
                  read: true,
                  write: true
                },
                expiration: "never",
                success: authenticationSuccess,
                error: authenticationFailure
             });
           }
         },
         {
           text: 'Convert to Trello',
           click: function() {
             createTrelloCard(this);
           }
         },
         {
           text: 'Cancel',
           click: function(event) {
             $(this).dialog("close");
           }
         }
       ],
       open: function(event, ui) {
         //hide close button.
        $(this).children('.ui-dialog-buttonpane').hide();
      }
    });

    var dialog = $('#dialogHolder');


    $('#addToTrello').bind('click', function() {
      console.log("bind on click newButto )");
      $('#dialogHolder').dialog('open');
    });
});

var authenticationSuccess = function() {
  console.log('Successful authentication');
};

var authenticationFailure = function() {
  console.log('Failed authentication');
};

function createTrelloCard( dialog ) {
  $(dialog).dialog("close");
};
