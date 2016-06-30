
/*
 * This code runs from the console window and can read specific lists (filtered)
 * and group the cards by the labels, and provide URL + users for each card.
 * This is used to create the Sprint summary card for one or more lists in a board.
 *
 * To create a set of checklists from the output of this code follow steps:
 * a) Edit listTitle and enter the lists whose cards you want summarized.
 * b) Copy code, go to trello board to your lists, open Javascript console.
 * c) Paste the code. (This will start executing and print a JSON result)
 * d) Save the results. Results are grouped by labels.
 * e) Create a new checklist on trello and paste the contents of just the array for a given label
 * 	  Yes, you are pasting all the card info as one checklist, and you are up for some magic :)
 *
 * @TODO: Create the label wise group without  double quotes and comma.
 * @TODO: Investigate potential option of invoking an API to create the checklist from JS console
 *        without a manual step.
 *
 * @author Keerthi Singri 
 */
var kConfig = {
	listTitle: ['UDPv2 - Milestone 3', 'UDPv2 Completed'],
	// labelGroup: ['Control', 'Data', 'Transport'],
	labelCardMap: {},	// This is where the computed data will be stored.

	// Helper functions.
	matches: function(obj, a) {
		if (!$.isArray(a)) {
			return a.toLowerCase() === obj.toLowerCase();
		}
	    for (var i = 0; i < a.length; i++) {
	        if (a[i].toLowerCase() === obj.toLowerCase()) {
	            return true;
	        }
	    }
	    return false;
	},

	addToLabelCardMap: function(title, uri, userArray) {
		// console.log(title + ' - ' + uri + ' ' + userArray); 
		if (kConfig.labelCardMap[title] === undefined) {
			kConfig.labelCardMap[title] = [];
		}
		// var cartName = uri.substring(uri.lastIndexOf('/'), uri.length);
		uri = uri.substring(0, uri.lastIndexOf('/'));
		var userFormatted = ($.isArray(userArray) && userArray.length > 0)? ' [' + userArray + ']' : '';
		// Add uri to passed in label.
		kConfig.labelCardMap[title].push('https://trello.com' + uri + userFormatted);
	},

	computeLabelCardMap: function() {
		console.log('Looking for a matching list title: ' + kConfig.listTitle + ', ...');
		$('.js-list h2').each(function() {
			// console.log($(this).text());
			if (kConfig.matches($(this).text().toLowerCase(), kConfig.listTitle)) {
				console.log('Found matching list: ' + kConfig.listTitle + ', reading cards ...');
				$(this).parents('.js-list').find('.list-card .list-card-details a').each(function() {
					var labels = $(this).siblings('.js-card-labels').find('.card-label');
					var link = $(this).attr('href');
					var users = [];
					//	Populate members with Initials or image.
					$(this).siblings('.js-list-card-members').find('.member-initials, img').each(function() {
						var name = $(this).attr('title');
						users.push(name.substr(0, name.indexOf(' (')));
					});
					// console.log(link, labels.attr('title'));
					if (labels.length != 0) {
						labels.each(function() {
							kConfig.addToLabelCardMap($(this).attr('title'), link, users);
						});
					} else {
						// Add link to ‘undefined’ label.
						kConfig.addToLabelCardMap('undefined', $(this).attr('href'), users);
					}
				});
			}
		});
	},

	displayLabelCardMap: function() {
		console.log(JSON.stringify(kConfig.labelCardMap, null, 4));
	}
};

kConfig.computeLabelCardMap();
// You may not need the timeout, but i am not wasting my time to save you 100ms mister!
setTimeout(kConfig.displayLabelCardMap, 100);

