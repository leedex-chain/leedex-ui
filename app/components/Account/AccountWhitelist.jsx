import React from "react";
import {ChainStore} from "leedexjs";
import SettingsStore from "stores/SettingsStore";
import {connect} from "alt-react";
import {Tabs, Tab} from "../Utility/Tabs";
import constants from "chain/account_constants.js";
import AccountSelector from "../Account/AccountSelector";
import Immutable from "immutable";
import Translate from "react-translate-component";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import LinkToAccountById from "../Utility/LinkToAccountById";
import WalletApi from "api/WalletApi";
import WalletDb from "stores/WalletDb.js";

class AccountRow extends React.Component {
    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired
    };

    static defaultProps = {
        tempComponent: "tr"
    };

    render() {
        let {account, onRemove} = this.props;

        return (
            <tr>
                <td>{this.props.index}</td>
                <td>{account.get("id")}</td>
                <td>
                    <LinkToAccountById account={account.get("id")} />
                </td>
                {onRemove ? (
                    <td>
                        <button
                            onClick={onRemove.bind(this, account.get("id"))}
                            className="button outline"
                        >
                            Remove
                        </button>
                    </td>
                ) : null}
            </tr>
        );
    }
}
AccountRow = BindToChainState(AccountRow);

class AccountList extends React.Component {
    _onRemove(listing, account, e) {
        if (account) {
            let currentState = this.props.getCurrentState(account);
            let tr = WalletApi.new_transaction();
            tr.add_type_operation("account_whitelist", {
                fee: {
                    amount: 0,
                    asset_id:
                        ChainStore.assets_by_symbol.get(
                            this.props.settings.get("fee_asset")
                        ) || "1.3.0"
                },
                authorizing_account: this.props.account.get("id"),
                account_to_list: account,
                new_listing: currentState - constants.account_listing[listing]
            });
            WalletDb.process_transaction(tr, null, true);
        }
    }

    render() {
        let {removeButton, white, list} = this.props;

        let rows = list
            .map((account, index) => {
                return (
                    <AccountRow
                        key={account}
                        onRemove={
                            removeButton
                                ? this._onRemove.bind(
                                      this,
                                      white ? "white_listed" : "black_listed"
                                  )
                                : null
                        }
                        account={account}
                        index={index + 1}
                    />
                );
            })
            .toArray();

        let showHeaders = true;
        if (!rows.length) {
            showHeaders = false;
            rows.push(
                <tr key="empty">
                    <td
                        style={{padding: "1rem 0"}}
                        colSpan={removeButton ? 4 : 3}
                    >
                        <Translate
                            content={this.props.emptyText}
                            account={this.props.account.get("name")}
                        />
                    </td>
                </tr>
            );
        }

        return (
            <table className="table compact dashboard-table">
                {showHeaders ? (
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>
                                <Translate content="account.id" />
                            </th>
                            <th>
                                <Translate content="account.name" />
                            </th>
                            {removeButton ? <th /> : null}
                        </tr>
                    </thead>
                ) : null}
                <tbody>{rows}</tbody>
            </table>
        );
    }
}

AccountList = connect(AccountList, {
    listenTo() {
        return [SettingsStore];
    },
    getProps() {
        return {
            settings: SettingsStore.getState().settings
        };
    }
});

