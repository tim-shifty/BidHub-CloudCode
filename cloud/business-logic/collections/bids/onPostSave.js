// Utility to get items unique to either array.
Array.prototype.diff = function(a) {
	return this.filter(function(i) {return a.indexOf(i) < 0;});
};

function onPostSave(request, response, modules) {
	// Get References to Kinvey Business Logic Modules
	var push = modules.push;
	var collectionAccess = modules.collectionAccess;
	var logger = modules.logger;

	// Pull Information from the Request
	var currentBid = request.body;
	var itemId = collectionAccess.objectID(currentBid.itemId);

	var item = null;

	collectionAccess.collection('items').findOne({ "_id": itemId }, function(error, theItem) {
		if(error) {
			logger.info("ERROR Fetching Item");
			callback(error.message);
		} else {
			item = theItem;

			var previousWinners = item.previousWinners;

			// For multi-quantity items, don't bother the people "higher" than you
			// ex: don't send a push to the person with the #1 bid if someone overtakes the #2 person.
			var index = previousWinners.indexOf(currentBid.email);
			if(index > -1) {
				previousWinners.splice(index, 1);
			}	

			collectionAccess.collection('user').find({ "email": {$in: previousWinners.diff(item.currentWinners)} }, function(error, theUsers) {
				if(error) {
					logger.info("ERROR Fetching Item");
					callback(error.message);
				} else {
					// Refer to bidders by their Bidder Number
					var identity = "Bidder " + currentBid.bidderNumber;

					var androidPayload = {
						email: identity,
						itemname: item.name,
						personname: identity,
						itemid: item._id,
						amt: currentBid.amt,
					};

					var pushData = {
						aps: {
							alert: identity + " bid $" + currentBid.amt + " on " + item.name + ". Surely you won't stand for this.", // People like sassy apps.
							sound: "notification.wav"
						},
						extras: {
							bidText: identity + " bid $" + currentBid.amt + " on " + item.name + ". Surely you won't stand for this.", // People like sassy apps.
							email: currentBid.email
						}
					};

					push.sendPayload(theUsers, pushData.aps, pushData.extras, androidPayload);
					response.complete(200);
				}
			});
		}
	});

	var callback = function(errormsg) {
		if(errormsg) {
			response.body = {
				error: errormsg
			};
			response.complete(400);
		}
	};
}