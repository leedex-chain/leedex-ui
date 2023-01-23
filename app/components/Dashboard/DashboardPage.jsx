import React from "react";
import {connect} from "alt-react";

import LoadingIndicator from "../LoadingIndicator";
import LoginSelector from "../LoginSelector";
import AccountStore from "stores/AccountStore";
import SettingsStore from "stores/SettingsStore";

import {Tabs, Tab} from "../Utility/Tabs";
import {StarredMarkets, FeaturedMarkets} from "./Markets";
import {getPossibleGatewayPrefixes} from "common/gateways";
//import Dashboard from "../DashboardLEEDEX/Dashboard";
import {getMyMarketsQuotes} from "branding";

class DashboardPage extends React.Component {
    render() {
        let {
            myActiveAccounts,
            myHiddenAccounts,
            accountsReady,
            passwordAccount,
            preferredBases
        } = this.props;
        if (!accountsReady) {
            return <LoadingIndicator />;
        }

        let accountCount =
            myActiveAccounts.size +
            myHiddenAccounts.size +
            (passwordAccount ? 1 : 0);
        /*        if (!accountCount) {
            return <LoginSelector />;
        }*/

        return (
            <div className="grid-block page-layout">
                <div className="grid-block no-padding">
                    <div
                        className="grid-content app-tables no-padding"
                        ref="appTables"
                    >
                        <div className="content-block small-12">
                            <div className="tabs-container generic-bordered-box">
                                <Tabs
                                    defaultActiveTab={0}
                                    segmented={false}
                                    setting="dashboardTab"
                                    className="account-tabs"
                                    tabsClass="account-overview no-padding bordered-header content-block"
                                >
                                    {/*                                    <Tab title="dashboard.top_markets">
                                        <Dashboard {...this.props} />
                                    </Tab>*/}
                                    <Tab title="dashboard.starred_markets">
                                        <StarredMarkets />
                                    </Tab>
                                    {preferredBases.map(imgName => {
                                        let title = (
                                            <span>
                                                <img
                                                    className="column-hide-small"
                                                    style={{
                                                        maxWidth: 30,
                                                        marginRight: 5
                                                    }}
                                                    src={
                                                        getMyMarketsQuotes().indexOf(
                                                            imgName
                                                        ) !== -1
                                                            ? `${__BASE_URL__}asset-symbols/${imgName.toLowerCase()}.png`
                                                            : "asset-symbols/unknown.png"
                                                    }
                                                />
                                                &nbsp;
                                                {imgName.replace("LEEDEX.", "")}
                                            </span>
                                        );

                                        return (
                                            <Tab key={imgName} title={title}>
                                                <FeaturedMarkets
                                                    quotes={[imgName].concat(
                                                        getPossibleGatewayPrefixes(
                                                            [imgName]
                                                        )
                                                    )}
                                                />
                                            </Tab>
                                        );
                                    })}
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(DashboardPage, {
    listenTo() {
        return [AccountStore, SettingsStore];
    },
    getProps() {
        let {
            myActiveAccounts,
            myHiddenAccounts,
            passwordAccount,
            accountsLoaded,
            refsLoaded
        } = AccountStore.getState();

        return {
            myActiveAccounts,
            myHiddenAccounts,
            passwordAccount,
            accountsReady: accountsLoaded && refsLoaded,
            preferredBases: SettingsStore.getState().preferredBases
        };
    }
});