class AccountWhitelist extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            accountName: "",
            accountToList: null
        };
    }

    _getCurrentState(id) {
        let {account} = this.props;
        let white = account.get("whitelisted_accounts") || Immutable.List();
        let black = account.get("blacklisted_accounts") || Immutable.List();
        let current = constants.account_listing.no_listing;

        if (white.includes(id)) {
            current += constants.account_listing.white_listed;
        }

        if (black.includes(id)) {
            current += constants.account_listing.black_listed;
        }

        return current;
    }

    _onAdd(listing, e) {
        let {accountToList} = this.state;
        let {account} = this.props;

        let currentState = this._getCurrentState(accountToList);

        if (accountToList) {
            let tr = WalletApi.new_transaction();
            tr.add_type_operation("account_whitelist", {
                fee: {
                    amount: 0,
                    asset_id: "1.3.0"
                },
                authorizing_account: account.get("id"),
                account_to_list: accountToList,
                new_listing: currentState + constants.account_listing[listing]
            });
            WalletDb.process_transaction(tr, null, true);
        }
    }

    _onAccountFound(account) {
        console.log("accountFound:", account);
        this.setState({
            accountName: account ? account.get("name") : null,
            accountToList: account ? account.get("id") : null
        });
    }

    _onAccountChanged(account) {
        console.log("account changed:", account);
        this.setState({
            accountName: account,
            accountToList: null
        });
    }

    render() {
        let {account} = this.props;
        let {accountName} = this.state;

        return (
            <div className="grid-content app-tables no-padding" ref="appTables">
                <div className="content-block small-12">
                    <div className="tabs-container generic-bordered-box">
                        <Tabs
                            className="account-tabs"
                            tabsClass="account-overview no-padding bordered-header content-block"
                            setting="whitelistTab"
                            contentClass="grid-content shrink small-vertical medium-horizontal no-padding"
                            segmented={false}
                        >
                            <Tab title="account.whitelist.title">
                                <div
                                    style={{paddingBottom: "1rem"}}
                                    className="small-12"
                                >
                                    <div>
                                        <AccountList
                                            emptyText="account.whitelist.empty"
                                            account={account}
                                            getCurrentState={this._getCurrentState.bind(
                                                this
                                            )}
                                            list={
                                                account.get(
                                                    "whitelisted_accounts"
                                                ) || Immutable.List()
                                            }
                                            removeButton
                                            white={true}
                                        />
                                    </div>
                                    {!account.get("whitelisted_accounts") ? (
                                        <p className="has-error">
                                            Please note, whitelisting is not
                                            working yet due to unresolved
                                            backend issue.
                                        </p>
                                    ) : null}
                                    <div style={{padding: "2rem 0"}}>
                                        <AccountSelector
                                            label={"account.whitelist.add"}
                                            accountName={accountName}
                                            onAccountChanged={this._onAccountFound.bind(
                                                this
                                            )}
                                            onChange={this._onAccountChanged.bind(
                                                this
                                            )}
                                            account={accountName}
                                            tabIndex={2}
                                            onAction={this._onAdd.bind(
                                                this,
                                                "white_listed"
                                            )}
                                            action_label="account.perm.confirm_add"
                                            white={false}
                                            typeahead={true}
                                        />
                                    </div>
                                </div>
                            </Tab>

                            <Tab title="account.whitelist.black">
                                <div
                                    style={{paddingBottom: "1rem"}}
                                    className="small-12"
                                >
                                    <div>
                                        <AccountList
                                            emptyText="account.whitelist.empty_black"
                                            account={account}
                                            getCurrentState={this._getCurrentState.bind(
                                                this
                                            )}
                                            list={account.get(
                                                "blacklisted_accounts"
                                            )}
                                            removeButton
                                        />
                                    </div>
                                    <div style={{padding: "2rem 1rem"}}>
                                        <AccountSelector
                                            label={
                                                "account.whitelist.add_black"
                                            }
                                            accountName={accountName}
                                            onAccountChanged={this._onAccountFound.bind(
                                                this
                                            )}
                                            onChange={this._onAccountChanged.bind(
                                                this
                                            )}
                                            account={accountName}
                                            tabIndex={2}
                                            onAction={this._onAdd.bind(
                                                this,
                                                "black_listed"
                                            )}
                                            action_label="account.perm.confirm_add"
                                            typeahead={true}
                                        />
                                    </div>
                                </div>
                            </Tab>

                            <Tab title="account.whitelist.white_by">
                                <div
                                    style={{paddingBottom: "1rem"}}
                                    className="small-12"
                                >
                                    <div>
                                        <AccountList
                                            emptyText="account.whitelist.empty_white_by"
                                            account={account}
                                            list={account.get(
                                                "whitelisting_accounts"
                                            )}
                                        />
                                    </div>
                                </div>
                            </Tab>

                            <Tab title="account.whitelist.black_by">
                                <div
                                    style={{paddingBottom: "1rem"}}
                                    className="small-12"
                                >
                                    <div>
                                        <AccountList
                                            emptyText="account.whitelist.empty_black_by"
                                            account={account}
                                            list={account.get(
                                                "blacklisting_accounts"
                                            )}
                                        />
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </div>
        );
    }
}

export default AccountWhitelist;
