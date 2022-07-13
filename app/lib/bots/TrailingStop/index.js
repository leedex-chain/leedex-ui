import Create from "components/Bots/TrailingStop/Create";
import State from "components/Bots/TrailingStop/State";
import Apis from "lib/bots/apis";
import Assets from "lib/bots/assets";
import BigNumber from "bignumber.js";

import BotFather from "../BotFather";

class TrailingStop extends BotFather {
    static create = Create;
    state = State;

    constructor(account, storage, initData) {
        if (initData) {
            storage.init({
                name: initData.name,
                sellAsset: initData.sellAsset,
                getAsset: initData.getAsset,
                amount: initData.amount,
                minAmount: initData.minAmount,
                percent: initData.percent
            });
        }

        //BotFather
        super(account, storage, initData);
    }

    async initStartData() {
        let state = this.storage.read();

        this.sellAsset = await Assets[state.sellAsset];
        this.getAsset = await Assets[state.getAsset];
    }

    checkOrders = async () => {
        let state = this.storage.read();
        console.log("checkOrders");

        let ticker = await Apis.db.get_ticker(
                this.getAsset.symbol,
                this.sellAsset.symbol
            ),
            price = BigNumber(ticker.latest),
            needStoploss = price.times(1 - state.percent / 100),
            createOrderPrice = price.times(1 - (state.percent * 2) / 3 / 100),
            stoploss = BigNumber(state.minAmount).div(state.amount);

        console.log(
            price.toNumber(),
            needStoploss.toNumber(),
            createOrderPrice.toNumber(),
            stoploss.toNumber()
        );

        if (needStoploss.gt(stoploss)) {
            console.log("up minAmount");
            state.minAmount = needStoploss.times(state.amount).toNumber();
            this.storage.write(state);
        } else if (createOrderPrice.lt(stoploss)) {
            console.log("create limit order");
            await this.account.sell(
                this.sellAsset.symbol,
                this.getAsset.symbol,
                state.amount,
                stoploss.toNumber()
            );
            await this.stop();
        }
    };
}

export default TrailingStop;
