import React from "react";
import {FormattedRelative} from "react-intl";
import {ChainStore} from "leedexjs";
import PropTypes from "prop-types";
import {Tooltip} from "bitshares-ui-style-guide";

class TimeAgo extends React.Component {
    static propTypes = {
        time: PropTypes.any.isRequired,
        chain_time: PropTypes.bool,
        component: PropTypes.element,
        className: PropTypes.string
    };

    static defaultProps = {
        chain_time: true
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.time !== this.props.time;
    }

    render() {
        let {time, chain_time} = this.props;
        var offset_mills = chain_time
            ? ChainStore.getEstimatedChainTimeOffset()
            : 0;
        if (!time) {
            return null;
        }
        if (
            typeof time === "string" &&
            time.indexOf("+") === -1 &&
            !/Z$/.test(time)
        ) {
            time += "Z";
        }

        let timePassed = Math.round(
            (new Date().getTime() - new Date(time).getTime() + offset_mills) /
                1000
        );
        let interval;

        if (timePassed < 60) {
            // 60s
            interval = 500; // 0.5s
        } else if (timePassed < 60 * 60) {
            // 1 hour
            interval = 60 * 500; // 30 seconds
        } else {
            interval = 60 * 60 * 500; // 30 minutes
        }

        return (
            <Tooltip placement="bottom" title={new Date(time).toString()}>
                <span
                    className={"tooltip inline-block " + this.props.className}
                    ref={"timeago_ttip_" + time}
                >
                    <FormattedRelative
                        updateInterval={interval}
                        value={new Date(time).getTime() + offset_mills * 0.75}
                        initialNow={Date.now()}
                    />
                </span>
            </Tooltip>
        );
    }
}

export default TimeAgo;
