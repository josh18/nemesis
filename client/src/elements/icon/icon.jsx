import React from 'react';
import classNames from 'classnames';

import round from '../../utils/round';

import './icon.less';

function calculateDimensions(width, height, defaultWidth, defaultHeight) {
    width = parseInt(width);
    height = parseInt(height);

    if (width) {
        height = round(defaultHeight / defaultWidth * width, 2);
    } else if (height) {
        width = round(defaultWidth / defaultHeight * height, 2);
    } else {
        width = '100%';
        height = '100%';
    }

    return {
        width,
        height
    };
}

const Check = ({width: setWidth, height: setHeight, ...props}) => {
    let {width, height} = calculateDimensions(setWidth, setHeight, 28, 20);

    return (
        <svg width={width} height={height} viewBox="0 0 28 20" {...props}>
            <path d="M.364 11.598a1.253 1.253 0 0 1 0-1.767 1.252 1.252 0 0 1 1.768 0l6.247 6.271a1.258 1.258 0 0 0 1.768 0L25.868.364a1.253 1.253 0 0 1 1.767 0c.487.486.486 1.282.001 1.767l-17.49 17.504a1.257 1.257 0 0 1-1.769 0L.364 11.598z" />
        </svg>
    );
};

const Close = ({width: setWidth, height: setHeight, ...props}) => {
    let {width, height} = calculateDimensions(setWidth, setHeight, 20, 20);

    return (
        <svg width={width} height={height} viewBox="0 0 20 20" {...props}>
            <path d="M11.768 10l7.867-7.867a1.254 1.254 0 0 0 0-1.768 1.254 1.254 0 0 0-1.768 0L10 8.232 2.132.364a1.254 1.254 0 0 0-1.768 0 1.254 1.254 0 0 0 0 1.768L8.232 10 .365 17.867c-.486.486-.486 1.281 0 1.768s1.281.486 1.768 0L10 11.768l7.868 7.867c.486.486 1.281.486 1.768 0s.486-1.281 0-1.768L11.768 10z" />
        </svg>
    );
};

const Gear = ({width: setWidth, height: setHeight, ...props}) => {
    let {width, height} = calculateDimensions(setWidth, setHeight, 20, 20);

    return (
        <svg width={width} height={height} viewBox="0 0 20 20" {...props}>
            <path d="M17.477 10.98c.043-.32.072-.641.072-.98s-.029-.66-.072-.98l2.17-1.649a.496.496 0 0 0 .123-.64l-2.057-3.46c-.121-.22-.402-.3-.625-.22l-2.561 1a7.608 7.608 0 0 0-1.736-.98l-.393-2.65A.496.496 0 0 0 11.895 0H7.783a.498.498 0 0 0-.504.42l-.391 2.65c-.627.25-1.202.59-1.738.98l-2.559-1a.508.508 0 0 0-.627.22L-.092 6.73a.484.484 0 0 0 .124.64L2.2 9.02c-.041.319-.072.649-.072.98s.031.66.072.98L.031 12.631a.495.495 0 0 0-.124.639l2.056 3.461a.523.523 0 0 0 .627.221l2.559-1a7.63 7.63 0 0 0 1.738.979l.391 2.65a.5.5 0 0 0 .505.419h4.111c.256 0 .475-.18.504-.42l.393-2.65a8.042 8.042 0 0 0 1.736-.979l2.561 1c.234.09.504 0 .625-.221l2.057-3.461a.495.495 0 0 0-.123-.639l-2.17-1.65zM9.839 13.5c-1.983 0-3.598-1.57-3.598-3.5s1.615-3.5 3.598-3.5 3.597 1.57 3.597 3.5-1.614 3.5-3.597 3.5z" />
        </svg>
    );
};

const Next = ({width: setWidth, height: setHeight, ...props}) => {
    let {width, height} = calculateDimensions(setWidth, setHeight, 11.25, 20);

    return (
        <svg width={width} height={height} viewBox="0 0 11.25 20" {...props}>
            <path d="M2.132 19.635c-.486.486-1.282.486-1.768 0s-.486-1.281 0-1.768l6.985-6.984a1.254 1.254 0 0 0 0-1.768L.364 2.132a1.254 1.254 0 0 1 0-1.768 1.254 1.254 0 0 1 1.768 0l8.752 8.752a1.254 1.254 0 0 1 0 1.768l-8.752 8.751z" />
        </svg>
    );
};


const Previous = ({width: setWidth, height: setHeight, ...props}) => {
    let {width, height} = calculateDimensions(setWidth, setHeight, 11.25, 20);

    return (
        <svg width={width} height={height} viewBox="0 0 11.25 20" {...props}>
            <path d="M9.116.364c.485-.486 1.281-.486 1.768 0s.486 1.281 0 1.768L3.898 9.116a1.256 1.256 0 0 0 0 1.768l6.985 6.983a1.254 1.254 0 0 1 0 1.768 1.254 1.254 0 0 1-1.768 0L.363 10.883a1.254 1.254 0 0 1 0-1.768L9.116.364z" />
        </svg>
    );
};

const Thinking = ({width: setWidth, height: setHeight, className, paused, removeStyle, ...props}) => {
    let style = calculateDimensions(setWidth, setHeight, 20, 20);

    if (!removeStyle) {
        style.fontSize = style.width;
    }

    let thinkingClasses = classNames({
        thinking: true,
        'is-paused': paused
    });

    return (
        <div style={style} styleName={thinkingClasses} className={className} {...props}>
            <div styleName="thinking-rotate">
                <div styleName="thinking-line">
                </div>
            </div>
        </div>
    );
};

const Icon = ({type, ...args}) => {
    switch (type) {
        case 'check':
            return <Check {...args} />;
        case 'close':
            return <Close {...args} />;
        case 'gear':
            return <Gear {...args} />;
        case 'next':
            return <Next {...args} />;
        case 'previous':
            return <Previous {...args} />;
        case 'thinking':
            return <Thinking {...args} />;
    }

    console.error('Invalid icon type');

    return '';
};

export default Icon;
