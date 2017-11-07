function onPreSave(request, response, modules) {
	// Get References to Kinvey Business Logic Modules
	var email = modules.email;
	var collectionAccess = modules.collectionAccess;
	var logger = modules.logger;
	var _ = modules.lodash; // Get lodash reference

	if(request.body.setBidNum) {
		if(request.body.bidderNumber) {
			// Pull Information from the Request
			var bidnum = (request.body.bidderNumber == '0') ? '' : request.body.bidderNumber;
			var userId = collectionAccess.objectID(request.entityId);

			logger.info(request.body);
			collectionAccess.collection('user').findOne({ "_id": userId }, function(error, theUser) {
				if(error) {
					logger.info("ERROR Finding User");
					callback(error.message);
				} else {
					user = theUser;
					user.bidderNumber = bidnum;
					user.sort_last = _.toLower(user.last_name);
					user.sort_first = _.toLower(user.first_name);
					if(bidnum === '') {
						user.username = user.email;
					}
					request.body = user;
					collectionAccess.collection('user').save(user, function(err) {
						if(err) {
							logger.info(err);
							callback(err.message);
						}
					});
				}
			});
		}
		response.continue();
	} else {
		// Pull Information from the Request
		var newEmail = request.body.email;

		logger.info(request.body);
		collectionAccess.collection('user').findOne({ "email": newEmail }, function(error, theUser) {
			if(error) {
				logger.info("ERROR: " + error.message);
				callback(error.message);
				return;
			} else if(theUser === null) {
				response.continue();
			} else {
				logger.info("Duplicate Email: " + newEmail);
				response.error("Duplicate Email: " + newEmail);
			}
		});
	}

	var callback = function(errormsg) {
		if(errormsg) {
			response.body = {
				error: errormsg
			};
			response.error(400);
		}
	};
}