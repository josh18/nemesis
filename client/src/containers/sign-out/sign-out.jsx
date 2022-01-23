import React, { Component } from 'react';

import './sign-out.less';

import Thinking from '../../elements/thinking/thinking';
import api from '../../services/api';

class SignOut extends Component {
    componentDidMount() {
        this.signOut();
    }

    async signOut() {
        await api.signOut();

        this.props.postSignOut();
        this.props.history.push('/sign-in');
    }

    render() {
        return <Thinking />;
    }
}

export default SignOut;
