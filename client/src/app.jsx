import React from 'react';
import { hot } from 'react-hot-loader';
import { BrowserRouter as Router } from 'react-router-dom';

import './app.less';

import Scaffolding from './containers/scaffolding/scaffolding';
import { Gallery } from './utils/gallery/gallery';
import { Notification } from './utils/notification/notification';

const App = () => {
    return (
        <Gallery>
            <Notification>
                <Router>
                    <Scaffolding />
                </Router>
            </Notification>
        </Gallery>
    );
};

export default hot(module)(App);
