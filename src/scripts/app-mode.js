var $ = require('jquery');

var AppMode = function (graph) {
    'use strict';
    this.status = {titleId: '', descId: ''};
    this.graph = graph;
};

AppMode.prototype = {
    constructor: AppMode,
    detach: function () {},
    triggerStatusUpdate: function () {
        var event = $.Event('status-update');
        $(window).trigger(event);
    }
};

module.exports = AppMode;