function onPreSave(request, response, modules) {
	// Get References to Kinvey Business Logic Modules
	var collectionAccess = modules.collectionAccess;
	var logger = modules.logger;

	// Pull Information from the Request
	var currentBid = request.body;
	var itemId = collectionAccess.objectID(currentBid.itemId);

	// Setup our State Variables
	var item = null;
	var allWinningBids = {};

	collectionAccess.collection('items').findOne({ "_id": itemId }, function(error, theItem) {
		if(error) {
			logger.info("ERROR Fetching Item");
			callback(error);
		} else {
			item = theItem;

			var date = Date.now();
			var errorVal = "";
			var minIncrement = parseInt(item.priceIncrement);
			if(!minIncrement) {
				minIncrement = 1;
			}
			var minBid = parseInt(item.currentPrice) + minIncrement;

			if(date < Date.parse(item.opentime)) {
				// Make sure bidding on this item has begun.
				errorVal = "Bidding for this item has not yet begun.";
			} else if(date > Date.parse(item.closetime)) {
				// Make sure bidding on this item has not ended.
				errorVal = "Bidding for this item has ended.";
			} else if(parseInt(currentBid.amt) < parseInt(item.price)) {
				// Make sure the bid isn't below the starting price.
				errorVal = "Your bid needs to be higher than the item's starting price.";
			} else if(parseInt(currentBid.amt) < minBid) {
				// Make sure the bid increments by at least the minimum increment
				errorVal = "You need to raise the current price by at least $" + minIncrement;
			} else if(parseInt(currentBid.amt) > 99999) {
				// Sanity check. Testing revealed that people love bidding one trillion dollars.
				errorVal = "Remind me to apply for your job.";
			}

			if(errorVal !== "") {
				logger.info(errorVal);
				callback(errorVal);
				return;
			}

			collectionAccess.collection('bids').find({ "itemId": currentBid.itemId }, {sort: {"amt": -1, "lmt": 1}, limit: 1000}, function(error, bids) {
				if(error) {
					logger.info("ERROR Fetching Bids");
					callback(error);
					return;
				} else {
					allWinningBids = bids;

					var totalBids = allWinningBids.length + 1;
					var quantity = parseInt(item.qty);
					var currentPrice = [];
					var currentWinners = [];
					var previousWinners = item.currentWinners;

					var allBidders = item.allBidders;
					if(!allBidders) {
						allBidders = [];
					}

					// Build an object mapping email addresses to their highest bids.
					var bidsForEmails = {};
					allWinningBids.forEach(function(bid) {
						var curBid = bidsForEmails[bid.email];
						if(curBid) {
							bidsForEmails[bid.email] = (parseInt(curBid.amt) > parseInt(bid.amt) ? curBid : bid);
						} else {
							bidsForEmails[bid.email] = bid;
						}
					});

					// Get this bidder's last bid and make sure the new bid is an increase.
					// If the new bid is higher, remove the old bid.
					var previousMaxBid = bidsForEmails[currentBid.email];
					if(previousMaxBid) {
						if(parseInt(currentBid.amt) <= parseInt(previousMaxBid.amt)) {
							errorVal = "You already bid $" + previousMaxBid.amt + " - you need to raise your bid!";
							logger.info(errorVal);
							callback(errorVal);
							return;
						} else {
							delete bidsForEmails[currentBid.email];
						}
					}

					// Build an array of all the winning bids.
					allWinningBids = [];
					for(var key in bidsForEmails) {
						allWinningBids.push(bidsForEmails[key]);
					}

					// Add the new bid and sort by amount, secondarily sorting by time.
					allWinningBids.push(currentBid);
					allWinningBids = allWinningBids.sort(function(a, b) {
						var keyA = a.amt;
						var keyB = b.amt;

						// Sort on amount if they're different.
						if(keyA < keyB) {
							return 1;
						} else if(keyA > keyB) {
							return -1;
						}

						var dateKeyA = a.lmt;
						var dateKeyB = b.lmt;

						// Secondarily sort on time if the amounts are the same.
						if(dateKeyA < dateKeyB) {
							return 1;
						} else if(dateKeyA > dateKeyB) {
							return -1;
						}

						return 0;
					});

					// Slice off either the top n bids (for an item where the highest n bids win)
					// or all of them if there are fewer than n bids.
					var endIndex = 0;
					if(quantity > allWinningBids.length) {
						endIndex = allWinningBids.length;
					} else {
						endIndex = quantity;
					}

					var newBidIsWinning = false;
					var currentWinningBids = allWinningBids.slice(0, endIndex);

					// If the new bid is in the list of winning bids...
					if(currentWinningBids.indexOf(currentBid) != -1) {
						newBidIsWinning = true;

						// Update the item's current price and current winners.
						for(var i=0; (i<currentWinningBids.length); i++) {
							var bid = currentWinningBids[i];
							currentPrice.push(bid.amt);
							currentWinners.push(bid.email);
						}

						// Add this bidder to the list of all bidders...
						allBidders.push(currentBid.email);

						// ...and remove them if they're already there.
						var uniqueArray = allBidders.filter(function(elem, pos) {
							return allBidders.indexOf(elem) == pos;
						});

						collectionAccess.collection('items').findAndModify({ "_id": itemId }, { "_id": 1 }, { $set: { "numberOfBids" : totalBids, "allBidders" : uniqueArray, "currentPrice": currentPrice, "currentWinners": currentWinners, "previousWinners": previousWinners } }, { new: true }, function(error, newItem) {
							if(error) {
								logger.error("Could Not Fetch Item from ID: " + itemId);
//								response.error("Something went wrong - try again?");
								callback(error);
								return;
							} else {
								response.continue();
							}
						});
					} else {
						// If it's not, someone else probably outbid you in the meantime.
						errorVal = "Looks like you've been outbid! Check the new price and try again.";
						logger.info(errorVal);
						callback(errorVal);
						return;
					}
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