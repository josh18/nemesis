import { cloneElement, Component } from 'react';
import classNames from 'classnames';

class CSSTransition extends Component {
    constructor(props) {
        super(props);

        this.state = {
            active: props.active
        };
    }

    componentDidMount() {
        if (this.props.active) {
            this.transition();
        }
    }

    componentDidUpdate(prevProps) {
        if (!!prevProps.active === !!this.props.active) {
            return;
        }

        this.transition();
    }

    transition() {
        clearTimeout(this.safetyTimeout);

        if (this.props.active) {
            this.setState({
                active: true,
                transitionIn: true,
                transitionInEnd: false,
                transitionOut: false
            });

            setTimeout(() => {
                // Force paint
                window.getComputedStyle(document.body).height;
                this.setState({
                    transitionIn: false,
                    transitionInEnd: true
                });
            });
        } else {
            this.setState({
                transitionIn: false,
                transitionInEnd: false,
                transitionOut: true
            });

            this.safetyTimeout = setTimeout(::this.handleTransitionEnd, 5000);
        }
    }

    handleTransitionEnd() {
        clearTimeout(this.safetyTimeout);

        if (this.state.transitionInEnd) {
            this.setState({
                transitionInEnd: false
            });
        } else if (this.state.transitionOut) {
            this.setState({
                active: false,
                transitionOut: false
            });
        }
    }

    render() {
        if (this.props.children instanceof Array) {
            throw new Error('CSSTransition expected to receive a single React element child.');
        }

        if (!this.state.active) {
            return null;
        }

        let originalClassName;
        if (this.props.children.props) {
            originalClassName = this.props.children.props.className;
        }

        return cloneElement(this.props.children, {
            className: classNames(
                originalClassName,
                {
                    'transition-in': this.state.transitionIn,
                    'transition-in-end': this.state.transitionInEnd,
                    'transition-out': this.state.transitionOut
                }
            ),
            onTransitionEnd: ::this.handleTransitionEnd
        });
    }
}

export default CSSTransition;
