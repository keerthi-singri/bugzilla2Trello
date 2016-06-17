
/*
 * This code runs from the console window and can read specific lists (filtered)
 * and group the cards by the labels, and provide URL + users for each card.
 * This is used to create the Sprint summary card for euc-networking board (initially)
 *
 * @author Keerthi Singri 
 */
var kConfig = {
	listTitle: ['UDPv2 - Milestone 2', 'UDPv2 Completed'],
	// labelGroup: ['Control', 'Data', 'Transport'],
	labelCardMap: {},	// This is where the computed data will be stored.
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
setTimeout(kConfig.displayLabelCardMap, 1000);

