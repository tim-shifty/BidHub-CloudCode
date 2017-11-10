# BidHub Cloud Code Backend
Backend code for HubSpot's open-source silent auction app, forked to be used with Kinvey. For an overview of the original auction app project, [check out the blog post about it](http://dev.hubspot.com/blog/building-an-auction-app-in-a-weekend)!

The [iOS](https://github.com/ncauldwell/BidHub-iOS/tree/kinvey-backend) and [Android](https://github.com/ncauldwell/BidHub-Android/tree/kinvey-backend) auction apps are backed by [Kinvey](https://www.kinvey.com/). Kinvey handles the database, and also allows you to add server-side logic that occurs when an action is taken (such as a client posting a new bid). This repository contains all of that server-side logic, as well as this helpful README that'll get you set up with Kinvey.

## Getting Started

1. [Sign up for Kinvey](https://console.kinvey.com/signup).
2. Create a New App in your Kinvey console.
3. In your new kinvey app, create 2 new collections: `items` and `bids`.
4. [Install the Kinvey Business Logic CLI](https://devcenter.kinvey.com/ios/bl-cli-downloads).
5. `git clone` this repository.
6. From the BidHub-CloudCode/cloud directory, run `kinvey-bl init` and follow the instructions to authenticate and connect to the kinvey app you created above.
7. In the same directory, run `kinvey-bl deploy`.

## Initializing the Database
The `kinvey-bl deploy` command pushed the code from the *business-logic/* folders to Kinvey. You can see it in your Kinvey console by going to Business Logic > Collection Hooks. There are 4 hooks that were uploaded, `onPreSave()` and `onPostSave()` for both the `bids` and `users` collections. The hooks for the `bids` collection contain all of the logic that runs before and after a NewBid is saved and are run automatically by Kinvey. The `users` hooks are used in conjunction with the bidder number that is assigned to users. See more about that in the client app code.

Also uploaded was a single Endpoint, *InitializeForAuction*, which will add 1 test item to your items collection.

To run the Endpoint, go to Business Logic > Custom Endpoints and edit the *InitializeForAuction* endpoint.
If you'd like to change any of the properties of the Test Item, do so in the code before running it. Specifically, if you hope to bid on this test item you'll want to change the *opentime* and *closetime* values.
Click the Testing button, then click Send Request.

Now, if you go to the items collection, you should see the test object that was just inserted.

## Adding Items
Now that all the item columns are set up, you can add more items by clicking + Add Row while viewing the items collection.

## Data Models
That's it! You're all set up, and you can go play with the [iOS](https://github.com/ncauldwell/BidHub-iOS/tree/kinvey-backend) and [Android](https://github.com/ncauldwell/BidHub-Android/tree/kinvey-backend) apps now. You can also grab the [Web Panel](https://github.com/ncauldwell/BidHub-WebAdmin/tree/kinvey-backend) to keep an eye on the auction. If you're interested in the data models, read on for a short description.

### item

Represents a thing or service for sale. 

 * `allBidders` email addresses of everyone who has bid on this item
 * `closetime` after this time, bidding is closed
 * `currentPrice` current highest bid on this item (if qty > 1 and qty == n, highest n bids)
 * `currentWinners` email address of the current winner of this item (or n winners if qty > 1)
 * `description` long-form description of this item
 * `donorname` name of donor
 * `name` short(ish) name for this item
 * `numberOfBids` total number of bids for this item
 * `opentime` before this time, bidding is closed
 * `previousWinners` email address(es) of who was winning this item before the latest bid. Used by the server-side logic to send pushes only to people who are no longer winning an item.
 * `price` bids start at or above this price
 * `priceIncrement` bids must be incremented by at least this amount
 * `qty` how many of this item is available. For example, if 3 are available, the highest 3 bidders win.
 * `imageurl` URL of the image of this item
 * `donorurl` URL of the image of the donor, or donor's logo

### bid
Represents a single bid on an item. 

 * `amt` total dollar amount of bid
 * `email` Bidder's email
 * `itemId` kinvey _id of item this bid is for
 * `name` Bidder's name
 * `bidderNumber` Bidder's bidder number
