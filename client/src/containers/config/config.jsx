import React, { Component } from 'react';

import Button from '../../elements/button/button';
import Card from '../../elements/card/card';
import api from '../../services/api';
import uniqueId from '../../utils/unique-id';

import './config.less';

class SignIn extends Component {
    homeDetectionId = uniqueId();
    motionDetectionId = uniqueId();
    state = {};

    get serviceActionText() {
        if (this.props.status.service === 'started') {
            return 'Restart service';
        } else if (this.props.status.service === 'inProgress') {
            return 'Service starting...';
        }

        return 'Start service';
    }

    handleSettingsChange(event) {
        const key = event.target.name;
        const value = event.target.checked;

        this.props.onSettingsChange(key, value);
    }

    async handleSignOutSessions() {
        this.setState({
            signOutSessionsStatus: 'thinking'
        });

        await api.signOutSessions();

        this.setState({
            signOutSessionsStatus: 'complete'
        });
    }

    handleService() {
        this.setState({
            startedService: true
        });

        this.props.startService();
    }

    render() {
        const buttonDemoProps = {};

        if (this.state.demo === 'thinking') {
            buttonDemoProps.thinking = true;
        } else if (this.state.demo === 'complete') {
            buttonDemoProps.complete = true;
        }

        let serviceActionStatus;
        if (this.props.status.service === 'inProgress') {
            serviceActionStatus = 'thinking';
        } else if (this.state.startedService) {
            serviceActionStatus = 'complete';
        }

        return (
            <Card>
                <form>
                    <h1>Config</h1>
                    <div styleName="home-detection" className="form-group switch">
                        <input id={this.homeDetectionId} name="homeDetection" type="checkbox" checked={this.props.settings.homeDetection} onChange={::this.handleSettingsChange} autoFocus />
                        <label htmlFor={this.homeDetectionId}>Home detection</label>
                    </div>
                    <div className="form-group switch">
                        <input id={this.motionDetectionId} name="motionDetection" type="checkbox" checked={this.props.settings.motionDetection} onChange={::this.handleSettingsChange} />
                        <label htmlFor={this.motionDetectionId}>Motion detection</label>
                    </div>
                    <div styleName="actions">
                        <Button to="sign-out">Sign out</Button>
                        <Button onClick={::this.handleSignOutSessions} status={this.state.signOutSessionsStatus}>Sign out all other sessions</Button>
                        <Button onClick={::this.handleService} status={serviceActionStatus}>{this.serviceActionText}</Button>
                        <Button onClick={::this.handleService}>Restart Raspberry Pi</Button>
                    </div>
                </form>
            </Card>
        );
    }
}

export default SignIn;
