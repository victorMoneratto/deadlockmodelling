var $ = require('jquery');

var AppMode = function (graph) {
    'use strict';
    this.status = {titleId: '', descId: '', howToUseId: ''};
    this.graph = graph;
    this.hasDeadlock = false;
};

AppMode.prototype = {
    constructor: AppMode,
    detach: function () {},
    triggerStatusUpdate: function () {
        var event = $.Event('status-update');
        $(window).trigger(event);
    }
};

AppMode.prototype.FindSCC = function () {
    var visited = {};
    var dfs = function (v, start) {
        visited[v.id()] = true;
        var edges = v.neighborhood('edge');
        for (var i = 0; i < edges.length; ++i) {
            if (edges[i].source() != v) continue;
            var w = edges[i].target();
            if (w.id() === start.id()) {
                return true;
            }
            if (visited[w.id()] === undefined) {
                if(dfs(w, start)){
                    return true;
                }
            }
        }
        return false;
    };

    this.hasDeadlock = false;
    var self = this;
    this.graph.elements('node').each(function (ignored, v) {
        visited = {};
        var isDead = dfs(v, v);
        if (isDead) {
            self.hasDeadlock = true;
            v.addClass('dead');
        } else {
            v.removeClass('dead');
        }
    });
    var edges = this.graph.elements('edge');
    for(var i = 0; i < edges.length; ++i){
        var src = edges[i].source(),
            dst = edges[i].target();
        if(src.hasClass('dead') && dst.hasClass('dead')) {
            edges[i].addClass('dead');
        } else {
            edges[i].removeClass('dead');
        }
    }

    return self.hasDeadlock;
};

module.exports = AppMode;