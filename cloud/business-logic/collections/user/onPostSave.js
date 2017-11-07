function onPostSave(request, response, modules) {
	// Get References to Kinvey Business Logic Modules
	var push = modules.push;
	var email = modules.email;
	var collectionAccess = modules.collectionAccess;
	var logger = modules.logger;
	var _ = modules.lodash; // Get lodash reference

	logger.info(request.body);

	// Pull Information from the Request
	var currentUser = request.body.username;

	collectionAccess.collection('user').findOne({username: currentUser}, function(error, theUser)
	{
		if(error) {
			logger.info("ERROR Finding User");
			callback(error.message);
		} else {
			user = theUser;
			user.sort_last = _.toLower(user.last_name);
			user.sort_first = _.toLower(user.first_name);

			if(user.bidderNumber) {
//				logger.info("Existing user has bidder number assigned:");

				if(user.username != user.bidderNumber) {
					logger.info(user.username + " != " + user.bidderNumber);
					user.username = user.bidderNumber;
					collectionAccess.collection('user').save(user, function(err) {
						var bidnummsg = "Your bidder number has been assigned. You are bidder number " + user.bidderNumber + ". You may now bid on items in the app.";
						if(err) {
							logger.info(err);
						}
						logger.info(bidnummsg);

						var androidPayload = {
							alert: bidnummsg,
							sound: "default"
						};

						var pushData = {
							aps: {
								alert: bidnummsg,
								sound: "notification.wav"
							},
							extras: {
								bidText: bidnummsg,
								amt: "0",
								email: ""
							}
						};
						push.sendPayload(theUser, pushData.aps, pushData.extras, androidPayload);
						email.send("Auction App <auctionapp@example.com>", user.email, "Your Bidder Number has been assigned", bidnummsg, "Auction App <auctionapp@example.com>");

						response.continue();
					});
				} else {
					logger.info(user.username + " == " + user.bidderNumber);
				}
			} else {
				logger.info("New user needs bidder number assigned:" + user.username);
				email.send("Auction App <auctionapp@example.com>", "auction-admin@example.com", "New Spring Fling app user", "New User ("+user.first_name+" "+user.last_name+") needs bidder number assigned: " + user.email, "Auction App <auctionapp@example.com>");

				collectionAccess.collection('user').save(user, function(err) {
					if(err) {
						logger.info(err);
					}
					response.continue();
				});
			}

			response.complete(200);
		}
	});

	var callback = function(errormsg) {
		if(errormsg) {
			response.body = {
				error: errormsg
			};
			response.error(400);
		}
	};
}