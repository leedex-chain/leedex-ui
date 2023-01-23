import {Apis} from "leedexjs-ws";

/** This file centralized customization and branding efforts throughout the whole wallet and is meant to facilitate
 *  the process.
 *
 *  @author Stefan Schiessl <stefan.schiessl@blockchainprojectsbv.com>
 */

/**
 * Determine if we are running on testnet or mainnet
 * @private
 */
function _isTestnet() {
    const testnet =
        //        "39f5e2ede1f8bc1a3a54a7914414e3779e33193f1f5693510e73cb7a87617447"; // just for the record
        " -- no test net --"; // just for the record
    const mainnet =
        "da4a4872f96da5a9c8cf694c5b8344b5a7a3b24218ad90eba4b148897cf4ed23";
    // treat every other chain as testnet
    return Apis.instance().chain_id !== mainnet;
}

/**
 * Wallet name that is used throughout the UI and also in translations
 * @returns {string}
 */
export function getWalletName() {
    return "LEEDEX";
}

/**
 * URL of this wallet
 * @returns {string}
 */
export function getWalletURL() {
    return "https://leedex.net";
}

/**
 * Returns faucet information
 *
 * @returns {{url: string, show: boolean}}
 */
export function getFaucet() {
    return {
        url: "https://leedex.net",
        show: true,
        editable: false,
        referrer: "maxirmx"
    };
}

export function getTestFaucet() {
    // fixme should be solved by introducing _isTestnet into getFaucet and fixing the mess in the Settings when fetching faucet address
    return {
        url: "https://....", // operated as a contribution by Graphene
        show: true,
        editable: false
    };
}

/**
 * Logo that is used throughout the UI
 * @returns {*}
 */
export function getLogo() {
    return require("assets/logo-is-coming.png").default;
}

/**
 * Default set theme for the UI
 * @returns {string}
 */
export function getDefaultTheme() {
    // possible ["darkTheme", "lightTheme", "midnightTheme"]
    return "lightTheme";
}

/**
 * Default login method. Either "password" (for cloud login mode) or "wallet" (for local wallet mode)
 * @returns {string}
 */
export function getDefaultLogin() {
    // possible: one of "password", "wallet"
    return "password";
}

/**
 * Default units used by the UI
 *
 * @returns {[string,string,string,string,string,string]}
 */
export function getUnits() {
    if (_isTestnet()) {
        return ["LD_TEST"];
    }
    return ["LD", "USD", "LEEDEX.USDT", "LEEDEX.BTC"];
}

export function getDefaultMarket() {
    if (_isTestnet()) {
        return "USD_TEST";
    }
    return "LEEDEX.USDT_LD";
}

/**
 * These are the highlighted bases in "My Markets" of the exchange
 *
 * @returns {[string]}
 */
export function getMyMarketsBases() {
    if (_isTestnet()) {
        return ["LD_TEST"];
    }
    return ["LD", "USD", "LEEDEX.BTC", "LEEDEX.USDT"];
}

/*
All trusted tokens
 */
export function get_allTokens() {
    return {
        nativeTokens: ["LD"], //, "USD", "EUR", "RUB", "CNY", "GOLD", "SILVER"],
        leedexTokens: [
            //            "DONATE",
            //            "DEXBOT",
            "LEEDEX.USDT",
            //            "LEEDEX.ETH",
            //            "LEEDEX.TRX",
            //            "LEEDEX.BUSD",
            //            "LEEDEX.LIME",
            "LEEDEX.BTC"
        ],
        delistedTokens: [],
        otherTokens: []
    };
}

/*
    These are the default coins that are displayed with the images
 */
export function getImageName(symbol) {
    if (symbol.startsWith("LEEDEX.")) return symbol;
    if (
        get_allTokens().nativeTokens.indexOf(symbol) !== -1 ||
        symbol == "DONATE" ||
        symbol == "DEXBOT"
    )
        return symbol;

    return "unknown";

    //let imgName = symbol.split(".");
    //return imgName.length === 2 ? imgName[1] : imgName[0];
}

/**
 * These are the default quotes that are shown after selecting a base
 *
 * @returns {[string]}
 */
