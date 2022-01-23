import React, { cloneElement, Component, createRef, Fragment } from 'react';
import classNames from 'classnames';

import './fullscreen.less';

class Fullscreen extends Component {
    childElement = createRef();
    contentElement = createRef();

    keyDownListener = ::this.handleKeyDown;
    state = {
        active: false,
        rendered: false
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.fullscreen && !prevState.active) {
            prevState.active = true;
            return prevState;
        }

        return null;
    }

    getSnapshotBeforeUpdate() {
        if (this.props.fullscreen && !this.state.rendered) {
            return this.getContentStyle();
        }

        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!!this.props.fullscreen === !!this.state.rendered) {
            return;
        }

        clearTimeout(this.safetyTimeout);

        if (this.transitionDirection) {
            this.transitionIgnore = true;
            setTimeout(() => {
                delete this.transitionIgnore;
            });
        }

        if (this.props.fullscreen) {
            this.setState({
                rendered: true,
                contentStyle: snapshot
            });

            this.childElement.current.style.maxHeight = 'none';

            this.transitionDirection = 'in';

            this.transitionPosition();

            document.addEventListener('keydown', this.keyDownListener);
        } else {
            this.setState({
                rendered: false,
                contentStyle: this.getContentStyle()
            });

            this.transitionDirection = 'out';

            this.transitionPosition();

            document.removeEventListener('keydown', this.keyDownListener);
        }
    }

    getContentStyle() {
        const boundingClientRect = this.childElement.current.getBoundingClientRect();

        const style = {
            position: 'fixed',
            top: `${boundingClientRect.top}px`,
            left: `${boundingClientRect.left}px`,
            width: `${boundingClientRect.width}px`,
            height: `${boundingClientRect.height}px`
        };

        return style;
    }

    transitionPosition() {
        setTimeout(() => {
            const childElement = this.childElement.current;
            const contentElement = this.contentElement.current;
            const isTransitioningIn = this.transitionDirection === 'in';

            const style = contentElement.style.cssText;
            contentElement.style.cssText = null;

            if (isTransitioningIn) {
                childElement.style.maxHeight = null;
            }

            const nextStyle = this.getContentStyle();
            contentElement.style.cssText = style;

            if (isTransitioningIn) {
                childElement.style.maxHeight = 'none';
            }

            // Force paint
            window.getComputedStyle(document.body).height;
            this.setState({
                contentStyle: nextStyle
            });

            this.safetyTimeout = setTimeout(::this.handleTransitionEnd, 5000);
        });
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'Escape':
                this.props.close();
                break;
        }
    }

    handleTransitionEnd() {
        clearTimeout(this.safetyTimeout);

        if (!this.transitionDirection || this.transitionIgnore) {
            return;
        }

        if (this.transitionDirection === 'in') {
            this.childElement.current.style.maxHeight = null;

            this.setState({
                contentStyle: null
            });
        } else {
            this.setState({
                active: false,
                contentStyle: null
            });
        }

        delete this.transitionDirection;
    }

    handleBackgroundClick(e) {
        if (e.target === e.currentTarget && this.props.close) {
            this.props.close();
        }
    }

    child() {
        const childrenProps = {};

        if (this.props.children.ref) {
            this.childElement = this.props.children.ref;
        } else {
            childrenProps.ref = this.childElement;
        }

        return cloneElement(this.props.children, childrenProps);
    }

    render() {
        if (this.props.children instanceof Array) {
            throw new Error('CSSTransition expected to receive a single React element child.');
        }

        if (!this.state.active) {
            return this.child();
        }

        const backgroundClass = classNames({
            background: true,
            'is-active': this.state.rendered
        });

        const containerClass = classNames({
            container: this.state.rendered
        });

        return (
            <Fragment>
                <div styleName={backgroundClass} />
                <div styleName={containerClass} onClick={::this.handleBackgroundClick}>
                    <div style={this.state.contentStyle} styleName="content" onTransitionEnd={::this.handleTransitionEnd} ref={this.contentElement}>
                        {this.child()}
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default Fullscreen;
