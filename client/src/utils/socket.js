const Socket = WebSocket;

Socket.prototype.prevAddEventListener = Socket.prototype.addEventListener;
Socket.prototype.addEventListener = function(type, listener, ...options) {
    if (!this.eventListeners) {
        this.eventListeners = [];
    }
    this.eventListeners.push({
        type,
        listener
    });

    this.prevAddEventListener(type, listener, ...options);
};

Socket.prototype.removeAllEventListeners = function() {
    if (this.eventListeners) {
        this.eventListeners.forEach(({ type, listener }) => this.removeEventListener(type, listener));
    }
};

export default Socket;
