const path = require('path');
const utils = require('loader-utils');

module.exports = function(content) {
    let options = utils.getOptions(this);

    if (options.text) {
        const root = path.resolve(__dirname, '../');
        const relativePath = path.relative(this.context, root).replace(/\\/g, '/');

        const text = options.text.replace(/{root}/g, relativePath);

        return text + content;
    }

    return content;
};
