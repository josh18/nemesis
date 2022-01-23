import React, { Component, createContext, createRef, Fragment } from 'react';
import classNames from 'classnames';

import throttle from '../../utils/throttle';
import Icon from '../../elements/icon/icon';

import './notification.less';

const NotificationContext = createContext();

export class Notification extends Component {
    messageElement = createRef();
    notificationElement = createRef();
    resizeListener = throttle(::this.handleResize);
    state = {}

    constructor(props) {
        super(props);

        const that = this;
        this.contextValue = {
            close: ::that.handleClose,
            notify: ::that.handleNotify
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.resizeListener);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeListener);
        this.resetTimer();
    }

    handleResize() {
        if (this.state.active) {
            this.transitionSize;
        }
    }

    resetTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    transitionSize = () => {
        function getWidth(element) {
            return Math.ceil(element.getBoundingClientRect().width) + 'px';
        }

        function getHeight(element) {
            return Math.ceil(element.getBoundingClientRect().height) + 'px';
        }

        const notificationElement = this.notificationElement.current;
        const messageElement = this.messageElement.current;

        const originalWidth = getWidth(notificationElement);
        const originalHeight = getHeight(notificationElement);

        notificationElement.style.width = '';
        notificationElement.style.height = '';

        messageElement.style.width = '';
        messageElement.style.height = '';

        messageElement.style.width = getWidth(messageElement);
        messageElement.style.height = getHeight(messageElement);

        const newWidth = getWidth(notificationElement);
        const newHeight = getHeight(notificationElement);

        notificationElement.style.width = originalWidth;
        notificationElement.style.height = originalHeight;

        // Force reflow
        window.getComputedStyle(notificationElement).opacity;

        notificationElement.style.width = newWidth;
        notificationElement.style.height = newHeight;
    }

    handleNotify(newNotification) {
        const notification = {
            message: newNotification.message,
            loading: newNotification.loading,
            type: newNotification.type ? newNotification.type : 'normal'
        };

        const state = {
            notification
        };

        if (!this.state.active) {
            state.active = true;
            state.transitionIn = true;
        }

        this.setState(state);

        this.resetTimer();

        if (!notification.loading && notification.type !== 'failure') {
            this.timer = setTimeout(() => {
                this.handleClose();
            }, 10000); // 10 seconds
        }

        setTimeout(() => {
            if (this.state.transitionIn) {
                this.setState({
                    transitionIn: false
                });
            }

            this.transitionSize();
        });
    }

    handleClose() {
        if (this.state.active) {
            this.setState({
                transitionOut: true
            });
        }
    }

    handleTransitionEnd() {
        if (this.state.transitionOut) {
            this.setState({
                active: false,
                transitionOut: false
            });
        }
    }

    render() {
        let notification;
        if (this.state.active) {
            let notificationClass = classNames({
                notification: true,
                ['notification-' + this.state.notification.type]: true,
                'transition-in': this.state.transitionIn,
                'transition-out': this.state.transitionOut
            });

            let message = this.state.notification.message;

            let close;
            let thinking;
            if (this.state.notification.loading) {
                thinking = <Icon styleName="icon thinking" type="thinking" height="24" />;
                message += '...';
            } else {
                close = (
                    <button styleName="close" type="button" onClick={this.handleClose} aria-label="Close">
                        <Icon styleName="icon" type="close" height="12" />
                    </button>
                );
            }

            notification = (
                <div styleName={notificationClass} role="alert" ref={this.notificationElement} onTransitionEnd={::this.handleTransitionEnd}>
                    <div styleName="message">
                        <p ref={this.messageElement}>{message}</p>
                    </div>
                    <div styleName="controls">
                        {thinking}
                        {close}
                    </div>
                </div>
            );
        }

        return (
            <Fragment>
                <NotificationContext.Provider value={this.contextValue}>
                    {this.props.children}
                </NotificationContext.Provider>
                {notification}
            </Fragment>
        );
    }
}

export function withNotification(Component) {
    return function NotificatonComponent(props) {
        return (
            <NotificationContext.Consumer>
                {notification => <Component {...props} notification={notification} />}
            </NotificationContext.Consumer>
        );
    };
}
