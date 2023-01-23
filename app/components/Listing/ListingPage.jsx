import React from "react";
import "./ListingPage.css";

import {Apis} from "leedexjs-ws";
import {FetchChain} from "leedexjs";
import counterpart from "counterpart";

import CoinCardListing from "./CoinCardListing";
import {getListingCoins, getListedCoins} from "../../branding";
import {Tabs, Tab} from "../Utility/Tabs";
import AssetImage from "../Utility/AssetImage";
import Translate from "react-translate-component";
import {Button} from "bitshares-ui-style-guide";
import {Link} from "react-router-dom";
import IntlStore from "../../stores/IntlStore";

import LoadingIndicator from "../LoadingIndicator";
import {connect} from "alt-react";
import Icon from "../Icon/Icon";

class ListingPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ListingNotice1Informed: false,
            coins: [],
            updating: true,
            currentLocale: this.props.currentLocale
        };
        this.data = {
            links: {
                agreement_ru:
                    "https://rudex.freshdesk.com/support/solutions/articles/35000138247-cоглашение-об-оказании-услуг-шлюза",
                agreement_en:
                    "https://rudex.freshdesk.com/support/solutions/articles/35000138245-gateway-service-agreement"
            },
            donateTokenName: "DONATE",
            donateMarket: "DONATE_LEEDEX.USDT"
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.currentLocale !== this.state.currentLocale) {
            this.setState({
                currentLocale: nextProps.currentLocale
            });
        }
    }

    onSubmitRequest(e) {
        e.preventDefault();
        this.setState({error: null});

        let link_ru =
            "https://docs.google.com/forms/d/1lJnvufc95CDh2z1Ntq7iCSEs3oD7tPG4nljKTYYezQw";
        let link_en =
            "https://docs.google.com/forms/d/1X2PguAaRzxlXZGLAarGcmNd-LbJCy8lcoMBcQjFSQ5k";

        window.open(
            this.state.currentLocale == "ru" ? link_ru : link_en,
            "_blank"
        );
    }

    onListingNotice1Informed() {
        this.setState({
            ListingNotice1Informed: !this.state.ListingNotice1Informed
        });
    }

    componentDidMount() {
        setInterval(() => this._getBalances(), 1000);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.updating == false) return true;
        return false;
    }

    _getBalances() {
        let coins = getListingCoins();

        if (this.state.coins.length !== 0) coins = this.state.coins;

        this.setState({
            coins: coins,
            updating: true
        });

        coins.forEach(coin => {
            FetchChain("getAsset", this.data.donateTokenName).then(
                assetInfo => {
                    Apis.instance()
                        .db_api()
                        .exec("get_named_account_balances", [
                            coin.account,
                            [assetInfo.get("id")]
                        ])
                        .then(res => {
                            let coins = this.state.coins;
                            let x = coins.find(i => i.account === coin.account);
                            x.votes =
                                res[0]["amount"] /
                                Math.pow(10, assetInfo.get("precision"));
                            this.setState({
                                coins: coins
                            });
                        })
                        .then(() => {
                            this.setState({
                                updating: false
                            });
                        });
                }
            );
        });
    }

    render() {
        return (
            <div className="grid-block vertical">
                {this.state.updating === true ? (
                    <LoadingIndicator
                        loadingText={counterpart.translate("footer.loading")}
                    />
                ) : (
                    this.getTableTabs()
                )}
            </div>
        );
    }

    getContent() {
        return (
            <div className="listingTable">
                <p>
                    <Link
                        style={{margin: 2, fontSize: "1.0rem"}}
                        to={`/market/${this.data.donateMarket}`}
                    >
                        <Translate content="listing.get_donate_tokens" />

                        <span style={{margin: 2, fontSize: "1.0rem"}}>
                            <AssetImage
                                maxWidth={25}
                                replaceNoneToBts={false}
                                name={this.data.donateTokenName}
                            />
                            {this.data.donateTokenName}
                        </span>
                        <Translate content="listing.token" />
                    </Link>
                </p>
                <div className="listingTable__header">
                    <div className="listingAssetCard">
                        <div className="listingTable__cell listingTableRank">
                            <Translate content="listing.table.rank" />
                        </div>
                        <div className="listingTable__cell listingTableLogo" />
                        <div className="listingTable__cell listingTableAssetName align-left">
                            <Translate content="listing.table.asset_name" />
                        </div>
                    </div>
                    <div className="listingAssetInfo">
                        <div className="listingAssetInfoData">
                            <div className="listingTable__cell listingTableVotes">
                                <Translate content="listing.table.goal" />
                            </div>
                            <div className="listingTable__cell listingTableGoal">
                                <Translate content="listing.table.donates" />
                            </div>
                            <div className="listingTable__cell listingTableStatus">
                                <Translate content="listing.table.status" />
                            </div>
                        </div>
                        <div className="listingTable__cell listingTableProgress">
                            <Translate content="listing.table.progress" />
                        </div>
                    </div>
                </div>
                {this.getCoinsList()}
            </div>
        );
    }

    getContent_listed = () => {
        return (
            <div className="listingTable">
                <div className="listingTable__header">
                    <div className="listingAssetCard">
                        <div className="listingTable__cell listingTableRank">
                            <Translate content="listing.table.rank" />
                        </div>
                        <div className="listingTable__cell listingTableLogo" />
                        <div className="listingTable__cell listingTableAssetName align-left">
                            <Translate content="listing.table.asset_name" />
                        </div>
                    </div>
                    <div className="listingAssetInfo">
                        <div className="listingAssetInfoData">
                            <div className="listingTable__cell listingTableVotes">
                                <Translate content="listing.table.goal" />
                            </div>

                            <div className="listingTable__cell listingTableStatus">
                                <Translate content="listing.table.status" />
                            </div>
                        </div>
                    </div>
                </div>
                {this.getCoinsList_listed()}
            </div>
        );
    };

    getCoinsList = () => {
        let {coins} = this.state;
        let sortedCoins = coins.sort((a, b) => {
            return b.votes - a.votes;
        });
        return sortedCoins.map((coin, i) => {
            coin.votes_for_percent =
                coin.votes < coin.goal ? coin.votes : coin.goal;
            coin.status = coin.votes < coin.goal ? "collecting" : "done";
            coin.soon == true ? (coin.status = "waiting") : coin.soon;

            return <CoinCardListing key={i} rank={i + 1} coin={coin} />;
        });
    };

    getCoinsList_listed = () => {
        let coins = getListedCoins();
        let sortedCoins = coins.sort((a, b) => {
            return b.votes - a.votes;
        });
        return sortedCoins.map((coin, i) => {
            coin.votes_for_percent =
                coin.votes < coin.goal ? coin.votes : coin.goal;
            coin.status = "done";
            coin.listed = true;

            return <CoinCardListing key={i} rank={i + 1} coin={coin} />;
        });
    };

    getTableTabs = () => {
        let RuDEX = <span style={{fontWeight: "bold"}}>RuDEX</span>;

        let DonateLink = (
            style = {
                margin: 2,
                fontSize: "1.0rem",
                paddingRight: 5
            }
        ) => {
            return (
                <Link style={style} to={`/asset/${this.data.donateTokenName}`}>
                    <AssetImage
                        maxWidth={25}
                        replaceNoneToBts={false}
                        name={this.data.donateTokenName}
                    />
                    {this.data.donateTokenName}
                </Link>
            );
        };

        return (
            <div className="grid-content">
                <div className="content-block small-12">
                    <div className="tabs-container generic-bordered-box">
                        <Tabs
                            defaultActiveTab={0}
                            segmented={false}
                            setting="permissionsTab"
                            className="account-tabs"
                            tabsClass="account-overview bordered-header content-block"
                            contentClass="padding"
                        >
                            {/* DONATE PROGRESS*/}
                            <Tab title="listing.donate_progress">
                                <label className="horizontal" tabIndex={0}>
                                    <div
                                        className="grid-container"
                                        style={{padding: "2rem 8px"}}
                                    >
                                        <div style={{marginBottom: 20}} />
                                        <div className="grid-block small-up-1 medium-up-1 large-up-1 no-overflow">
                                            {this.getContent()}
                                        </div>
                                    </div>
                                </label>
                                <br />
                            </Tab>

                            {/* LISTED*/}
                            <Tab title="listing.listed">
                                <label className="horizontal" tabIndex={1}>
                                    <div
                                        className="grid-container"
                                        style={{padding: "2rem 8px"}}
                                    >
                                        <div style={{marginBottom: 20}} />
                                        <div className="grid-block small-up-1 medium-up-1 large-up-1 no-overflow">
                                            {this.getContent_listed()}
                                        </div>
                                    </div>
                                </label>
                                <br />
                            </Tab>

                            {/* Add Coin*/}
                            <Tab title="listing.add_coin">
                                <label className="horizontal" tabIndex={2} />

                                <div className="grid-container help-content-layout">
                                    {/*<div className="grid-block">*/}
                                    <div className="main-content">
                                        <h2>
                                            <Translate content="listing.texts.header" />
                                        </h2>

                                        <p style={{fontSize: "20px"}}>
                                            <Translate content="listing.texts.text1" />
                                        </p>
                                        <p>
                                            <Translate content="listing.texts.text2" />
                                        </p>

                                        <p>
                                            <Translate content="listing.texts.text3.t1" />
                                            <Translate content="listing.texts.text3.t2" />
                                            <Link
                                                style={{
                                                    margin: 2,
                                                    fontSize: "1.0rem"
                                                }}
                                                to={`/market/${this.data.donateMarket}`}
                                            >
                                                <Translate content="listing.texts.text3.get" />
                                            </Link>
                                            <Translate content="listing.texts.text4.t1" />
                                            {DonateLink()}
                                            .
                                            <Translate content="listing.texts.text4.t2" />
                                            {DonateLink()}
                                            <Translate content="listing.texts.text4.t3" />
                                            {/*                                           <span
                                                style={{
                                                    border: "1px solid #00a9e0",
                                                    padding: "4px 3px 3px 4px",
                                                    borderRadius: "3px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                {this.data.donateTokenName}
                                            </span>*/}
                                            <Button className={"buttonDonate"}>
                                                <Icon
                                                    style={{
                                                        margin: "-3px 0 0px 0px"
                                                    }}
                                                    name="donate"
                                                    title="listing.modal.header2"
                                                    className="icon-14x"
                                                />
                                            </Button>
                                            <Translate content="listing.texts.text4.t4" />
                                        </p>

                                        <p>
                                            <Translate content="listing.texts.text5.t1" />

                                            {DonateLink()}

                                            <Translate content="listing.texts.text5.t2" />
                                        </p>

                                        <p>
                                            <Translate content="listing.texts.text5.t3" />
                                        </p>

                                        <p
                                            style={{
                                                fontWeight: "bold"
                                            }}
                                        >
                                            <Translate content="listing.texts.terms.t1" />
                                        </p>
                                        <p>
                                            <Translate content="listing.texts.terms.t2" />
                                        </p>
                                        <p>
                                            <Translate content="listing.texts.terms.tu1" />
                                        </p>
                                        <p>
                                            <Translate content="listing.texts.terms.tu2" />
                                        </p>
                                        <p>
                                            <Translate content="listing.texts.terms.tu3" />
                                        </p>
                                        <p>
                                            <Translate content="listing.texts.terms.tu4" />
                                        </p>
                                        <p>
                                            <Translate content="listing.texts.terms.tu5" />
                                        </p>
                                        <p>
                                            <Translate content="listing.texts.terms.t3" />
                                        </p>

                                        <h3>
                                            <Translate content="listing.texts.rules.header" />
                                        </h3>

                                        <ol>
                                            <li>
                                                <Translate content="listing.texts.rules.rule_1" />
                                                <Translate
                                                    href={
                                                        this.state
                                                            .currentLocale ==
                                                        "ru"
                                                            ? this.data.links
                                                                  .agreement_ru
                                                            : this.data.links
                                                                  .agreement_en
                                                    }
                                                    content="listing.texts.rules.rule_10"
                                                    component="a"
                                                    target="_blank"
                                                />
                                                <Translate content="listing.texts.rules.rule_11" />
                                            </li>
                                            <li>
                                                <Translate content="listing.texts.rules.rule_2" />
                                            </li>
                                            <li>
                                                <Translate content="listing.texts.rules.rule_3" />
                                                {DonateLink()}
                                                <Translate content="listing.texts.rules.rule_4" />
                                            </li>
                                            <li>
                                                <Translate content="listing.texts.rules.rule_5" />
                                            </li>
                                        </ol>
                                    </div>

                                    <h5>
                                        <input
                                            type="checkbox"
                                            defaultChecked={
                                                this.state
                                                    .ListingNotice1Informed
                                            }
                                            onChange={this.onListingNotice1Informed.bind(
                                                this
                                            )}
                                        />{" "}
                                        -{" "}
                                        <Translate content="listing.notice_informed" />
                                    </h5>

                                    <div className={"listing_button"}>
                                        <Button
                                            key={"send"}
                                            disabled={
                                                !this.state
                                                    .ListingNotice1Informed
                                            }
                                            onClick={
                                                this.state
                                                    .ListingNotice1Informed
                                                    ? this.onSubmitRequest.bind(
                                                          this
                                                      )
                                                    : null
                                            }
                                        >
                                            <Translate content="listing.submit_request" />
                                        </Button>
                                    </div>

                                    <h3>
                                        <Translate content="listing.texts.end" />{" "}
                                        {RuDEX}!
                                    </h3>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </div>
        );
    };
}

ListingPage = connect(ListingPage, {
    listenTo() {
        return [IntlStore];
    },
    getProps() {
        return {
            currentLocale: IntlStore.getState().currentLocale
        };
    }
});

export default ListingPage;
