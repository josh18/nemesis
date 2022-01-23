import React, { Component, createRef, Fragment } from 'react';

import Fullscreen from '../../utils/fullscreen/fullscreen';
import { GalleryItem } from '../../utils/gallery/gallery';

import './home.less';

const Asset = ({asset}) => {
    return (
        <GalleryItem path={asset.path} type={asset.type}>
            <img styleName="thumbnail" src={asset.thumbnailPath} />
        </GalleryItem>
    );
};

class Home extends Component {
    state = {
        loadingPlaceholder: true
    };
    streamElement = createRef();

    componentDidUpdate() {
        const stream = this.streamElement.current;

        if (stream.naturalWidth === 0) {
            stream.src = stream.src;
        }
    }

    handleStreamLoad() {
        this.streamLoaded = true;
        this.setState({
            loadingPlaceholder: false
        });
    }

    toggleFullscreen() {
        this.setState({
            fullscreen: !this.state.fullscreen
        });
    }

    render() {
        let streamLoadHandler;
        if (!this.streamLoaded) {
            streamLoadHandler = ::this.handleStreamLoad;
        }

        let assets;
        if (this.props.assets) {
            assets = this.props.assets.map(asset => <Asset key={asset.path} asset={asset} />);
        }

        assets = assets.slice(0, 25);

        return (
            <Fragment>
                <div styleName="stream">
                    <Fullscreen fullscreen={this.state.fullscreen} close={::this.toggleFullscreen}>
                        <img src="/assets/stream.mjpeg" onLoad={streamLoadHandler} onClick={::this.toggleFullscreen} ref={this.streamElement} />
                    </Fullscreen>
                </div>
                <div styleName="gallery">
                    {assets}
                </div>
            </Fragment>
        );
    }
}

export default Home;
