import React from "react";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import AssetName from "../Utility/AssetName";
import cnames from "classnames";
import MarketsActions from "actions/MarketsActions";
import MarketsStore from "stores/MarketsStore";
import {connect} from "alt-react";
import utils from "common/utils";
import Translate from "react-translate-component";
import PropTypes from "prop-types";
import {get_allTokens} from "../../branding";

import Icon from "../Icon/Icon";
import {Link} from "react-router-dom";
import counterpart from "counterpart";

import SettingsActions from "../../actions/SettingsActions";
import SettingsStore from "../../stores/SettingsStore";

class MarketCard extends React.Component {
    static propTypes = {
        quote: ChainTypes.ChainAsset.isRequired,
        base: ChainTypes.ChainAsset.isRequired
        //invert: PropTypes.bool
    };

    static defaultProps = {
        //invert: true
    };

    constructor(props) {
        super(props);

        this.statsInterval = null;

        this.state = {
            imgError: false,

            base: this.props.base,
            quote: this.props.quote,

            marketStats: this.props.marketStats,
            starredMarkets: this.props.starredMarkets,

            history: this.props.history,

            volumeUSDT: this.props.volumeUSDT,

            price: this.props.price,
            volume: this.props.volume,
            change: this.props.change
        };
    }

    _toggleMarket(e, quote, base) {
        if (e) {
            e.preventDefault();
        }

        MarketsActions.getMarketStats.defer(base, quote);

        let marketStats = MarketsStore.getState().allMarketStats.get(
            `${quote.get("symbol")}_${base.get("symbol")}`
        );

        this.statsInterval = setInterval(
            MarketsActions.getMarketStats.bind(this, base, quote),
            30 * 1000
        );

        this.setState({
            base: quote,
            quote: base,
            marketStats: marketStats,

            price: marketStats ? marketStats.price : 0,
            volume: marketStats ? marketStats.volumeQuote : 0,
            change: marketStats ? marketStats.change : 0
        });
    }

    _checkStats(
        newStats = {close: {}, price: {}},
        oldStats = {close: {}, price: {}}
    ) {
        return (
            newStats.volumeQuote !== oldStats.volumeQuote ||
            !utils.are_equal_shallow(
                newStats.close && newStats.close.base,
                oldStats.close && oldStats.close.base
            ) ||
            !utils.are_equal_shallow(
                newStats.close && newStats.close.quote,
                oldStats.close && oldStats.close.quote
            ) ||
            newStats.change !== oldStats.change ||
            newStats.volumeBase !== oldStats.volumeBase ||
            !utils.are_equal_shallow(
                newStats.price && newStats.price.quote,
                oldStats.price && oldStats.price.quote
            ) ||
            !utils.are_equal_shallow(
                newStats.price && newStats.price.base,
                oldStats.price && oldStats.price.base
            )
        );
    }

    shouldComponentUpdate(np, ns) {
        return (
            //this._checkStats(ns.marketStats, this.state.marketStats) ||

            ns.imgError !== this.state.imgError ||
            ns.starredMarkets !== this.state.starredMarkets ||
            ns.base.get("id") !== this.state.base.get("id") ||
            ns.quote.get("id") !== this.state.quote.get("id") ||
            np.volumeUSDT !== this.props.volumeUSDT ||
            np.price !== this.props.price ||
            np.volume !== this.props.volume ||
            np.change !== this.props.change
        );
    }

    UNSAFE_componentWillUpdate(nextProps, nextState) {
        if (
            nextProps.quote.get("symbol") !== this.state.quote.get("symbol") ||
            nextProps.base.get("symbol") !== this.state.base.get("symbol")
        ) {
            this.setState({
                quote: nextProps.quote,
                base: nextProps.base
            });
        }

        if (nextProps.volumeUSDT !== this.state.volumeUSDT) {
            this.setState({
                volumeUSDT: nextProps.volumeUSDT
            });
        }

        if (
            nextProps.price !== this.state.price ||
            nextProps.volume !== this.state.volume ||
            nextProps.change !== this.state.change
        ) {
            this.setState({
                price: nextProps.price,
                volume: nextProps.volume,
                change: nextProps.change
            });
        }
    }

    UNSAFE_componentWillMount() {
        MarketsActions.getMarketStats.defer(this.state.quote, this.state.base);

        let marketStats = MarketsStore.getState().allMarketStats.get(
            `${this.state.base.get("symbol")}_${this.state.quote.get("symbol")}`
        );

        this.statsInterval = setInterval(
            MarketsActions.getMarketStats.bind(
                this,
                this.state.quote,
                this.state.base
            ),
            30 * 1000
        );

        this.setState({
            marketStats: marketStats,

            price: marketStats ? marketStats.price : 0,
            volume: marketStats ? marketStats.volumeQuote : 0,
            change: marketStats ? marketStats.change : 0
        });
    }

    componentWillUnmount() {
        clearInterval(this.statsInterval);
    }

    goToMarket(e) {
        //e.preventDefault();

        let history = this.state.history;
        history.push(
            `/market/${this.state.base.get("symbol")}_${this.state.quote.get(
                "symbol"
            )}`
        );
    }

