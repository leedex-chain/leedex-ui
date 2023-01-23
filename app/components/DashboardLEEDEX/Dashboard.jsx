import React from "react";
import Translate from "react-translate-component";
import MarketCard from "./MarketCard";
import utils from "common/utils";
import {Apis} from "leedexjs-ws";
import LoadingIndicator from "../LoadingIndicator";
import SettingsStore from "stores/SettingsStore";
import {connect} from "alt-react";
import MarketsStore from "../../stores/MarketsStore";

import counterpart from "counterpart";

import {getMyMarketsQuotes, getFeaturedMarkets} from "branding";

import "./DashboardLEEDEX.css";

class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: null,

            marketStats: this.props.marketStats,

            featuredMarkets: [],

            volume24_usdt: 0,

            markets: [],
            updating: true,

            timeOutID: undefined
        };

        this._setDimensions = this._setDimensions.bind(this);
        this.pingMarkets = this.pingMarkets.bind(this);
    }

    componentDidMount() {
        this._setDimensions();
        window.addEventListener("resize", this._setDimensions, {
            capture: false,
            passive: true
        });
    }

    UNSAFE_componentWillMount() {
        let data = this.calcVolumeSort();

        this.setState({
            featuredMarkets: data
        });

        let timeOutID = setTimeout(this.pingMarkets, 3000);

        this.setState({
            timeOutID: timeOutID
        });
    }

    pingMarkets() {
        let allMarketStats = MarketsStore.getState().allMarketStats;
        let data = allMarketStats.size !== 0 ? this.calcVolumeSort() : [];

        this.setState({
            featuredMarkets: data,
            marketStats: allMarketStats,
            updating: false,
            timeOutID: setTimeout(this.pingMarkets, 20000)
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !utils.are_equal_shallow(
                nextState.featuredMarkets,
                this.state.featuredMarkets
            ) ||
            nextProps.marketStats !== this.props.marketStats ||
            nextState.marketStats !== this.state.marketStats ||
            nextState.volume24_usdt !== this.state.volume24_usdt ||
            nextState.width !== this.state.width ||
            nextState.updating !== this.state.updating
        );
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this._setDimensions);
    }

    _setDimensions() {
        let width = window.innerWidth;

        if (width !== this.state.width) {
            this.setState({width});
        }
    }

    getVolumeUSDT(quote, base, allMarketStats) {
        let marketStats1 = allMarketStats.get(`${quote}_${base}`);
        let volume_usdt = 0;

        if (marketStats1 && quote == "LEEDEX.USDT") {
            volume_usdt = marketStats1.volumeQuote * 1;
        } else {
            try {
                let marketStats_to_USDT = allMarketStats.get(
                    `LEEDEX.USDT_${quote}`
                );

                let price;
                if (
                    marketStats_to_USDT &&
                    marketStats_to_USDT.price &&
                    marketStats_to_USDT.price.quote.amount != 0
                ) {
                    price =
                        ((marketStats_to_USDT.price.quote.amount /
                            marketStats_to_USDT.price.base.amount) *
                            Math.pow(
                                10,
                                marketStats_to_USDT.price.base.precision
                            )) /
                        Math.pow(10, marketStats_to_USDT.price.quote.precision);

                    volume_usdt = marketStats1.volumeQuote * price * 1;
                }
            } catch (e) {
                console.log(`getVolume error ${quote} / ${base}`);
            }
        }

        return volume_usdt;
    }

    _SortFilterPairs(pairs) {
        let sortPairs = pairs.map(pair => {
            let res = getFeaturedMarkets().find(el => {
                if (el[0] == pair[1] && el[1] == pair[0]) {
                    return true;
                } else return false;
            });

            if (res) {
                //Not in 2nd place
                if (pair[0] === "LEEDEX.USDT") {
                    return [pair[0], pair[1], 0];
                }
                return [pair[1], pair[0], 0];
            } else {
                //Not in 2nd place
                if (pair[0] === "LEEDEX.USDT") {
                    return [pair[0], pair[1], 0];
                }
                return [pair[0], pair[1], 0];
            }
        });
        return sortPairs;
    }

    calcVolumeSort() {
        let pairs = [];
        let pairsNew = [];
        let volume24_usdt = 0;

        let all_coins = getMyMarketsQuotes();
        for (let i = 0; i < all_coins.length - 1; i++) {
            for (let k = i + 1; k < all_coins.length; k++) {
                pairs.push([all_coins[i], all_coins[k], 0, 0, 0, 0]);
            }
        }

        pairs = this._SortFilterPairs(pairs);

        let allMarketStats = MarketsStore.getState().allMarketStats;

        if (allMarketStats.size == 0) return pairs;

        for (let i = 0; i < pairs.length; i++) {
            let volume_usdt = this.getVolumeUSDT(
                pairs[i][0],
                pairs[i][1],
                allMarketStats
            );

            let pairStat = allMarketStats.get(`${pairs[i][1]}_${pairs[i][0]}`);
            let price = pairStat !== undefined ? pairStat.price : 0;
            let volume = pairStat !== undefined ? pairStat.volumeQuote : 0;
            let change = pairStat !== undefined ? pairStat.change : 0;

            pairsNew.push([
                pairs[i][0],
                pairs[i][1],
                volume_usdt,
                price,
                volume,
                change
            ]);

            volume24_usdt = volume24_usdt + volume_usdt;
        }

        this.setState({
            volume24_usdt: volume24_usdt
        });

        return pairsNew;
    }

    render() {
        let {featuredMarkets, marketStats} = this.state;

        let validMarkets = 0;

        let markets = featuredMarkets
            .sort(function(a, b) {
                return b[2] * 1 - a[2] * 1;
            })
            .map(pair => {
                validMarkets++;
                let className = "";
                return (
                    <MarketCard
                        key={validMarkets}
                        marketId={pair[1] + "_" + pair[0]}
                        className={className}
                        quote={pair[0]}
                        base={pair[1]}
                        volumeUSDT={pair[2]}
                        history={this.props.history}
                        hide={validMarkets > 400}
                        price={pair[3]}
                        volume={pair[4]}
                        change={pair[5]}
                    />
                );
            });
        return (
            <div className="grid-block vertical dashboardRuDEX">
                <div ref="container" className="grid-container">
                    {this.state.updating === true ? (
                        <div className="grid-frame vertical">
                            <LoadingIndicator
                                loadingText={counterpart.translate(
                                    "footer.loading"
                                )}
                            />
                        </div>
                    ) : (
                        <div className="grid-frame vertical">
                            <div
                                className="block-content-header"
                                style={{
                                    padding: 0,
                                    margin: 0
                                }}
                            >
                                <div
                                    style={{
                                        paddingBottom: "24px"
                                    }}
                                >
                                    <Translate
                                        content="exchange.volume_24"
                                        component="h1"
                                        style={{margin: "10px 0px 5px 0rem"}}
                                    />{" "}
                                    $
                                    {utils.format_number(
                                        this.state.volume24_usdt,
                                        2
                                    )}
                                </div>
                            </div>
                            <div className="grid-block small-up-1 medium-up-3 large-up-4  no-overflow fm-outer-container">
                                {this.state.volume24_usdt === 0
                                    ? null
                                    : markets}
                            </div>
                        </div>
                    )}
                    {marketStats === undefined || marketStats.size === 0
                        ? markets
                        : null}
                </div>
            </div>
        );
    }
}

let DashboardWrapper = props => {
    return <Dashboard {...props} />;
};

export default DashboardWrapper = connect(DashboardWrapper, {
    listenTo() {
        return [SettingsStore, MarketsStore];
    },
    getProps() {
        return {
            viewSettings: SettingsStore.getState().viewSettings,
            marketStats: MarketsStore.getState().allMarketStats
        };
    }
});
