var $ = require('jquery');

var AppMode = function (polyglot, graph) {
    'use strict';

    this.polyglot = polyglot;
    this.graph = graph;
};

AppMode.prototype = {
    constructor: AppMode,
    detach: function () {console.log('did it?')},
    triggerStatusUpdate: function (desc, title) {
        var event = $.Event('status-update');
        event.status = {
            desc: desc,
            title: title
        };
        $(window).trigger(event);
    }
};

module.exports = AppMode;