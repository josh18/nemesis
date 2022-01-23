import React, { Component } from 'react';

import Card from '../../elements/card/card';
import Icon from '../../elements/icon/icon';
import api from '../../services/api';
import CSSTransition from '../../utils/css-transition';
import uniqueId from '../../utils/unique-id';

import './sign-in.less';

class SignIn extends Component {
    passwordId = uniqueId();
    state = {
        password: ''
    };

    componentWillMount() {
        if (this.props.authenticated) {
            this.props.history.push('/');
        }
    }

    handleChange = (event) => {
        this.resetError();

        this.setState({
            password: event.target.value
        });
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        this.resetError();

        this.setState({
            inProgress: true
        });

        if (this.state.password) {
            try {
                this.setState({
                    inProgress: true
                });

                await api.signIn({
                    password: this.state.password
                });

                this.props.postSignIn();
                this.props.history.push('/');
            } catch (error) {
                this.setState({
                    failureMessage: error.data,
                    showFailure: true,
                    inProgress: false,
                    password: ''
                });
            }
        }
    }

    resetError() {
        this.setState({
            showFailure: false
        });
    }

    render() {
        return (
            <Card>
                <form styleName="form" onSubmit={this.handleSubmit}>
                    <h1>Sign in</h1>
                    <div styleName="password" className="form-group">
                        <input id={this.passwordId} type="password" value={this.state.password} onChange={this.handleChange} autoFocus />
                        <label htmlFor={this.passwordId}>Password</label>
                    </div>
                    <CSSTransition active={this.state.showFailure}>
                        <div className="failure">{this.state.failureMessage}</div>
                    </CSSTransition>
                    <button styleName="submit" disabled={this.state.inProgress || !this.state.password}>
                        <Icon type="thinking" height="50" paused={!this.state.inProgress} />
                        <Icon styleName="submit-next" type="next" height="22" />
                    </button>
                </form>
            </Card>
        );
    }
}

export default SignIn;
