import {Apis} from "bitsharesjs-ws";

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
        "39f5e2ede1f8bc1a3a54a7914414e3779e33193f1f5693510e73cb7a87617447"; // just for the record
    const mainnet =
        "7fcf452d6bb058949cdc875b13c8908c8f54b0f264c39faf8152b682af0740ee";

    // treat every other chain as testnet
    return Apis.instance().chain_id !== mainnet;
}

/**
 * Wallet name that is used throughout the UI and also in translations
 * @returns {string}
 */
export function getWalletName() {
    return "RuDEX";
}

/**
 * URL of this wallet
 * @returns {string}
 */
export function getWalletURL() {
    return "https://market.rudex.org";
}

/**
 * Returns faucet information
 *
 * @returns {{url: string, show: boolean}}
 */
export function getFaucet() {
    return {
        url: "https://faucet.gph.ai",
        show: true,
        editable: false,
        referrer: "blckchnd"
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
    return require("assets/logo-ico-blue.png").default;
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
        return ["TEST"];
    }
    return ["GPH", "USD", "RUDEX.BTC", "RUDEX.USDT"];
}

export function getDefaultMarket() {
    if (_isTestnet()) {
        return "USD_TEST";
    }
    return "RUDEX.BTC_RUDEX.USDT";
}

/**
 * These are the highlighted bases in "My Markets" of the exchange
 *
 * @returns {[string]}
 */
export function getMyMarketsBases() {
    if (_isTestnet()) {
        return ["TEST"];
    }
    return [
        "GPH",
        "USD",
        "RUDEX.BTC",
        "RUDEX.USDT",
        "RUDEX.BTS",
        "RUDEX.NBS",
        "RUDEX.BUSD",
        "RUDEX.BTCB"
    ];
}

/*
All trusted tokens
 */
export function get_allTokens() {
    return {
        nativeTokens: ["GPH", "USD", "EUR", "RUB", "CNY", "GOLD", "SILVER"],
        rudexTokens: [
            "DONATE",
            "DEXBOT",

            "RUDEX.BTC",
            "RUDEX.LTC",
            "RUDEX.ETH",
            "RUDEX.USDT",
            "RUDEX.EOS",
            "RUDEX.PZM",
            "RUDEX.GOLOS",
            "RUDEX.STEEM",
            "RUDEX.NBS",
            "RUDEX.XMR",
            "RUDEX.BTS",
            "RUDEX.TRX",

            "RUDEX.BNB",
            "RUDEX.BUSD",
            "RUDEX.BTCB",
            "RUDEX.DEC",
            "RUDEX.SPS"

            //RuDEX MPA-s OLD
            /*
            "RUDEX.XBS",
            "RUDEX.XBT",
            "RUDEX.RUB",
            "RUDEX.OIL",
            "RUDEX.XAU"
            */
        ],
        delistedTokens: ["RUDEX.PPY", "RUDEX.SMOKE", "RUDEX.WLS"],
        otherTokens: []
    };
}

/*
These are the default coins that are displayed with the images
 */
