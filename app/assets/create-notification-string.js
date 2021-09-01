function createNotifcationString() {
    // may contain links, must start with http and be ended with "!"
    var jsonObject = {
        notifications: [
            {
                type: "warning",
                begin_date: "15.08.2021",
                end_date: "31.12.2025",
                content:
                    "Please be aware of scam attempts using Proposed Transactions in your Dashboard. Never approve a proposal if you are not expecting one!"
            },
            {
                type: "critical",
                begin_date: "15.08.2021",
                end_date: "31.12.2025",
                content:
                    "WARNING: Users of the Graphene blockchain, DO NOT ACCEPT suspicious offers to trade tokens on private markets or tokens that are not listed in Withdrawals section of the Wallet UI or in default market pairs."
            }
        ],
        blacklists: {
            assets: [],
            accounts: []
        }
    };
    // has to coincide with branding.js/getConfigurationAsset().explanation
    var explanation =
        "This asset is used for decentralized configuration of the Graphene UI placed under gph.ai";
    var assetDescriptionString =
        explanation + "\n" + JSON.stringify(jsonObject, null, 2);
    console.log(assetDescriptionString);
    return assetDescriptionString;
}

createNotifcationString();
