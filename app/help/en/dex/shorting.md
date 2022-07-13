# Short Selling gpAssets

In order to increase your exposure to GPH and offer liquidity to gpAssets, such
as gpUSD, gpEUR, gpRUB, gpCNY, gpSILVER, gpGOLD etc., you can go *borrow* this gpAsset from the network and
*sell it short*. We will here briefly describe the procedure.

## Borrowing

The Graphene network is capable of issuing any amount of any gpAsset and lend
it out to participants given enough collateral.

 * *settlement price*: The price for 1 GPH as it is traded on external exchanges.
 * *maintenance collateral ratio* (MCR): A ratio defined by the witnesses as minimum required collateral ratio
 * *maximum short squeeze ratio* (MSQR): A ratio defined by the witnesses as to how far shorts are protected against short squeezes
 * *short squeeze protection* (SQP): Defines the most that a margin position will ever be forced to pay to cover 
 * *call price* (CP): The price at which short/borrow positions are margin called

### Margin Call

The Graphene network is capable of margin calling those positions that do not
have enough collateral to back their borrowed gpAssets. A margin call will
occur any time the highest bid is less than the *call price* and greater than
*SQP*.
The margin position will be forced to sell its collateral anytime the highest
offer to buy the collateral is less than the call price (x/GPH).

```
SQP = settlement price / MSQR
call price = DEBT / COLLATERAL * MCR
```

The margin call will take the collateral, buy shares of borrowed gpAsset at
market rates up to the SQP and close the position. The remaining GPH of the
collateral are returned to the customer.

### Settlement

Holders of any gpAsset can request a settlement at a *fair price* at any time.
The settlement closes the borrow/short positions with lowest collateral ratio
and sells the collateral for the settlement.

## Selling

After borrowing gpAssets, they can be sold free at any of the corresponding
markets at any price a buyer is willing to pay. With this step, the
short-selling is now complete and you are short that particular gpAsset.

## Updating Collateral Ratio

At any time, the holder of a borrow/short position can modify the collateral
ratio in order to flexibly adjust to market behavior. If the collateral ratio is
increase, an additional amount of GPH is locked as collateral, while reducing
the collateral ratio will require an amount of the corresponding gpAsset to be
payed back to the network.

## Covering

To close a borrow/short position, one must hold the borrowed amount of that
particular gpAsset to hand it over to the Graphene network. After that, the
gpAssets are reduced from the corresponding supply and the collateral is
released and given back to its owner.
