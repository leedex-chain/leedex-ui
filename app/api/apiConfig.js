import {getFaucet, getTestFaucet} from "../branding";

export const rudexAPIs = {
    BASE: "https://gateway.leedex.net/api/rudex_new",
    COINS_LIST: "/coins",
    NEW_DEPOSIT_ADDRESS: "/simple-api/initiate-trade"
};

export const bep20rudexAPIs = {
    BASE: "https://gateway.leedex.net/api/rudex_new_bep20",
    COINS_LIST: "/coins",
    NEW_DEPOSIT_ADDRESS: "/simple-api/initiate-trade"
};

export const nodeRegions = [
    // region of the node follows roughly https://en.wikipedia.org/wiki/Subregion#/media/File:United_Nations_geographical_subregions.png
    "Northern Europe",
    "Western Europe",
    "Southern Europe",
    "Eastern Europe",
    "Northern Asia",
    "Western Asia",
    "Southern Asia",
    "Eastern Asia",
    "Central Asia",
    "Southeastern Asia",
    "Australia and New Zealand",
    "Melanesia",
    "Polynesia",
    "Micronesia",
    "Northern Africa",
    "Western Africa",
    "Middle Africa",
    "Eastern Africa",
    "Southern Africa",
    "Northern America",
    "Central America",
    "Caribbean",
    "South America"
];

export const settingsAPIs = {
    // If you want a location to be translated, add the translation to settings in locale-xx.js
    // and use an object {translate: key} in WS_NODE_LIST
    DEFAULT_WS_NODE: "wss://fake.automatic-selection.com",
    WS_NODE_LIST: [
        {
            url: "wss://node0.leedex.net:8980",
            region: "Western Europe",
            country: "Germany",
            location: "Hessen",
            operator: "Witness: maxirmx",
            contact: "telegram:maxi_rmx"
        },
        {
            url: "wss://node1.leedex.net:8980",
            region: "Western Europe",
            country: "Germany",
            location: "Hessen",
            operator: "Witness: maxirmx",
            contact: "telegram:maxi_rmx"
        },
        {
            url: "wss://leedex.net:8980",
            region: "Western Europe",
            country: "Germany",
            location: "Hessen",
            operator: "Witness: maxirmx",
            contact: "telegram:maxi_rmx"
        }
    ],
    ES_WRAPPER_LIST: [
        {
            url: "https://leedex.net",
            region: "Western Europe",
            country: "Germany",
            operator: "Witness: maxirmx",
            contact: "telegram:maxi_rmx"
        }
    ],
    DEFAULT_FAUCET: getFaucet().url,
    TESTNET_FAUCET: getTestFaucet().url
};
