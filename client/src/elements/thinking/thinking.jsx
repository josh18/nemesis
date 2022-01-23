import React from 'react';
import Icon from '../icon/icon';

import './thinking.less';

const Thinking = ({className, ...props}) => {
    return (
        <div className={className} styleName="thinking" {...props}>
            <Icon type="thinking" removeStyle={true} />
        </div>
    );
};

export default Thinking;
