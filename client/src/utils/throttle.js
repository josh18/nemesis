export default function throttle(callback) {
    let waiting = false;

    return (...args) => {
        if (!waiting) {
            waiting = true;

            requestAnimationFrame(() => {
                callback(args);
                waiting = false;
            });
        }
    };
}
