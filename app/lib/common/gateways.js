/**
 * Settings storage for all Gateway Services
 * General API Settings are stored in api/apiConfig and should be imported here
 */

import {rudexAPIs, bep20rudexAPIs} from "api/apiConfig";
import {allowedGateway} from "branding";
import {isGatewayTemporarilyDisabled} from "../chain/onChainConfig";
import SettingsStore from "stores/SettingsStore";

const _isEnabled = gatewayKey => {
    return async function(options = {}) {
        if (__DEV__) {
            console.log("Checking " + gatewayKey + " gateway ...");
        }
        if (!options.onlyOnChainConfig) {
            // is the gateway configured in branding?
            const setInBranding = allowedGateway(gatewayKey);
            if (!setInBranding) {
                if (__DEV__) {
                    console.log("  ... disabled in branding.js");
                }
                return false;
            } else {
                if (!!options.onlyBranding) {
                    if (__DEV__) {
                        console.log("  ... may be used!");
                    }
                    return true;
                }
            }
        }
        // is it deactivated on-chain?
        const temporarilyDisabled = await isGatewayTemporarilyDisabled(
            gatewayKey
        );
        if (temporarilyDisabled) {
            if (__DEV__) {
                console.log("  ... disabled on-chain");
            }
            return false;
        } else {
            if (!!options.onlyOnChainConfig) {
                if (__DEV__) {
                    console.log("  ... may be used!");
                }
                return true;
            }
        }
        // has the user filtered it out?
        let filteredServiceProviders = SettingsStore.getState().settings.get(
            "filteredServiceProviders",
            []
        );
        if (!filteredServiceProviders) {
            filteredServiceProviders = [];
        }
        let userAllowed = false;
        if (
            filteredServiceProviders.length == 1 &&
            filteredServiceProviders[0] == "all"
        ) {
            userAllowed = true;
        } else {
            userAllowed = filteredServiceProviders.indexOf(gatewayKey) >= 0;
        }
        if (!userAllowed) {
            if (__DEV__) {
                console.log("  ... disabled by user");
            }
            return false;
        }
        if (__DEV__) {
            console.log("  ... may be used!");
        }
        return true;
    };
};

export const availableGateways = {
    LEEDEX: {
        id: "LEEDEX",
        name: "COINS (Native Chains)",
        baseAPI: rudexAPIs,
        isEnabled: _isEnabled("LEEDEX"),
        isSimple: true,
        selected: false,
        simpleAssetGateway: true,
        fixedMemo: {
            prepend_default: "dex:",
            prepend_btsid: "gphid",
            append: ""
        },
        addressValidatorMethod: "POST",
        options: {
            enabled: false,
            selected: false
        },
        landing: "https://leedex.net/",
        wallet: "https://market.leedex.net/"
    },
    LEEDEX_BEP20: {
        id: "LEEDEX_BEP20",
        name: "Binance Smart Chain (BEP-20 tokens)",
        baseAPI: bep20rudexAPIs,
        isEnabled: _isEnabled("LEEDEX_BEP20"),
        isSimple: true,
        selected: false,
        simpleAssetGateway: true,
        fixedMemo: {
            prepend_default: "dex:",
            prepend_btsid: "gphid",
            append: ""
        },
        addressValidatorMethod: "POST",
        options: {
            enabled: false,
            selected: false
        },
        landing: "https://leedex.net/",
        wallet: "https://market.leedex.net/"
    }
};

export const availableBridges = {
    /*    TRADE: {
        id: "TRADE",
        name: "Blocktrades",
        isEnabled: _isEnabled("TRADE"),
        landing: "https://blocktrades.us"
    }*/
};

export const gatewayPrefixes = Object.keys(availableGateways);

export function getPossibleGatewayPrefixes(bases) {
    return gatewayPrefixes.reduce((assets, prefix) => {
        bases.forEach(a => {
            assets.push(`${prefix}.${a}`);
        });
        return assets;
    }, []);
}

export default availableGateways;
