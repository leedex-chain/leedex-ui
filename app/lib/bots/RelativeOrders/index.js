import Create from "components/Bots/RelativeOrders/Create";
import State from "components/Bots/RelativeOrders/State";
import Apis from "lib/bots/apis";
import Assets from "lib/bots/assets";
import BigNumber from "bignumber.js";

import BotFather from "../BotFather";

BigNumber.config({ERRORS: false});

class RelativeOrders extends BotFather {
    static create = Create;
    state = State;

    constructor(account, storage, initData) {
        if (initData) {
            storage.init({
                name: initData.name,
                defaultPrice: initData.defaultPrice
            });
        }

        //BotFather
        super(account, storage, initData);
    }

    async initStartData() {
        let state = this.storage.read();

        this.base = await Assets[state.base.asset];
        this.quote = await Assets[state.quote.asset];

        if ([this.base.issuer, this.quote.issuer].includes("1.2.0")) {
            if ([this.base.id, this.quote.id].includes("1.3.0"))
                this.getFeed = this.getCoreFeed;
            else if (this.base.issuer == this.quote.issuer)
                this.getFeed = this.getSmartFeed;
            else this.getFeed = this.getUIAFeed;
        } else {
            this.getFeed = this.getUIAFeed;
        }
    }

    checkOrders = async () => {
        let state = this.storage.read();

        this.storage.write(state);
    };
}

export default RelativeOrders;