export function getMyMarketsQuotes(delisted = false) {
    if (_isTestnet()) {
        return ["LD_TEST"];
    }
    let tokens = get_allTokens();
    let allTokens = [];
    for (let type in tokens) {
        if (delisted !== true && type == "delistedTokens") continue;
        allTokens = allTokens.concat(tokens[type]);
    }
    return allTokens;
}

/**
 * MPA-s for show (order) in Collaterals in Account Portfolio
 * @returns {*}
 */
export function getGroupedMPAsRuDEX() {
    let tokens = {
        listed: [],
        rudex: []
    };

    return tokens;
}

/**
 * The featured markets displayed on the landing page of the UI
 *
 * @returns {list of string tuples}
 */
export function getFeaturedMarkets(quotes = []) {
    if (_isTestnet()) {
        return [["USD", "LD_TEST"]];
    }
    return [
        //        ["LD", "USD"],
        //        ["LD", "EUR"],
        //        ["LD", "RUB"],
        //        ["LD", "CNY"],
        //        ["LD", "GOLD"],
        //        ["LD", "SILVER"],
        ["LD", "LEEDEX.USDT"],
        ["LD", "LEEDEX.BTC"],
        //        ["LD", "LEEDEX.ETH"],
        //        ["LD", "LEEDEX.TRX"],
        //        ["LD", "LEEDEX.LIME"],

        ["LEEDEX.USDT", "LD"],
        //        ["LEEDEX.USDT", "USD"],
        //        ["LEEDEX.USDT", "EUR"],
        //        ["LEEDEX.USDT", "RUB"],
        //        ["LEEDEX.USDT", "CNY"],
        //        ["LEEDEX.USDT", "GOLD"],
        //        ["LEEDEX.USDT", "SILVER"],
        ["LEEDEX.USDT", "LEEDEX.BTC"],
        //        ["LEEDEX.USDT", "LEEDEX.ETH"],
        //        ["LEEDEX.USDT", "LEEDEX.TRX"],
        //        ["LEEDEX.USDT", "LEEDEX.LIME"],
        //        ["LEEDEX.USDT", "LEEDEX.BUSD"],

        ["LEEDEX.BTC", "LD"],
        ["LEEDEX.BTC", "LEEDEX.USDT"]
    ].filter(a => {
        if (!quotes.length) return true;
        return quotes.indexOf(a[0]) !== -1;
    });
}

/**
 * Recognized namespaces of assets
 *
 * @returns {[string,string,string,string,string,string,string]}
 */
export function getAssetNamespaces() {
    if (_isTestnet()) {
        return [];
    }
    return ["LEEDEX."];
}

/**
 * These namespaces will be hidden to the user, this may include "bit" for gpAssets
 * @returns {[string,string]}
 */
export function getAssetHideNamespaces() {
    // e..g "RUDEX.", "gp"
    return ["LEEDEX."];
}

/**
 * Allowed gateways that the user will be able to choose from in Deposit Withdraw modal
 * @param gateway
 * @returns {boolean}
 */
export function allowedGateway(gateway) {
    //    const allowedGateways = ["RUDEX", "RUDEX_BEP20"];
    const allowedGateways = [];
    if (!gateway) {
        // answers the question: are any allowed?
        return allowedGateways.length > 0;
    }
    return allowedGateways.indexOf(gateway) >= 0;
}

export function getSupportedLanguages() {
    // not yet supported
}

export function getAllowedLogins() {
    // possible: list containing any combination of ["password", "wallet"]
    return ["password", "wallet"];
}

export function getConfigurationAsset() {
    let assetSymbol = null;
    if (_isTestnet()) {
        assetSymbol = "NOTIFICATIONS";
    } else {
        assetSymbol = "LEEDEX";
    }
    // explanation will be parsed out of the asset description (via split)
    return {
        symbol: assetSymbol,
        explanation:
            "This asset is used for decentralized configuration of the LEEDEX UI placed under https://leedex.net/."
    };
}

/**
 * The featured coins displayed on the Listing page of the UI
 *
 * @returns {[{[string]:[string]}]}
 */
export function getListingCoins() {
    return [];
}

export function getListedCoins() {
    return [];
}
