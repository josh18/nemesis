import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import CSSTransition from '../../utils/css-transition';
import Icon from '../icon/icon';

import './button.less';

const Button = ({children, status, ...props}) => {
    const complete = status === 'complete';
    const thinking = status === 'thinking';

    const content = (
        <Fragment>
            {children}
            <CSSTransition active={complete}>
                <Icon styleName="icon" type="check" height="16" />
            </CSSTransition>
            <CSSTransition active={thinking}>
                <Icon styleName="icon thinking" type="thinking" height="24" />
            </CSSTransition>
        </Fragment>
    );

    if (props.to) {
        return (
            <Link styleName="button" disabled={thinking} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button styleName="button" disabled={thinking} type="button" {...props}>
            {content}
        </button>
    );
};

export default Button;
