/*
 * Bugzilla2Trello - https://github.com/knsingri/bugzilla2Trello
 *
 * @author Keerthi Singri (<keerthi_sn@yahoo.com>)
 * @author Qichao Chu (<chuq@vmware.com>>)
 *
 */

// Global namespace
var B2T = B2T || {};

// Util functions, build html structures.
B2T.UTIL = {
    constructDialogHtml: function(dialogHolderId) {
        return  '<div id="holder" class="hide">' +
                    '<div id="' + dialogHolderId + '">' +
                        '<div>Select your trello board & list.</div>' +
                        '<div class="error"></div>' +
                        '<div>Select Board:</div>' +
                        '<select id="boardId"></select>' +
                        '<div>Select List:</div>' +
                            '<select id="listId"></select>' +
                        '<div></div>' +
                    '</div>' +
                    '<div></div>' +// Used for error dialog.
                '</div>';
    },

    constructButton: function(id, name) {
        return $('<input/>').attr({
            type: "button",
            id: id,
            value: name,
            class: 'trello-button'
        });
    }
};

// Dialog managemnet functionality.
B2T.DialogManager = new function() {
    this.dialogHolder = null;

    this.getDialog = function() {
        return this.dialogHolder;
    };

    this.init = function(dialogHolderId) {

        // Load the jqueryID for dialogHolder.
        this.dialogHolder = $('#' + dialogHolderId);

        // Initialize the dialog.
        this.dialogHolder.dialog({
            title: "Create trello card",
            autoOpen: false,
            modal: false,
            draggable: true,
            position: {
                my: 'center',
                at: 'center',
                of: window
            }, // TODO fix location
            width: 500,
            height: 300,
            dialogClass: 'no-close success-dialog', // TODO: Figure out how to remove
            buttons: [{
                text: 'Trello Login',
                click: function() {
                    authorizeTrello();
                }
            }, {
                text: 'Trello Logout',
                click: function(event) {
                    Trello.deauthorize();
                }
            }, {
                text: 'Convert to Trello',
                click: function(event, ui) {
                    createTrelloCard(this);
                }
            }, {
                text: 'Cancel',
                click: function(event) {
                    $(this).dialog("close");
                }
            }],
            open: function(event, ui) {
                //hide close button.
                $(this).children('.ui-dialog-buttonpane').hide();
            }
        });
    };

    this.showErrorDialog = function(errorMsg) {
        this.dialogHolder.next()
            .text(errorMsg)
            .dialog({
                title: "Trello Authentication Error",
                autoOpen: true,
                modal: false,
                draggable: true,
                position: {
                    my: 'center',
                    at: 'center',
                    of: window
                }, // TODO fix location
                width: 500,
                height: 300,
                dialogClass: 'no-close success-dialog', // TODO: Figure out how to remove
                buttons: [{
                    text: 'Give Up',
                    click: function() {
                        $(this).dialog('destroy').remove();
                    }
                }]
            });
    };

    this.getBoards = function() {
        Trello.get("/members/me/boards?filter=open", function(boards) {
            $.each(boards, function(ix, boards) {
                $(new Option(boards.name, boards.id)).appendTo("#boardId");
            });
        });
        $("#boardId").off('change').on('change', this.boardSelected);
        //  Invoke the function since the first board is selected.
        $(this).boardSelected();
    };

    this.boardSelected = function() {
        var board = $('#boardId :selected').val();
        var boardLink = "https://trello.com/board/" + board
        $('#trello-link a').prop('href', boardLink)
        $('#listId').find('option').remove();
        if (board == "Select a board") {
            $('#lists').append('<option>Select a list</option>');
        } else {
            Trello.get("boards/" + board + "/lists", function(lists) {
                $.each(lists, function(ix, lists) {
                    $(new Option(lists.name, lists.id)).appendTo("#listId");
                });
            });
            $("#listId").val($("#listId option:first").val());
        }
    }


}; // End of B2T.DialogManager

var authenticationSuccess = function() {
    console.log('Successful authentication');
    B2T.DialogManager.getDialog().dialog('open');
    B2T.DialogManager.getBoards();
};

var authenticationFailure = function() {
    console.log('Failed authentication');
    B2T.DialogManager.showErrorDialog("Authentication Failed, Please Try Again.")
};

function createTrelloCard(dialog) {
    var bugInfo = getBugInfo();
    Trello.post('cards', {
        name: 'Bug ' + bugInfo.bugNumber + ': ' + bugInfo.desc,
        desc: 'Bug: ' + bugInfo.link + 
              '\nBug Product: ' + bugInfo.product  + ' > '
                                + bugInfo.category + ' > ' 
                                + bugInfo.component +
              '\nAssigned To: ' + bugInfo.assignee + 
              '\nPriority: '    + bugInfo.priority + '\n\n---\n' + bugInfo.comment,
        idList: $('#listId :selected').val(),
    });
    //  Add these to callback and wait for completion, handle error condition.
    console.log('Trello card created for bug: ' + bugInfo.bugNumber);
    $(dialog).dialog("close")
};

//  This info is specific to Bugzilla 3.0.x
// TODO: Abstract this out based on Bugzilla version info.
function getBugInfo() {
    return {
        link:'https://bugzilla.eng.vmware.com' + $('#iconBugReload').attr('href'),
        bugNumber: $('#iconBugReload').attr('href').split('=')[1],
        desc: $('#short_desc').attr('value'),
        assignee: $('#bugPeople .noHide a').attr('href').split('q=')[1],
        priority: $('#priority :selected').text(),
        comment: $('#comment_text_0').text(),
        product: $('#priority :selected').text(),
        category: $('#category :selected').text(),
        component: $('#component :selected').text()
    }
}

function authorizeTrello() {
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

var buttonClicked = function() {
    if (Trello.authorized()) {
        authenticationSuccess();
    } else {
        authorizeTrello();
    }
}

// Invoked upon document load.
$(document).ready(function() {
    var newButton = B2T.UTIL.constructButton("addToTrello", "Bug2Trello").insertAfter('#bugSummary');
    $('#bugSummary').append(B2T.UTIL.constructDialogHtml('dialogManager'));
    B2T.DialogManager.init('dialogManager');

    newButton.on('click', buttonClicked);

});