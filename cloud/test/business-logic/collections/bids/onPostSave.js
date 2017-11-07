// Test suite.
describe('bids: onPostSave', function() {
  // Set the endpoint under test.
  before('configure', function() {
    this.collection = 'bids';
    this.hook = 'onPostSave';
  });

  // Populate the datastore.
  before('populate', function(cb) {
    var data = [
      // JSON objects here.
    ];
    this.client.dataStore.importCollectionData(this.collection, data, true, cb)
  });
  after('populate', function(cb) {
    var query = {
      // MongoDB-style JSON query here.
    };
    this.client.dataStore.removeCollectionData(this.collection, query, cb);
  });

  // Cleanup.
  after('configure', function() {
    delete this.collection;
    delete this.hook;
  });

  // Tests.
  it('should run.', function(done) {
    // Configure the request.
    var requestObject = {
      // Request details here.
    };

    // Run the endpoint.
    this.client.runCollectionHook(this.collection, this.hook, requestObject, { }, function(err, blResult) {

      //
      // Assertions here.
      //

      done(err); // Continue.
    });
  });
});