import alt from "alt-instance";
import IntlActions from "actions/IntlActions";
import SettingsActions from "actions/SettingsActions";
import SettingsStore from "stores/SettingsStore";
import counterpart from "counterpart";

var locale_en = require("assets/locales/locale-en.json");
var locale_ru = require("assets/locales/locale-ru.json");
import ls from "common/localStorage";

let ss = ls("__graphene__");

//counterpart.registerTranslations("en", locale_en);
//counterpart.setFallbackLocale("en");

let localeFirstLoad = SettingsStore.getState().settings.get("locale");
console.log("localeFirstLoad: " + localeFirstLoad);

import {addLocaleData} from "react-intl";

import localeCodes from "assets/locales";
for (let localeCode of localeCodes) {
    addLocaleData(require(`react-intl/locale-data/${localeCode}`));
}

counterpart.registerTranslations("ru", require("counterpart/locales/ru"));
counterpart.registerTranslations("en", require("counterpart/locales/en"));

if (localeFirstLoad === "ru") {
    counterpart.registerTranslations("ru", locale_ru);
    counterpart.setFallbackLocale("ru");
} else if (localeFirstLoad === "en") {
    counterpart.registerTranslations("en", locale_en);
    counterpart.setFallbackLocale("en");
} else {
    counterpart.registerTranslations(
        localeFirstLoad,
        IntlActions.switchLocale(localeFirstLoad)
    );
}

class IntlStore {
    constructor() {
        const storedSettings = ss.get("settings_v4", {});
        if (storedSettings.locale === undefined) {
            storedSettings.locale = this.getDefaultLocale();
        }
        this.currentLocale = storedSettings.locale;

        //this.locales = ["en"];
        this.locales = localeCodes;
        this.localesObject = {
            en: locale_en,
            ru: locale_ru
        };

        this.bindListeners({
            onSwitchLocale: IntlActions.switchLocale,
            onGetLocale: IntlActions.getLocale,
            onClearSettings: SettingsActions.clearSettings
        });
    }

    hasLocale(locale) {
        return this.locales.indexOf(locale) !== -1;
    }

    getCurrentLocale() {
        return this.currentLocale;
    }

    onSwitchLocale({locale, localeData}) {
        switch (locale) {
            case "en":
                counterpart.registerTranslations("en", this.localesObject.en);
                break;

            default:
                counterpart.registerTranslations(locale, localeData);
                break;
        }

        counterpart.setLocale(locale);
        this.currentLocale = locale;
    }

    onGetLocale(locale) {
        if (this.locales.indexOf(locale) === -1) {
            this.locales.push(locale);
        }
    }

    onClearSettings() {
        this.onSwitchLocale({locale: "en"});
    }

    getDefaultLocale() {
        let supportedLocales = [
            "en",
            "cn",
            "fr",
            "ko",
            "de",
            "es",
            "it",
            "tr",
            "ru",
            "ja"
        ];

        let fallbackLocales = {
            uk: "ru",
            be: "ru",
            uz: "ru",
            kz: "ru"
        };

        let defaultLocale = "en";
        let userLanguage = navigator.language || navigator.userLanguage;

        for (let i = 0; i < supportedLocales.length; i++) {
            if (userLanguage.startsWith(supportedLocales[i])) {
                defaultLocale = supportedLocales[i];
                break;
            }
        }

        let fallbackKeys = Object.keys(fallbackLocales);
        for (let i = 0; i < fallbackKeys.length; i++) {
            if (userLanguage.startsWith(fallbackKeys[i])) {
                defaultLocale = fallbackLocales[fallbackKeys[i]];
                break;
            }
        }

        return defaultLocale;
    }
}

export default alt.createStore(IntlStore, "IntlStore");
