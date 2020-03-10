import React from "react";

import {DonutChart} from "./DonutChart";
import SendModal from "./DonateSendModal";
import {Icon} from "bitshares-ui-style-guide";

import SettingsStore from "../../stores/SettingsStore";
import {connect} from "alt-react";
import AccountStore from "../../stores/AccountStore";
import Translate from "react-translate-component";
import {Asset} from "../../lib/common/MarketClasses";

class CoinCardListing extends React.Component {
    constructor(props) {
        super(props);

        this.props.coin.votes = 0;

        this.state = {
            key: this.props.key,
            rank: this.props.rank,

            coin: this.props.coin
        };
    }

    triggerSend(asset) {
        this.setState({send_asset: asset}, () => {
            if (this.send_modal) this.send_modal.show();
        });
    }

    render() {
        let from_name = "";
        try {
            this.props.account.get("name");
        } catch (e) {}

        return (
            <div className="listingTable__row">
                <SendModal
                    id="send_modal_listing"
                    refCallback={e => {
                        if (e) this.send_modal = e;
                    }}
                    from_name={
                        this.props.currentAccount
                            ? this.props.currentAccount
                            : this.props.account
                    }
                    to_name={
                        this.props.coin.account
                            ? this.props.coin.account
                            : from_name
                    }
                    asset_id={"1.3.5588"}
                    ticker={this.props.coin.ticker}
                />
                <div className="listingAsset">
                    <div className="listingAssetCard">
                        <div className="listingTable__cell listingTableRank align-center">
                            {this.props.rank}
                        </div>
                        <div className="listingTable__cell listingTableLogo">
                            <img
                                className="align-center"
                                style={{maxWidth: 40}}
                                src={`${__BASE_URL__}coins-logo/${this.props.coin.ticker.toLowerCase()}.png`}
                                alt=""
                            />
                        </div>
                        <div className="listingTable__cell listingTableAssetName align-left nowrap">
                            {this.props.coin.name} ({this.props.coin.ticker})
                            {this.props.coin.soon === true ? (
                                <Translate
                                    content="listing.table.coming_soon"
                                    style={{float: "right", color: "gold"}}
                                />
                            ) : (
                                ""
                            )}
                        </div>
                    </div>

                    <div className="listingAssetInfo">
                        <div className="listingAssetInfoData">
                            <div className="listingTable__cell listingTableGoal">
                                <div className="listingAssetInfoBlock">
                                    Goal:&nbsp;{" "}
                                </div>
                                {this.props.coin.goal}
                            </div>

                            <div className="listingTable__cell listingTableVotes">
                                <div className="listingAssetInfoBlock">
                                    Votes:&nbsp;
                                </div>
                                {this.props.coin.votes}
                                <a
                                    onClick={this.triggerSend.bind(
                                        this,
                                        "1.3.5588",
                                        this.props.coin
                                    )}
                                >
                                    {
                                        <Icon
                                            name="transfer"
                                            title="icons.transfer"
                                            className="icon-14px"
                                        />
                                    }
                                    &nbsp; Donate
                                </a>
                            </div>

                            <div className="listingTable__cell listingTableStatus">
                                <div className="listingAssetInfoBlock">
                                    Status:&nbsp;{" "}
                                </div>
                                {this.props.coin.status === "collecting" ? (
                                    <Translate content="listing.table.collecting" />
                                ) : (
                                    <Translate content="listing.table.done" />
                                )}
                            </div>
                        </div>

                        <div className="listingTable__cell listingTableProgress">
                            {
                                <DonutChart
                                    votes={this.props.coin.votes_for_percent}
                                    goal={this.props.coin.goal}
                                />
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

CoinCardListing = connect(
    CoinCardListing,
    {
        listenTo() {
            return [SettingsStore, AccountStore];
        },
        getProps() {
            return {
                settings: SettingsStore.getState().settings,
                currentAccount:
                    AccountStore.getState().currentAccount ||
                    AccountStore.getState().passwordAccount
            };
        }
    }
);

export default CoinCardListing;
