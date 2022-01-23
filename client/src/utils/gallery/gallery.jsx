import React, { Component, createContext, createRef, Fragment } from 'react';
import classNames from 'classnames';
import Hammer from 'hammerjs';

import CSSTransition from '../css-transition';
import Icon from '../../elements/icon/icon';
import Thinking from '../../elements/thinking/thinking';

import './gallery.less';

const GalleryContext = createContext();

export class Gallery extends Component {
    contentRef = createRef();
    galleryRef = createRef();

    keyDownListener = ::this.handleKeyDown;
    galleryItems = [];
    nextId = 1;
    state = {
        active: false,
        idle: false
    };

    get currentItemIndex() {
        if (!this.state.item) {
            return;
        }

        return this.galleryItems.findIndex(item => item.id === this.state.item.id);
    }

    constructor(props) {
        super(props);

        const that = this;
        this.contextValue = {
            add: ::that.addItem,
            display: ::that.display,
            remove: ::that.removeItem
        };
    }

    componentDidUpdate() {
        if (this.galleryRef.current) {
            if (!this.hammer) {
                this.hammer = new Hammer.Manager(this.galleryRef.current, {
                    recognizers: [
                        [Hammer.Swipe, {
                            direction: Hammer.DIRECTION_HORIZONTAL
                        }],
                    ]
                });

                this.hammer.on('swipeleft', (e) => {
                    this.handleActivity(e);
                    this.nextItem();
                });
                this.hammer.on('swiperight', (e) => {
                    this.handleActivity(e);
                    this.previousItem();
                });
            }
        } else {
            delete this.hammer;
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.keyDownListener);
        clearTimeout(this.idleTimeout);
    }

    handleKeyDown(e) {
        const now = Date.now();

        if (this.lastKeyEventTime && now < this.lastKeyEventTime + 250) {
            return;
        }

        this.lastKeyEventTime = now;

        switch (e.key) {
            case 'Escape':
                this.close();
                break;
            case 'ArrowLeft':
                this.previousItem();
                break;
            case 'ArrowRight':
                this.nextItem();
                break;
            case ' ':
                this.pauseVideo();
                break;
        }
    }

    addItem(path, type) {
        const id = this.nextId;
        this.nextId++;

        this.galleryItems.push({
            id,
            path,
            state: 'notReady',
            type
        });

        return id;
    }

    removeItem(id) {
        this.galleryItems = this.galleryItems.filter(item => item.id === id);
    }

    previousItem() {
        let index = this.currentItemIndex - 1;

        if (index < 0) {
            index = this.galleryItems.length - 1;
        }

        this.showItem(this.galleryItems[index]);
    }

    nextItem() {
        let index = this.currentItemIndex + 1;

        if (index + 1 > this.galleryItems.length) {
            index = 0;
        }

        this.showItem(this.galleryItems[index]);
    }

    display(id) {
        if (!this.state.active) {
            document.addEventListener('keydown', this.keyDownListener);
            this.setIdleTimer(2000);
        }

        this.setState({
            active: true,
            idle: false
        });

        this.showItem(this.getItem(id));
    }

    close() {
        if (this.state.active) {
            document.removeEventListener('keydown', this.keyDownListener);
            clearTimeout(this.idleTimeout);
        }

        this.setState({
            active: false
        });
    }

    getItem(id) {
        return this.galleryItems.find(item => item.id === id);
    }

    getItemIndex(id) {
        return this.galleryItems.indexOf(id);
    }

    showItem(item) {
        this.preload(item);

        let index = this.getItemIndex(item);

        let nextIndex = index + 1;
        if (nextIndex + 1 > this.galleryItems.length) {
            nextIndex = 0;
        }

        let previousIndex = index - 1;
        if (previousIndex < 0) {
            previousIndex = this.galleryItems.length - 1;
        }

        this.preload(this.galleryItems[nextIndex]);
        this.preload(this.galleryItems[previousIndex]);

        this.setState({
            item: {...item}
        });
    }

