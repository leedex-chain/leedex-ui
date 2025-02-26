import utils from "./utils";
import {ChainStore, ChainTypes} from "leedexjs";
let {object_type} = ChainTypes;
let opTypes = Object.keys(object_type);
import {Asset} from "./MarketClasses";

let priceCacheTTL = 1000 * 60 * 0.5; // 0.5 minutes
let priceCache = {};

const MarketUtils = {
    order_type(id) {
        if (typeof id !== "string") {
            return false;
        }
        let type = id.split(".")[1];
        return opTypes[type];
    },

    isAsk(order, base) {
        let baseId = base.toJS ? base.get("id") : base.id;

        if (order.sell_price) {
            return order.sell_price.quote.asset_id === baseId;
        } else if (order.call_price) {
            return order.call_price.quote.asset_id === baseId;
        }
    },

    isAskOp(op) {
        return op.amount_to_sell.asset_id !== op.fee.asset_id;
    },

    limitByPrecision(value, asset, floor = true) {
        let assetPrecision = asset.toJS
            ? asset.get("precision")
            : asset.precision;
        let valueString = value.toString();
        let splitString = valueString.split(".");
        if (
            splitString.length === 1 ||
            (splitString.length === 2 &&
                splitString[1].length <= assetPrecision)
        ) {
            return value;
        }
        let precision = utils.get_asset_precision(assetPrecision);
        value = floor
            ? Math.floor(value * precision) / precision
            : Math.round(value * precision) / precision;
        if (isNaN(value) || !isFinite(value)) {
            return 0;
        }
        return value;
    },

    getFeedPrice(some_raw_price, invert = false) {
        let quoteAsset = ChainStore.getAsset(
            some_raw_price.getIn(["quote", "asset_id"])
        );
        let baseAsset = ChainStore.getAsset(
            some_raw_price.getIn(["base", "asset_id"])
        );

        let price = utils.get_asset_price(
            some_raw_price.getIn(["quote", "amount"]),
            quoteAsset,
            some_raw_price.getIn(["base", "amount"]),
            baseAsset
        );

        if (invert) {
            return 1 / price;
        } else {
            return price;
        }
    },

    getFinalPrice(
        coreAsset,
        fromAsset,
        toAsset,
        marketStats,
        real = false,
        forceRefresh = false
    ) {
        if (toAsset.get("id") === fromAsset.get("id")) {
            return 1;
        }

        const {marketName: toMarket} = this.getMarketName(toAsset, coreAsset);
        const {marketName: fromMarket} = this.getMarketName(
            fromAsset,
            coreAsset
        );
        const {marketName: directMarket} = this.getMarketName(
            fromAsset,
            toAsset
        );

        function cacheClearTimer(marketName) {
            setTimeout(function() {
                delete priceCache[marketName];
            }, priceCacheTTL);
        }

        if (priceCache[directMarket] && !forceRefresh) {
            if (real)
                return priceCache[directMarket].toReal(
                    toAsset.get("id") !== priceCache[directMarket].base.asset_id
                );
            return priceCache[directMarket];
        }

        const directStats = marketStats.get(directMarket);
        if (directStats && directStats.price && directStats.volumeBase !== 0) {
            if (real)
                return directStats.price.toReal(
                    toAsset.get("id") !== directStats.price.base.asset_id
                );
            return directStats.price;
        }

        let toPrice, fromPrice;

        const fromStats = marketStats.get(fromMarket);
        if (fromStats && fromStats.price) {
            if (fromStats.volumeBase === 0 && fromStats.volumeQuote === 0)
                return null;
            fromPrice = fromStats.price.clone();
        }
        const toStats = marketStats.get(toMarket);
        if (toStats && toStats.price) {
            toPrice = toStats.price.clone();
        }

        let finalPrice;
        if (toPrice && fromPrice) {
            if (fromPrice.base.amount == 0 || toPrice.base.amount == 0)
                return null;
            finalPrice = toPrice.times(fromPrice);
        } else if (toPrice) {
            finalPrice = toPrice;
        } else if (fromPrice) {
            finalPrice = fromPrice;
        }
        if (!finalPrice) return null;
        const finalId = [finalPrice.base.asset_id, finalPrice.quote.asset_id];
        if (
            finalId.indexOf(toAsset.get("id")) === -1 ||
            finalId.indexOf(fromAsset.get("id")) === -1
        ) {
            return null;
        }

        priceCache[directMarket] = finalPrice;
        cacheClearTimer();
        if (real)
            return finalPrice.toReal(
                toAsset.get("id") !== finalPrice.base.asset_id
            );
        return finalPrice;
    },

    convertValue(
        amount,
        toAsset,
        fromAsset,
        marketStats,
        coreAsset,
        fullPrecision = true
    ) {
        let fromAmount = !fullPrecision
            ? new Asset({
                  real: amount,
                  asset_id: fromAsset.get("id"),
                  precision: fromAsset.get("precision")
              })
            : new Asset({
                  amount,
                  asset_id: fromAsset.get("id"),
                  precision: fromAsset.get("precision")
              });

        if (!toAsset) return;

        let price = this.getFinalPrice(
            coreAsset,
            fromAsset,
            toAsset,
            marketStats,
            false
        );

        if (price === 1) return fromAmount.getAmount({real: !fullPrecision});
        let eqValue =
            price && price.toReal
                ? fromAmount.times(price).getAmount({real: !fullPrecision})
                : null;
        return eqValue;
    },

    parseOrder(order, base, quote, invert = false) {
        let ask = this.isAsk(order, base);

        let quotePrecision = utils.get_asset_precision(
            quote.toJS ? quote.get("precision") : quote.precision
        );
        let basePrecision = utils.get_asset_precision(
            base.toJS ? base.get("precision") : base.precision
        );
        let pricePrecision = order.call_price
            ? quote.toJS
                ? quote.get("precision")
                : quote.precision
            : base.toJS
            ? base.get("precision")
            : base.precision;

        let buy, sell;
        let callPrice;
        if (order.sell_price) {
            buy = ask ? order.sell_price.base : order.sell_price.quote;
            sell = ask ? order.sell_price.quote : order.sell_price.base;
        } else if (order.call_price) {
            buy = order.call_price.base;
            sell = order.call_price.quote;
            let marginPrice =
                buy.amount / basePrecision / (sell.amount / quotePrecision);
            if (!invert) {
                callPrice = marginPrice;
            } else {
                callPrice = 1 / marginPrice;
            }
        }

        if (typeof sell.amount !== "number") {
            sell.amount = parseInt(sell.amount, 10);
        }

        if (typeof buy.amount !== "number") {
            buy.amount = parseInt(buy.amount, 10);
        }
        let fullPrice = callPrice
            ? callPrice
            : sell.amount / basePrecision / (buy.amount / quotePrecision);
        let price = utils.price_to_text(
            fullPrice,
            order.call_price ? base : quote,
            order.call_price ? quote : base
        );

        let amount, value;

        // We need to figure out a better way to set the number of decimals
        // let price_split = utils.format_number(price.full, Math.max(5, pricePrecision)).split(".");
        // price.int = price_split[0];
        // price.dec = price_split[1];

        if (order.debt) {
            if (invert) {
                // Price in USD/BTS, amount should be in BTS, value should be in USD, debt is in USD
                // buy is in USD, sell is in BTS
                // quote is USD, base is BTS
                value = order.debt / quotePrecision;
                amount = this.limitByPrecision(value / price.full, base);
            } else {
                // Price in BTS/USD, amount should be in USD, value should be in BTS, debt is in USD
                // buy is in USD, sell is in BTS
                // quote is USD, base is BTS

                amount = this.limitByPrecision(
                    order.debt / quotePrecision,
                    quote
                );
                value = price.full * amount;
            }
        } else if (!ask) {
            amount = this.limitByPrecision(
                ((buy.amount / sell.amount) * order.for_sale) / quotePrecision,
                quote
            );
            value = order.for_sale / basePrecision;
        } else {
            amount = this.limitByPrecision(
                order.for_sale / quotePrecision,
                quote
            );
            value = price.full * amount;
        }

        value = this.limitByPrecision(value, base);

        if (!ask && order.for_sale) {
            value = this.limitByPrecision(price.full * amount, base);
        }

        return {
            value: value,
            price: price,
            amount: amount
        };
    },

    split_price(price, pricePrecision) {
        // We need to figure out a better way to set the number of decimals
        let price_split = utils
            .format_number(price, Math.max(5, pricePrecision))
            .split(".");
        let int = price_split[0];
        let dec = price_split[1];
        return {int: int, dec: dec};
    },

    // flatten_orderbookchart(array, sumBoolean, inverse, precision) {
    //     inverse = inverse === undefined ? false : inverse;
    //     let orderBookArray = [];
    //     let maxStep, arrayLength = array.length;

    //     // Sum orders at same price
    //     // if (arrayLength > 1) {
    //     //     for (var i = arrayLength - 2; i >= 0; i--) {
    //     //         if (array[i].x === array[i + 1].x) {
    //     //             console.log("found order to sum");
    //     //             array[i].y += array[i + 1].y;
    //     //             array.splice(i + 1, 1);
    //     //         }
    //     //     }
    //     // }
    //     // arrayLength = array.length;

    //     if (inverse) {

    //         if (array && arrayLength) {
    //             arrayLength = arrayLength - 1;
    //             orderBookArray.unshift({
    //                 x: array[arrayLength].x,
    //                 y: array[arrayLength].y
    //             });
    //             if (array.length > 1) {
    //                 for (let i = array.length - 2; i >= 0; i--) {
    //                     // maxStep = Math.min((array[i + 1].x - array[i].x) / 2, 0.1 / precision);
    //                     orderBookArray.unshift({
    //                         x: array[i].x + maxStep,
    //                         y: array[i + 1].y
    //                     });
    //                     if (sumBoolean) {
    //                         array[i].y += array[i + 1].y;
    //                     }
    //                     orderBookArray.unshift({
    //                         x: array[i].x,
    //                         y: array[i].y
    //                     });
    //                 }
    //             } else {
    //                 orderBookArray.unshift({
    //                     x: 0,
    //                     y: array[arrayLength].y
    //                 });
    //             }
    //         }
    //     } else {
    //         if (array && arrayLength) {
    //             orderBookArray.push({
    //                 x: array[0].x,
    //                 y: array[0].y
    //             });
    //             if (array.length > 1) {
    //                 for (let i = 1; i < array.length; i++) {
    //                     // maxStep = Math.min((array[i].x - array[i - 1].x) / 2, 0.1 / precision);
    //                     orderBookArray.push({
    //                         x: array[i].x - maxStep,
    //                         y: array[i - 1].y
    //                     });
    //                     if (sumBoolean) {
    //                         array[i].y += array[i - 1].y;
    //                     }
    //                     orderBookArray.push({
    //                         x: array[i].x,
    //                         y: array[i].y
    //                     });
    //                 }
    //             } else {
    //                 orderBookArray.push({
    //                     x: array[0].x * 1.5,
    //                     y: array[0].y
    //                 });
    //             }
    //         }
    //     }
    //     return orderBookArray;
    // }

    flatten_orderbookchart_highcharts(array, sumBoolean, inverse, precision) {
        inverse = inverse === undefined ? false : inverse;
        let orderBookArray = [];
        let arrayLength;

        if (inverse) {
            if (array && array.length) {
                arrayLength = array.length - 1;
                orderBookArray.unshift([
                    array[arrayLength][0],
                    array[arrayLength][1]
                ]);
                if (array.length > 1) {
                    for (let i = array.length - 2; i >= 0; i--) {
                        if (sumBoolean) {
                            array[i][1] += array[i + 1][1];
                        }
                        orderBookArray.unshift([array[i][0], array[i][1]]);
                    }
                } else {
                    orderBookArray.unshift([0, array[arrayLength][1]]);
                }
            }
        } else {
            if (array && array.length) {
                orderBookArray.push([array[0][0], array[0][1]]);
                if (array.length > 1) {
                    for (var i = 1; i < array.length; i++) {
                        if (sumBoolean) {
                            array[i][1] += array[i - 1][1];
                        }
                        orderBookArray.push([array[i][0], array[i][1]]);
                    }
                } else {
                    orderBookArray.push([array[0][0] * 1.5, array[0][1]]);
                }
            }
        }
        return orderBookArray;
    },

    priceToObject(x, type) {
        let tolerance = 1.0e-8;
        let h1 = 1;
        let h2 = 0;
        let k1 = 0;
        let k2 = 1;
        let b = x;
        do {
            let a = Math.floor(b);
            let aux = h1;
            h1 = a * h1 + h2;
            h2 = aux;
            aux = k1;
            k1 = a * k1 + k2;
            k2 = aux;
            b = 1 / (b - a);
        } while (Math.abs(x - h1 / k1) > x * tolerance);

        if (type === "ask") {
            return {base: h1, quote: k1};
        } else if (type === "bid") {
            return {quote: h1, base: k1};
        } else {
            throw "Unknown type";
        }
    },

    isMarketAsset(quote, base) {
        let isMarketAsset = false,
            marketAsset,
            inverted = false;

        if (
            quote.get("bitasset") &&
            base.get("id") ===
                quote.getIn(["bitasset", "options", "short_backing_asset"])
        ) {
            isMarketAsset = true;
            marketAsset = {id: quote.get("id")};
        } else if (
            base.get("bitasset") &&
            quote.get("id") ===
                base.getIn(["bitasset", "options", "short_backing_asset"])
        ) {
            inverted = true;
            isMarketAsset = true;
            marketAsset = {id: base.get("id")};
        }

        return {
            isMarketAsset,
            marketAsset,
            inverted
        };
    },

    getMarketName(base, quote) {
        if (!base || !quote) return {marketName: "_"};
        let baseID = parseInt(base.get("id").split(".")[2], 10);
        let quoteID = parseInt(quote.get("id").split(".")[2], 10);

        let first = quoteID > baseID ? quote : base;
        let second = quoteID > baseID ? base : quote;

        const marketName = `${first.get("symbol")}_${second.get("symbol")}`;
        return {baseID, quoteID, marketName, first, second};
    }
};

export default MarketUtils;
