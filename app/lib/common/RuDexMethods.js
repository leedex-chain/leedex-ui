import ls from "./localStorage";
import {rudexAPIs, bep20rudexAPIs} from "api/apiConfig";
const rudexStorage = ls("");

export function fetchCoinList(url = rudexAPIs.BASE + rudexAPIs.COINS_LIST) {
    return fetch(url, {method: "post"})
        .then(reply =>
            reply.json().then(result => {
                return result;
            })
        )
        .catch(err => {
            console.log("error fetching leedex list of coins", err, url);
        });
}

export function requestDepositAddress({
    walletType,
    inputCoinType,
    outputCoinType,
    outputAddress,
    //url = rudexAPIs.BASE,
    url = rudexAPIs,
    stateCallback
}) {
    let body = {
        walletType,
        inputCoinType,
        outputCoinType,
        outputAddress
    };

    let body_string = JSON.stringify(body);

    console.log("walletType: " + walletType);

    if (walletType === "bsc-tokens") {
        url = bep20rudexAPIs;
    }

    //fetch(url + rudexAPIs.NEW_DEPOSIT_ADDRESS, {
    fetch(url.BASE + url.NEW_DEPOSIT_ADDRESS, {
        method: "post",
        headers: new Headers({
            Accept: "application/json",
            "Content-Type": "application/json"
        }),
        body: body_string
    })
        .then(
            reply => {
                reply.json().then(
                    json => {
                        // console.log( "reply: ", json )
                        let address = {
                            address: json.inputAddress || "unknown",
                            memo: json.inputMemo,
                            error: json.error || null
                        };
                        if (stateCallback) stateCallback(address);
                    },
                    error => {
                        // console.log( "error: ",error  );
                        if (stateCallback)
                            stateCallback({address: "unknown", memo: null});
                    }
                );
            },
            error => {
                // console.log( "error: ",error  );
                if (stateCallback)
                    stateCallback({address: "unknown", memo: null});
            }
        )
        .catch(err => {
            console.log("fetch error:", err);
        });
}

export function validateAddress({
    //url = rudexAPIs.BASE,
    url = rudexAPIs,
    walletType,
    newAddress
}) {
    if (walletType === "bsc-tokens") {
        url = bep20rudexAPIs;
    }

    if (!newAddress) return new Promise(res => res());
    return fetch(url.BASE + "/wallets/" + walletType + "/check-address", {
        method: "post",
        headers: new Headers({
            Accept: "application/json",
            "Content-Type": "application/json"
        }),
        body: JSON.stringify({address: newAddress})
    })
        .then(reply => reply.json().then(json => json))
        .catch(err => {
            console.log("validate error:", err);
        });
}

function hasWithdrawalAddress(wallet) {
    return rudexStorage.has(`history_address_${wallet}`);
}

function setWithdrawalAddresses({wallet, addresses}) {
    rudexStorage.set(`history_address_${wallet}`, addresses);
}

function getWithdrawalAddresses(wallet) {
    return rudexStorage.get(`history_address_${wallet}`, []);
}

function setLastWithdrawalAddress({wallet, address}) {
    rudexStorage.set(`history_address_last_${wallet}`, address);
}

function getLastWithdrawalAddress(wallet) {
    return rudexStorage.get(`history_address_last_${wallet}`, "");
}

export const WithdrawAddresses = {
    has: hasWithdrawalAddress,
    set: setWithdrawalAddresses,
    get: getWithdrawalAddresses,
    setLast: setLastWithdrawalAddress,
    getLast: getLastWithdrawalAddress
};
