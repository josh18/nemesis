import React from 'react';
import {
    Route
} from 'react-router-dom';

const RouteWithComponent = ({children, ...props}) => {
    return <Route {...props} render={(routeProps) => {
        const newChildren = React.cloneElement(
            children,
            routeProps
        );

        return newChildren;
    }} />;
};

export default RouteWithComponent;
