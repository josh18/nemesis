import React, { Component, Fragment } from 'react';
import {
    Link,
    Switch,
    withRouter
} from 'react-router-dom';
import WebFont from 'webfontloader';

import Config from '../config/config';
import Home from '../home/home';
import SignIn from '../sign-in/sign-in';
import SignOut from '../sign-out/sign-out';
import Icon from '../../elements/icon/icon';
import Thinking from '../../elements/thinking/thinking';
import api from '../../services/api';
import { withNotification } from '../../utils/notification/notification';
import Route from '../../utils/route-with-component';
import Socket from '../../utils/socket';

import './scaffolding.less';

const Nav = ({pathname}) => {
    if (pathname === '/sign-in') {
        return null;
    }

    let navBack;
    if (pathname !== '/') {
        navBack = (
            <Link to="/">
                <Icon styleName="previous-icon" type="previous" height="14" />Back
            </Link>
        );
    }

    return (
        <nav styleName="nav">
            {navBack}
            <Link styleName="nav-config" to="/config">
                <Icon styleName="config-icon" type="gear" height="20" />
            </Link>
        </nav>
    );
};

class Scaffolding extends Component {
    state = {
        fontsLoaded: false
    };

    async componentDidMount() {
        WebFont.load({
            active: () => {
                this.setState({
                    fontsLoaded: true
                });
            },
            classes: false,
            google: {
                families: ['Roboto:400']
            }
        });

        this.start();
    }

    componentWillUnmount() {
        this.ws.removeAllEventListeners();
        this.ws.close();
    }

    async start() {
        await this.getData();

        if (this.state.authenticated) {
            this.startSockets();
        }
    }

    async getData() {
        try {
            const data = await api.getAllData();

            if (this.props.location === '/sign-in') {
                this.props.history.push('/');
            }

            this.setState({
                authenticated: true,
                data
            });
        } catch (error) {
            this.handleApiError(error);
        }
    }

    handleApiError(error) {
        let message = error.data;

        if (error.status === 401 && this.props.location !== '/sign-in') {
            this.setState({
                authenticated: false
            });
            this.props.history.push('/sign-in');
            return;
        }

        console.error(error);

        this.props.notification.notify({
            message,
            type: 'failure'
        });
    }

    startSockets() {
        this.ws = new Socket(`ws://${location.host}`);

        this.ws.addEventListener('message', (message) => {
            const { data, type } = JSON.parse(message.data);
            const stateData = {...this.state.data};

            switch (type) {
                case 'home':
                case 'settings':
                case 'status': {
                    stateData[type] = data;
                    break;
                }
                case 'asset:add': {
                    const existingAssetIndex = stateData.assets.findIndex((asset) => {
                        return asset.path === data.path;
                    });

                    if (existingAssetIndex === -1) {
                        stateData.assets.push(data);
                    } else {
                        stateData.assets[existingAssetIndex] = data;
                    }

                    // Sort by created date
                    stateData.assets.sort((a, b) => new Date(b.created) - new Date(a.created));
                    break;
                }
                case 'asset:remove': {
                    stateData.assets = stateData.assets.filter((asset) => {
                        return asset.path !== data.path;
                    });
                    break;
                }
            }

            this.setState({ data: stateData });
        });

        this.ws.addEventListener('open', () => {
            if (this.isReconnecting) {
                this.props.notification.close();
                this.getData();

                this.isReconnecting = false;
            }
        });

        this.ws.addEventListener('close', () => {
            this.props.notification.notify({
                message: 'Reconnecting',
                loading: true
            });

            this.isReconnecting = true;

            setTimeout(() => {
                this.startSockets();
            }, 5000);
        });
    }

    postSignOut = () => {
        this.setState({
            authenticated: false,
            data: null
        });
    }

    async startService() {
        const stateData = {...this.state.data};

        stateData.status = {
            service: 'inProgress'
        };

        this.setState({
            data: stateData
        });

        await api.do('startService');
    }

    handleSettingsChange(key, value) {
        const data = {...this.state.data};
        data.settings[key] = value;

        this.setState({ data });

        this.ws.send(JSON.stringify({
            type: 'settings',
            data: {
                [key]: value
            }
        }));
    }

    render() {
        if (this.state.authenticated === undefined || !this.state.fontsLoaded) {
            return (
                <div styleName="thinking">
                    <Thinking />
                </div>
            );
        }

        let assets;
        let settings;
        let status;
        if (this.state.data) {
            assets = this.state.data.assets;
            settings = this.state.data.settings;
            status = this.state.data.status;
        }

        return (
            <Fragment>
                <Nav pathname={this.props.location.pathname} />
                <div styleName="content">
                    <Switch>
                        <Route exact path="/">
                            <Home assets={assets} />
                        </Route>
                        <Route path="/config">
                            <Config settings={settings} onSettingsChange={::this.handleSettingsChange} status={status} startService={::this.startService} />
                        </Route>
                        <Route path="/sign-in">
                            <SignIn postSignIn={::this.start} authenticated={this.state.authenticated} />
                        </Route>
                        <Route path="/sign-out">
                            <SignOut postSignOut={::this.postSignOut} />
                        </Route>
                    </Switch>
                </div>
            </Fragment>
        );
    }
}

Scaffolding = withRouter(Scaffolding);
Scaffolding = withNotification(Scaffolding);
export default withRouter(Scaffolding);
