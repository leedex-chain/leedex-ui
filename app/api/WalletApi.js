import {
    SerializerValidation,
    TransactionBuilder,
    TransactionHelper
} from "leedexjs";
import ApplicationApi from "./ApplicationApi";

const WalletApi = {
    new_transaction() {
        return new TransactionBuilder();
    },

    sign_and_broadcast(tr, broadcast = true) {
        SerializerValidation.required(tr, "transaction");
        return WalletDb.process_transaction(
            tr,
            null, //signer_private_key,
            broadcast
        );
    },

    /** Console print any transaction object with zero default values. */
    template(transaction_object_name) {
        let object = TransactionHelper.template(transaction_object_name, {
            use_default: true,
            annotate: true
        });
        // visual
        console.error(JSON.stringify(object, null, 4));

        // usable
        object = TransactionHelper.template(transaction_object_name, {
            use_default: true,
            annotate: false
        });
        // visual
        console.error(JSON.stringify(object));
        return object;
    },

    transfer(
        from_account_id,
        to_account_id,
        amount,
        asset,
        memo_message,
        broadcast = true,
        encrypt_memo = true,
        optional_nonce = null
    ) {
        console.error("deprecated, call application_api.transfer instead");
        return ApplicationApi.transfer({
            from_account_id,
            to_account_id,
            amount,
            asset,
            memo_message,
            broadcast,
            encrypt_memo,
            optional_nonce
        });
    }
};

export default WalletApi;
