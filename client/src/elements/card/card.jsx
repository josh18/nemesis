import React, { Component, createRef } from 'react';
import classNames from 'classnames';

import throttle from '../../utils/throttle';

import './card.less';

export default class Card extends Component {
    cardElement = createRef();
    resizeListener = throttle(::this.checkHeight);
    state = {}

    componentDidMount() {
        this.checkHeight();

        window.addEventListener('resize', this.resizeListener);
    }

    componentDidUpdate(prevProps) {
        if (this.props === prevProps) {
            return;
        }

        this.checkHeight();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeListener);
    }

    checkHeight() {
        if (this.cardElement.current) {
            const parentElement = this.cardElement.current.parentNode;
            const parentStyle = window.getComputedStyle(parentElement);
            const paddingTop = parseFloat(parentStyle.paddingTop);
            const paddingBottom = parseFloat(parentStyle.paddingBottom);

            const parentContentHeight = parentElement.clientHeight - paddingTop - paddingBottom;

            const hasSpace = parentContentHeight > 500;
            this.setState({
                hasSpace
            });
        }
    }

    render() {
        const cardClass = classNames({
            card: true,
            'has-space': this.state.hasSpace
        });

        const { children, className, ...props } = this.props;

        return (
            <div styleName={cardClass} ref={this.cardElement} className={className} {...props}>
                {children}
            </div>
        );
    }
}
