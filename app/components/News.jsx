import React from "react";
import counterpart from "counterpart";
import * as api_en from "steem-js-api";
import * as api_ru from "golos-lib-js";
import Translate from "react-translate-component";
import LoadingIndicator from "./LoadingIndicator";
import utils from "common/utils";
import SettingsStore from "stores/SettingsStore";
import {connect} from "alt-react";
import IntlStore from "../stores/IntlStore";

let api;

let query_func = function(locale) {
    let query = {
        select_authors: ["rudex"],
        tag: "rudex",
        limit: 20
    };
    locale == "ru" ? (query.filter_tag_masks = ["fm-"]) : query;
    return query;
};

const alignRight = {textAlign: "right"};
const alignLeft = {textAlign: "left"};
const rowHeight = {height: "2rem"};
const bodyCell = {padding: "0.5rem 1rem"};
const headerCell = {padding: "0.85rem 1rem"};

const leftCell = {...alignLeft, ...bodyCell};
const rightCell = {...alignRight, ...bodyCell};

const leftCellHeader = {...alignLeft, ...headerCell};
const rightCellHeader = {...alignRight, ...headerCell};

const secondCol = {...leftCell, width: "180px"};

const SomethingWentWrong = () => (
    <p>
        <Translate content="news.errors.fetch" />
    </p>
);

const ReusableLink = ({data, locale, url, isLink = false}) => (
    <a
        href={
            locale == "ru"
                ? `https://golos.id${url}`
                : `https://steemit.com${url}`
        }
        rel="noreferrer noopener"
        target="_blank"
        style={{display: "block"}}
        className={!isLink ? "primary-text" : "external-link"}
    >
        {utils.sanitize(data)}
    </a>
);

const NewsTable = ({data, width, locale}) => {
    return (
        <table
            className="table table-hover dashboard-table"
            style={{fontSize: "0.85rem"}}
        >
            <thead>
                <tr>
                    <th style={rightCellHeader}>
                        #
                        {/*<Translate
                        component="span"
                        content="account.votes.line"
                    />*/}
                    </th>
                    <th style={leftCellHeader}>
                        <Translate
                            component="span"
                            content="explorer.block.date"
                        />
                    </th>
                    <th style={leftCellHeader}>
                        <Translate component="span" content="news.subject" />
                    </th>
                    <th style={leftCellHeader}>
                        <Translate component="span" content="news.author" />
                    </th>
                </tr>
            </thead>
            <tbody>
                {data.map((singleNews, iter) => {
                    const theAuthor = singleNews.parentAuthor
                        ? singleNews.parentAuthor
                        : singleNews.author;

                    let formattedDate = counterpart.localize(
                        new Date(singleNews.created)
                    );

                    const smartTitle =
                        singleNews.title.length * 6 > width - 450
                            ? `${singleNews.title.slice(
                                  0,
                                  Math.floor(width - 450) / 6
                              )}...`
                            : singleNews.title;
                    return (
                        <tr key={`${singleNews.title.slice(0, 10)}${iter}`}>
                            <td style={rightCell}>
                                <ReusableLink
                                    data={iter + 1}
                                    locale={locale}
                                    url={singleNews.url}
                                />
                            </td>
                            <td style={secondCol}>
                                <ReusableLink
                                    data={formattedDate}
                                    locale={locale}
                                    url={singleNews.url}
                                />
                            </td>
                            <td style={leftCell}>
                                <ReusableLink
                                    data={smartTitle}
                                    locale={locale}
                                    url={singleNews.url}
                                    isLink
                                />
                            </td>
                            <td style={leftCell}>
                                <ReusableLink
                                    data={theAuthor}
                                    locale={locale}
                                    url={singleNews.url}
                                />
                            </td>
                        </tr>
                    );
                })}
            </tbody>
            <thead>
                <tr style={rowHeight}>
                    <th style={rightCell} />
                    <th style={leftCell} />
                    <th style={leftCell} />
                    <th style={leftCell} />
                </tr>
            </thead>
        </table>
    );
};

class News extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isWrong: false,
            discussions: [],
            width: 1200,
            currentLocale: this.props.currentLocale
        };
        this.updateDimensions = this.updateDimensions.bind(this);
        this.orderDiscussions = this.orderDiscussions.bind(this);
    }

    updateDimensions() {
        this.setState({width: window.innerWidth});
    }

    orderDiscussions(discussions) {
        const orderedDiscussions = discussions.sort(
            (a, b) => new Date(b.created) - new Date(a.created)
        );
        this.setState({discussions: orderedDiscussions, isLoading: false});
    }

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions);

        this.processUpdateNews(this.state.currentLocale);
    }

    processUpdateNews(currentLocale, oldLocale = false) {
        if (oldLocale !== false && currentLocale !== "ru" && oldLocale !== "ru")
            return false;

        this.setState({
            isLoading: true
        });

        let api = false;
        if (currentLocale == "ru") {
            api = api_ru.api;
            //api.setWebSocket("wss://api.golos.id/ws");//deprecated for new lib
            api_ru.config.set("websocket", "wss://api.golos.id/ws");

            this.setState({
                currentLocale: currentLocale
            });
        } else api = api_en.api;

        api.getDiscussionsByBlog(query_func(currentLocale))
            .then(discussions => {
                this.setState({
                    isLoading: true,
                    currentLocale: currentLocale,
                    discussions: discussions
                });

                this.orderDiscussions(discussions);
            })
            .catch(() => {
                this.setState({isLoading: false, isWrong: true});
            });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }

    UNSAFE_componentWillReceiveProps(nextProps, nextState) {
        if (
            nextProps.currentLocale !== this.props.currentLocale &&
            nextState.discussions !== this.state.discussions
        ) {
            this.processUpdateNews(
                nextProps.currentLocale,
                this.props.currentLocale
            );
        }
    }

    render() {
        const {
            isLoading,
            isWrong,
            discussions,
            width,
            currentLocale
        } = this.state;

        return (
            <div className="grid-block page-layout">
                {isLoading ? (
                    <LoadingIndicator
                        loadingText={counterpart.translate("footer.loading")}
                    />
                ) : (
                    <div className="grid-block vertical">
                        <div className="account-tabs">
                            <div className="tab-content">
                                <div className="grid-block vertical">
                                    {isWrong && <SomethingWentWrong />}
                                    {!isWrong && !isLoading && (
                                        <NewsTable
                                            width={width}
                                            data={discussions}
                                            locale={currentLocale}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

News = connect(News, {
    listenTo() {
        return [IntlStore];
    },
    getProps() {
        return {
            currentLocale: IntlStore.getState().currentLocale
        };
    }
});

export default News;
