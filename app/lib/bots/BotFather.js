import {ChainStore} from "leedexjs";
import Account from "/app/lib/bots/account";
import SettingsActions from "/app/actions/SettingsActions";
import WalletUnlockActions from "/app/actions/WalletUnlockActions";

/*/
    Bot progenitor:
        3 required methods for create new bots:
            - constructor
            - initStartData
            - checkOrders
 */
class BotFather {
    static create = null;
    state = null;

    constructor(account, storage, initData) {
        if (initData) {
            /*storage.init({
                name: initData.name,
                defaultPrice: initData.defaultPrice
            });*/
        }

        this.account = new Account(account);
        this.storage = storage;

        this.name = storage.read().name;

        this.logger = console;
        this.queueEvents = Promise.resolve();
        this.run = false;
    }

    async initStartData() {
        //Example
        /*
        let state = this.storage.read();

        this.base = await Assets[state.base];
        this.quote = await Assets[state.quote];
        */
    }

    //Here Logic - Change for new strategy
    async checkOrders() {
        let state = this.storage.read();
        console.log("checkOrders");

        //Strategy
        //...
    }

    //=============================================
    //Common Methods
    //=============================================

    async start() {
        await this.initStartData();

        await WalletUnlockActions.unlock();
        SettingsActions.changeSetting({
            setting: "walletLockTimeout",
            value: 0
        });

        ChainStore.subscribe(this.queue);
        this.run = true;
    }

    async stop() {
        ChainStore.unsubscribe(this.queue);
        this.run = false;
        await this.queueEvents;
    }

    /*
        See SpreadTrade or PercentUp  delete() to:
            to implement a general method for deleting orders for all inherited bots , taking into account the internal data structure
     */
    async delete() {
        this.storage.delete();
    }

    queue = () => {
        this.queueEvents = this.queueEvents
            .then(this.checkOrders)
            .catch(this.logger.error.bind(this.logger));
    };
}

export default BotFather;
