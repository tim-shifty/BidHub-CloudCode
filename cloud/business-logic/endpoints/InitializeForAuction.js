function onRequest(request, response, modules) {
  var logger = modules.logger;
  var collectionAccess = modules.collectionAccess;
  var items = collectionAccess.collection('items');

  var newItem = {name:"Test Object 7", description:"This is a test object, and you (probably) won't be asked to donate your bid on this item to charity. Who knows, though.", donorname:"Generous Donor", price:50, priceIncrement:1, imageurl:"http://i.imgur.com/kCtWFwr.png", qty:"3", currentPrice:[], numberOfBids:0, allBidders:[], currentWinners:[], previousWinners:[], opentime:"2017-10-25T19:00:00-0400", closetime: "2017-10-25T22:00:00-0400"};

  logger.info(newItem);

  items.insert(newItem, function(err, docs) {
		  if (err) {
    		logger.error('Query failed: '+ err);
  		} else {
    		response.body = docs;
    		response.complete(200);
  		}
	});

  response.complete();
}