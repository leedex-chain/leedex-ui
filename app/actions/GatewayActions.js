import alt from "alt-instance";
import {
    fetchCoins,
    fetchCoinsSimple,
    getBackedCoins,
    getActiveWallets
} from "common/gatewayMethods";
import {blockTradesAPIs} from "api/apiConfig";
import {getOnChainConfig} from "../lib/chain/onChainConfig";

let inProgress = {};

const GATEWAY_TIMEOUT = 10000;

const onGatewayTimeout = (dispatch, gateway) => {
    dispatch({down: gateway});
};

class GatewayActions {
    fetchCoins({
        backer = "LEEDEX",
        url = undefined,
        urlBridge = undefined,
        urlWallets = undefined
    } = {}) {
        if (!inProgress["fetchCoins_" + backer]) {
            inProgress["fetchCoins_" + backer] = true;
            return dispatch => {
                let fetchCoinsTimeout = setTimeout(
                    onGatewayTimeout.bind(null, dispatch, backer),
                    GATEWAY_TIMEOUT
                );
                Promise.all([fetchCoins(url), getActiveWallets(urlWallets)])
                    .then(result => {
                        clearTimeout(fetchCoinsTimeout);
                        delete inProgress["fetchCoins_" + backer];
                        let [coins, wallets] = result;
                        let backedCoins = getBackedCoins({
                            allCoins: coins,
                            backer: backer
                        }).filter(a => !!a.walletType);
                        backedCoins.forEach(a => {
                            a.isAvailable =
                                wallets.indexOf(a.walletType) !== -1;
                        });
                        dispatch({
                            coins,
                            backedCoins,
                            backer
                        });
                    })
                    .catch(() => {
                        clearTimeout(fetchCoinsTimeout);
                        delete inProgress["fetchCoins_" + backer];
                        dispatch({
                            coins: [],
                            backedCoins: [],
                            backer
                        });
                    });
            };
        } else {
            return {};
        }
    }

    fetchCoinsSimple({backer = "LEEDEX", url = undefined} = {}) {
        if (!inProgress["fetchCoinsSimple_" + backer]) {
            inProgress["fetchCoinsSimple_" + backer] = true;
            return dispatch => {
                let fetchCoinsTimeout = setTimeout(
                    onGatewayTimeout.bind(null, dispatch, backer),
                    GATEWAY_TIMEOUT
                );
                fetchCoinsSimple(url)
                    .then(coins => {
                        clearTimeout(fetchCoinsTimeout);
                        delete inProgress["fetchCoinsSimple_" + backer];
                        dispatch({
                            coins: coins,
                            backer
                        });
                    })
                    .catch(() => {
                        clearTimeout(fetchCoinsTimeout);
                        delete inProgress["fetchCoinsSimple_" + backer];

                        dispatch({
                            coins: [],
                            backer
                        });
                    });
            };
        } else {
            return {};
        }
    }

    temporarilyDisable({backer}) {
        return dispatch => {
            dispatch({backer});
        };
    }

    loadOnChainGatewayConfig() {
        return dispatch => {
            // fixme: access to onchain config should be cut out into a separate store or similar, this is abusing gatewaystore for a quick fix
            getOnChainConfig().then(config => dispatch(config));
        };
    }
}

export default alt.createActions(GatewayActions);