export function getImageName(symbol) {
    if (symbol.startsWith("RUDEX.")) return symbol;
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
        return ["TEST"];
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
        rudex: [
            //RuDEX MPA-s
            /*            "RUDEX.XBS",
            "RUDEX.XBT",
            "RUDEX.RUB",
            "RUDEX.OIL",
            "RUDEX.XAU"*/
        ]
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
        return [["USD", "TEST"]];
    }
    return [
        //GPH
        ["GPH", "USD"],
        ["GPH", "EUR"],
        ["GPH", "RUB"],
        ["GPH", "CNY"],
        ["GPH", "GOLD"],
        ["GPH", "SILVER"],

        ["GPH", "RUDEX.NBS"],
        ["GPH", "RUDEX.BTC"],
        ["GPH", "RUDEX.LTC"],
        ["GPH", "RUDEX.USDT"],
        ["GPH", "RUDEX.ETH"],
        ["GPH", "RUDEX.XMR"],
        ["GPH", "RUDEX.EOS"],
        ["GPH", "RUDEX.GOLOS"],
        ["GPH", "RUDEX.STEEM"],
        ["GPH", "RUDEX.BTS"],
        ["GPH", "RUDEX.TRX"],

        ["RUDEX.USDT", "GPH"],
        ["RUDEX.USDT", "USD"],
        ["RUDEX.USDT", "EUR"],
        ["RUDEX.USDT", "RUB"],
        ["RUDEX.USDT", "CNY"],
        ["RUDEX.USDT", "GOLD"],
        ["RUDEX.USDT", "SILVER"],

        ["RUDEX.USDT", "DONATE"],
        ["RUDEX.USDT", "DEXBOT"],
        ["RUDEX.USDT", "RUDEX.NBS"],
        ["RUDEX.USDT", "RUDEX.BTC"],
        ["RUDEX.USDT", "RUDEX.LTC"],
        ["RUDEX.USDT", "RUDEX.ETH"],
        ["RUDEX.USDT", "RUDEX.EOS"],
        ["RUDEX.USDT", "RUDEX.GOLOS"],
        ["RUDEX.USDT", "RUDEX.STEEM"],
        ["RUDEX.USDT", "RUDEX.PZM"],
        ["RUDEX.USDT", "RUDEX.XMR"],
        ["RUDEX.USDT", "RUDEX.BTS"],
        ["RUDEX.USDT", "RUDEX.TRX"],

        ["RUDEX.USDT", "RUDEX.DEC"],
        ["RUDEX.USDT", "RUDEX.SPS"],

        ["RUDEX.USDT", "RUDEX.BNB"],
        ["RUDEX.USDT", "RUDEX.BUSD"],
        ["RUDEX.USDT", "RUDEX.BTCB"],

        //Delisted
        //["RUDEX.USDT", "RUDEX.PPY"],
        //["RUDEX.USDT", "RUDEX.SMOKE"],
        //["RUDEX.USDT", "RUDEX.WLS"],

        //RuDEX MPA (old)
        /*        ["RUDEX.USDT", "RUDEX.XBS"],
                ["RUDEX.USDT", "RUDEX.XBT"],
                ["RUDEX.USDT", "RUDEX.OIL"],
                ["RUDEX.USDT", "RUDEX.XAU"],
                ["RUDEX.USDT", "RUDEX.RUB"],
         */

        //Bitcoin
        //["RUDEX.BTC", "DONATE"],

        ["RUDEX.BTC", "GPH"],
        ["RUDEX.BTC", "RUDEX.LTC"],
        ["RUDEX.BTC", "RUDEX.ETH"],
        ["RUDEX.BTC", "RUDEX.XMR"],
        ["RUDEX.BTC", "RUDEX.EOS"],
        ["RUDEX.BTC", "RUDEX.GOLOS"],
        ["RUDEX.BTC", "RUDEX.STEEM"],
        ["RUDEX.BTC", "RUDEX.BTS"],
        ["RUDEX.BTC", "RUDEX.TRX"],

        ["RUDEX.BTC", "RUDEX.BNB"],
        ["RUDEX.BTC", "RUDEX.BTCB"],

        //["RUDEX.BTC", "RUDEX.PPY"],
        //["RUDEX.BTC", "RUDEX.SMOKE"],
        //["RUDEX.BTC", "RUDEX.WLS"],

        //["RUDEX.BTC", "RUDEX.LOTTERY"],
        //["RUDEX.BTC", "RUBLE"],
        //["RUDEX.BTC", "RUDEX.XBT"] //MPA

        //Bitshares
        ["RUDEX.BTS", "GPH"],
        ["RUDEX.BTS", "RUDEX.NBS"],
        ["RUDEX.BTS", "RUDEX.BTC"],
        ["RUDEX.BTS", "RUDEX.LTC"],
        ["RUDEX.BTS", "RUDEX.USDT"],
        ["RUDEX.BTS", "RUDEX.ETH"],
        ["RUDEX.BTS", "RUDEX.XMR"],
        ["RUDEX.BTS", "RUDEX.EOS"],
        ["RUDEX.BTS", "RUDEX.GOLOS"],
        ["RUDEX.BTS", "RUDEX.STEEM"],
        ["RUDEX.BTS", "RUDEX.TRX"],

        //Delisted
        //["RUDEX.BTS", "RUDEX.PPY"],
        //["RUDEX.BTS", "RUDEX.SMOKE"],
        //["RUDEX.BTS", "RUDEX.WLS"],

        //NewBitshares
        ["RUDEX.NBS", "GPH"],
        ["RUDEX.NBS", "RUDEX.USDT"],
        ["RUDEX.NBS", "RUDEX.EOS"],
        ["RUDEX.NBS", "RUDEX.BTS"],
        ["RUDEX.NBS", "RUDEX.TRX"],
        ["RUDEX.NBS", "RUDEX.LTC"],
        ["RUDEX.NBS", "RUDEX.GOLOS"],

        //gpUSD
        ["USD", "GPH"],
        ["USD", "EUR"],
        ["USD", "RUB"],
        ["USD", "CNY"],
        ["USD", "GOLD"],
        ["USD", "SILVER"],

        ["USD", "RUDEX.USDT"],
        ["USD", "RUDEX.PZM"],
        ["USD", "RUDEX.BUSD"],

        //RUDEX.BUSD
        ["RUDEX.BUSD", "GPH"],
        ["RUDEX.BUSD", "USD"],
        //["RUDEX.BUSD", "EUR"],
        //["RUDEX.BUSD", "RUB"],
        //["RUDEX.BUSD", "CNY"],
        //["RUDEX.BUSD", "GOLD"],
        //["RUDEX.BUSD", "SILVER"],

        ["RUDEX.BUSD", "RUDEX.BTCB"],
        ["RUDEX.BUSD", "RUDEX.USDT"],
        ["RUDEX.BUSD", "RUDEX.DEC"],
        ["RUDEX.BUSD", "RUDEX.SPS"],
        ["RUDEX.BUSD", "RUDEX.GOLOS"],

        //RUDEX.BTCB
        ["RUDEX.BTCB", "RUDEX.BTC"],
        ["RUDEX.BTCB", "RUDEX.STEEM"],
        ["RUDEX.BTCB", "RUDEX.GOLOS"],
        ["RUDEX.BTCB", "RUDEX.XMR"]
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
    return ["RUDEX."];
}

