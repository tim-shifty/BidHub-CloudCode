# BidHub Cloud Code Backend
Backend code for HubSpot's open-source silent auction app. For an overview of the auction app project, [check out our blog post about it](http://dev.hubspot.com/blog/building-an-auction-app-in-a-weekend)!

The [iOS](https://github.com/HubSpot/BidHub-iOS) and [Android](https://github.com/HubSpot/BidHub-Android) auction apps are backed by [Parse](https://parse.com/), a popular and free backend-as-a-service. Parse handles the database, and also allows you to add server-side logic that occurs when an action is taken (such as a client posting a new bid). This repository contains all of that server-side logic, as well as this helpful README that'll get you set up with Parse.

## Getting Started

1. [Sign up for Back4App](https://www.back4app.com/).
2. `git clone` this repository and edit *.parse.local* to include your app's name and application ID (you can find these in Back4App by going to Dashboard > App Settings > Security & Keys).
3. [Install the Back4App Command Line Tool](https://www.back4app.com/docs/command-line-tool/parse-server-setup).
4. Run `b4a configure accountkey` and follow the instructions.
5. From the BidHub-CloudCode directory, run `b4a deploy`.

## Initializing the Database
The `b4a deploy` command pushed *cloud/main.js* to Parse. You can see it in Back4App by going to Server Settings > Cloud Code Settings. The first two functions contain all of the logic that runs before and after a Bid is saved, and are run automatically by Parse. The third, *InitializeForAuction*, is a manual function that will set up your Item and Bid tables with the correct columns. 

To run the *InitializeForAuction* function, get your App ID and REST API key from Core > Server Settings > Core Settings and run the following:

curl -X POST \
 -H "X-Parse-Application-Id: <your App Id>" \
 -H "X-Parse-REST-API-Key: <your REST API key>" \
 -H "Content-Type: application/json" \
 -d "{}" \
 https://parseapi.back4app.com/functions/InitializeForAuction

Now, if you go to Data (on the left), you should see the Item and Bid tables. Item will be populated with a Test Object, and both will have a number of auction-related columns.

![Item and Bid](http://i.imgur.com/2qFxj7jm.png)

## Adding Items
The easiest way to add an item is directly from Parse. Go to Core > Data > Item and add either a single item via the +Row button or many items via a CSV import.

## Data Models
That's it! You're all set up, and you can go play with the [iOS](https://github.com/HubSpot/BidHub-iOS) and [Android](https://github.com/HubSpot/BidHub-Android) apps now. You can also grab the [Web Panel](https://github.com/HubSpot/BidHub-WebAdmin) to keep an eye on the auction. If you're interested in the data models, read on for a short description.

### Item

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
 * `qty` how many of this item is available. For example, if 3 are available, the highest 3 bidders win.

### Bid
Represents a single bid on an item. 

 * `amt` total dollar amount of bid
 * `email` Bidder's email (unique ID)
 * `item` objectId of item this bid is for
 * `name` Bidder's name