    setIdleTimer(delay) {
        if (this.idleTimerPaused) {
            return;
        }

        clearTimeout(this.idleTimeout);

        this.idleTimeout = setTimeout(() => {
            this.setState({
                idle: true
            });
        }, delay);
    }

    pauseIdleTimer() {
        this.idleTimerPaused = true;
        clearTimeout(this.idleTimeout);
    }

    resumeIdleTimer() {
        this.idleTimerPaused = false;
        this.setIdleTimer(2000);
    }

    handleActivity(e) {
        if (this.state.idle) {
            this.setState({
                idle: false
            });
        }

        let delay = 2000;
        if (e.type === 'click') {
            delay = 5000;
        }

        this.setIdleTimer(delay);
    }

    pauseVideo() {
        if (this.state.item.type !== 'video') {
            return;
        }

        const videoElement = this.contentRef.current;

        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    }

    preload(item) {
        const setItemState = (state) => {
            item.state = state;

            if (this.state.item && item.id === this.state.item.id) {
                this.setState({
                    item: {...item}
                });
            }
        };

        if (item.state !== 'notReady') {
            return;
        }

        setItemState('loading');

        if (item.type === 'video') {
            const video = document.createElement('video');
            video.addEventListener('canplay', () => setItemState('ready'));
            video.setAttribute('preload', 'metadata');
            video.setAttribute('src', item.path);
        } else {
            const image = document.createElement('img');
            image.addEventListener('load', () => setItemState('ready'));
            image.setAttribute('src', item.path);
        }
    }

    render() {
        let content;
        let item = this.state.item;

        if (item && item.state === 'ready') {
            if (item.type === 'video') {
                content = <video controls autoPlay src={item.path} ref={this.contentRef} />;
            } else {
                content = <img src={item.path} />;
            }
        }

        const galleryClass = classNames({
            gallery: true,
            'is-idle': this.state.idle
        });

        return (
            <Fragment>
                <GalleryContext.Provider value={this.contextValue}>
                    {this.props.children}
                </GalleryContext.Provider>
                <CSSTransition active={this.state.active}>
                    <div styleName={galleryClass} onMouseMove={::this.handleActivity} onClick={::this.handleActivity} ref={this.galleryRef}>
                        {content}
                        <CSSTransition active={this.state.item && this.state.item.state !== 'ready'}>
                            <Thinking styleName="thinking" />
                        </CSSTransition>
                        <div styleName="count">{this.currentItemIndex + 1} / {this.galleryItems.length}</div>
                        <button styleName="close" onClick={::this.close} onMouseEnter={::this.pauseIdleTimer} onMouseLeave={::this.resumeIdleTimer}>
                            <Icon styleName="icon" type="close" width="16" />
                        </button>
                        <button styleName="nav previous" onClick={::this.previousItem} onMouseEnter={::this.pauseIdleTimer} onMouseLeave={::this.resumeIdleTimer}>
                            <Icon styleName="icon" type="previous" width="16" />
                        </button>
                        <button styleName="nav next" onClick={::this.nextItem} onMouseEnter={::this.pauseIdleTimer} onMouseLeave={::this.resumeIdleTimer}>
                            <Icon styleName="icon" type="next" width="16" />
                        </button>
                    </div>
                </CSSTransition>
            </Fragment>
        );
    }
}

class Item extends Component {
    constructor(props) {
        super(props);

        this.galleryItemId = props.gallery.add(props.path, props.type);
    }

    componentWillUnmount() {
        this.props.gallery.remove(this.galleryItemId);
    }

    handleClick() {
        this.props.gallery.display(this.galleryItemId);
    }

    render() {
        return (
            <div styleName="gallery-item" onClick={::this.handleClick}>
                {this.props.children}
            </div>
        );
    }
}

export const GalleryItem = (props) => {
    return (
        <GalleryContext.Consumer>
            {gallery => <Item {...props} gallery={gallery} />}
        </GalleryContext.Consumer>
    );
};