    _addMarket(quote, base) {
        let marketID = `${quote}_${base}`;

        if (!this.state.starredMarkets.has(marketID)) {
            SettingsActions.addStarMarket(quote, base);
        } else {
            SettingsActions.removeStarMarket(quote, base);
        }

        this.setState({
            starredMarkets: SettingsStore.getState().starredMarkets
        });
    }

    _onError(imgName) {
        if (!this.state.imgError) {
            this.refs[imgName.toLowerCase()].src = "asset-symbols/unknown.png";
            this.setState({
                imgError: true
            });
        }
    }

    render() {
        let {hide, isLowVolume} = this.props;
        let {
            base,
            quote,
            marketStats,
            volumeUSDT,

            price,
            volume,
            change
        } = this.state;

        if (isLowVolume || hide) return null;

        if (!marketStats || volumeUSDT < 1) return null;

        price =
            price && price
                ? utils.price_text(price.toReal(), base, quote)
                : null;

        volume = !volume
            ? null
            : utils.format_volume(volume, quote.get("precision"));

        change = !change ? null : change;

        function getImageName(asset) {
            if (asset === null) return null;

            let symbol = asset.get("symbol");

            if (symbol.startsWith("RUDEX.")) return symbol;

            if (
                get_allTokens().nativeTokens.indexOf(symbol) !== -1 ||
                symbol == "DONATE" ||
                symbol == "DEXBOT"
            )
                return symbol;

            return "unknown";
        }

        let imgName = getImageName(base);

        let changeClass = !change
            ? ""
            : parseFloat(change) > 0
            ? "change-up"
            : parseFloat(change) < 0
            ? "change-down"
            : "";

        let marketID = `${base.get("symbol")}_${quote.get("symbol")}`;

        const starClass = this.state.starredMarkets.has(marketID)
            ? "gold-star"
            : "grey-star";

        return (
            <div
                className={cnames(
                    "grid-block no-overflow fm-container",
                    this.props.className
                )}
            >
                <div
                    className="grid-block vertical shrink"
                    style={{
                        cursor: "pointer"
                    }}
                    onClick={e => {
                        this.goToMarket(e);
                    }}
                >
                    <div className="v-align">
                        <img
                            className="align-center"
                            ref={imgName.toLowerCase()}
                            onError={this._onError.bind(this, imgName)}
                            style={{maxWidth: 70}}
                            src={`${__BASE_URL__}asset-symbols/${imgName.toLowerCase()}.png`}
                        />
                    </div>
                </div>
                <div className="grid-block vertical no-overflow">
                    <div className="fm-name">
                        <AssetName dataPlace="top" name={base.get("symbol")} />{" "}
                        :{" "}
                        <AssetName dataPlace="top" name={quote.get("symbol")} />
                    </div>

                    <div className="label-actions">
                        <Translate
                            component="span"
                            className="stat-text"
                            content="exchange.trading_pair"
                        />
                        <div
                            onClick={e => {
                                this._toggleMarket(e, quote, base);
                            }}
                            data-intro={counterpart.translate(
                                "walkthrough.switch_button"
                            )}
                            style={{
                                padding: "0px 5px 0px 5px",
                                display: "inline",
                                cursor: "pointer"
                            }}
                        >
                            <Icon
                                className="shuffle"
                                name="shuffle"
                                title={counterpart.translate("icons.shuffle")}
                            />
                        </div>

                        <a
                            style={{
                                cursor: "pointer"
                            }}
                            onClick={() => {
                                this._addMarket(
                                    base.get("symbol"),
                                    quote.get("symbol")
                                );
                            }}
                            data-intro={counterpart.translate(
                                "walkthrough.favourite_button"
                            )}
                        >
                            <Icon
                                className={starClass}
                                name="fi-star"
                                title={counterpart.translate(
                                    "icons.fi_star.market"
                                )}
                            />
                        </a>
                    </div>

                    <div
                        className="grid-block vertical no-overflow"
                        style={{
                            marginTop: "10px",
                            cursor: "pointer"
                        }}
                        onClick={e => {
                            this.goToMarket(e);
                        }}
                    >
                        <div className="fm-volume">
                            <Translate content="exchange.price" />:{" "}
                            <div className="float-right">{price}</div>
                        </div>

                        <div className="fm-volume">
                            <Translate content="exchange.volume" />:{" "}
                            <div className="float-right">{volume}</div>
                        </div>

                        <div className="fm-volume">
                            <Translate content="exchange.volume_24_usdt" />:{" "}
                            <div className="float-right">
                                {utils.format_volume(volumeUSDT, 2)}
                            </div>
                        </div>

                        <div className="fm-change">
                            <Translate content="exchange.change" />:{" "}
                            <div className={cnames("float-right", changeClass)}>
                                {change}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

MarketCard = BindToChainState(MarketCard);

class MarketCardWrapper extends React.Component {
    render() {
        return <MarketCard {...this.props} />;
    }
}

export default connect(MarketCardWrapper, {
    listenTo() {
        return [MarketsStore];
    },
    getProps(props) {
        return {
            marketStats: MarketsStore.getState().allMarketStats.get(
                props.marketId
            ),
            starredMarkets: SettingsStore.getState().starredMarkets
        };
    }
});