/**
 * These namespaces will be hidden to the user, this may include "bit" for gpAssets
 * @returns {[string,string]}
 */
export function getAssetHideNamespaces() {
    // e..g "RUDEX.", "gp"
    return ["RUDEX."];
}

/**
 * Allowed gateways that the user will be able to choose from in Deposit Withdraw modal
 * @param gateway
 * @returns {boolean}
 */
export function allowedGateway(gateway) {
    const allowedGateways = ["RUDEX", "RUDEX_BEP20"];
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
        assetSymbol = "RUDEX";
    }
    // explanation will be parsed out of the asset description (via split)
    return {
        symbol: assetSymbol,
        explanation:
            "This asset is used for decentralized configuration of the RuDEX UI placed under https://market.rudex.org/."
    };
}

/**
 * The featured coins displayed on the Listing page of the UI
 *
 * @returns {[{[string]:[string]}]}
 */
export function getListingCoins() {
    return [
        //soon: true, (for TON example)
        {
            name: "Idena",
            ticker: "DNA",
            page: "https://www.idena.io",
            account: "rudex-idena",
            goal: 10000,
            votes: 0
        },
        {
            name: "Zcash",
            ticker: "ZEC",
            page: "https://z.cash/",
            account: "rudex-zec",
            goal: 2000,
            votes: 0
        },
        {
            name: "ADAMANT Messenger",
            ticker: "ADM",
            page: "https://adamant.im",
            account: "rudex-adamant",
            goal: 8000,
            votes: 0
        },
        {
            name: "Hive",
            ticker: "HIVE",
            page: "https://hive.io",
            account: "rudex-hive",
            goal: 3000,
            votes: 0
        },
        {
            name: "Minter Network",
            ticker: "BIP",
            page: "https://minter.org",
            account: "rudex-bip",
            goal: 7000,
            votes: 0
        },
        {
            name: "Dash",
            ticker: "DASH",
            page: "https://www.dash.org",
            account: "rudex-dash",
            goal: 2000,
            votes: 0
        },
        {
            name: "Dogecoin",
            ticker: "DOGE",
            page: "https://dogecoin.com",
            account: "rudex-dogecoin",
            goal: 2000,
            votes: 0
        },
        {
            name: "Telos",
            ticker: "TLOS",
            page: "https://www.telos.net",
            account: "rudex-telos",
            goal: 3000,
            votes: 0
        },
        {
            name: "Ark",
            ticker: "ARK",
            page: "https://ark.io",
            account: "rudex-ark",
            goal: 3000,
            votes: 0
        },
        {
            name: "Crypto International",
            page: "https://cri.network",
            ticker: "CRI",
            account: "rudex-cri",
            goal: 10000,
            votes: 0
        },
        {
            name: "Gowin",
            ticker: "GWN",
            page: "http://www.gwncoin.com",
            account: "rudex-gwn",
            goal: 5000,
            votes: 0
        },
        {
            name: "Ratcoin",
            ticker: "RAT",
            page: "https://ratcoin.network",
            account: "rudex-ratcoin",
            goal: 10000,
            votes: 0
        },
        {
            name: "WorldTTT",
            ticker: "TTT",
            page: "https://worldttt.com",
            account: "rudex-ttt",
            goal: 10000,
            votes: 0
        },
        {
            name: "Clean the World",
            ticker: "CTW",
            page: "https://www.clean-the-world-official.com",
            account: "rudex-ctw",
            goal: 5000,
            votes: 0
        },
        {
            name: "WaterCoin Acua",
            ticker: "WCA",
            page: "https://watercoinacua.com",
            account: "rudex-wca",
            goal: 5000,
            votes: 0
        },
        {
            name: "Camino Token",
            ticker: "CAMINO",
            page: "https://www.caminotoken.com",
            account: "rudex-camino",
            goal: 5000,
            votes: 0
        },
        {
            name: "OJA Coin",
            ticker: "OJX",
            page: "https://ojacoin.org",
            account: "rudex-ojx",
            goal: 10000,
            votes: 0
        },
        {
            name: "GoDonr",
            ticker: "Donr",
            page: "https://godonr.com/home",
            account: "rudex-donr",
            goal: 5000,
            votes: 0
        }

        //Disabled
        /*
                {
                    name: "Waves",
                    ticker: "WAVES",
                    page: "https://waves.exchange",
                    account: "rudex-waves",
                    goal: 10000,
                    votes: 0
                },
                {
                    name: "Neo",
                    ticker: "NEO",
                    page: "https://neo.org",
                    account: "rudex-neo",
                    goal: 10000,
                    votes: 0
                },
                {
                    name: "Revain",
                    ticker: "REV",
                    page: "http://revain.org",
                    account: "rudex-revain",
                    goal: 10000,
                    votes: 0
                },*/

        //Already Listed
        /*        {
                    name: "Litecoin",
                    ticker: "LTC",
                    page: "https://litecoin.org",
                    account: "rudex-litecoin",
                    goal: 2000,
                    votes: 0
                },
                {
                    name: "Monero",
                    ticker: "XMR",
                    account: "rudex-monero",
                    goal: 5000,
                    votes: 0
                },*/
    ];
}

export function getListedCoins() {
    return [
        {
            name: "PRIZM",
            ticker: "PZM",
            page: "https://pzm.space",
            account: "rudex-prizm",
            goal: 10000,
            votes: 0
        }
    ];
}
