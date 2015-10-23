var $ = require('jquery');
var AppMode = require('./app-mode');

var Sandbox = function (graph, cytoscape) {
    'use strict';

    AppMode.call(this, graph);

    //One per instance because I can't seem to disable it, just destroy
    this.edgehandles = require('./cytoscape-edgehandles');

    this.lastProcessId = -1;
    this.lastResourceId = 0;
    this.hasDeadlock = false;
    this.status.titleId = 'sandbox.title';
    this.status.descId = 'sandbox.ok';

    var self = this;
    function removeOthersEdgesHolding(resource, addedEdge) {
        var edges = resource.neighborhood('edge');
        for (var iEdge = 0; iEdge < edges.length; ++iEdge) {
            var edge = edges[iEdge];

            if (edge.source().id() == resource.id()) {
                if (edges[iEdge].id() != addedEdge.id()) {
                    self.graph.remove(edges[iEdge]);
                }
            }
        }
    }

    var defaults = {
        preview: true,
        hoverDelay: 150,
        cxt: true,
        enabled: true,
        toggleOffOnLeave: true,
        edgeType: function (sourceNode, targetNode) {
            var resource;
            var differentTypes = false;
            if (sourceNode.hasClass('resource')) {
                resource = sourceNode;
                differentTypes ^= true;
            }
            if (targetNode.hasClass('resource')) {
                resource = targetNode;
                differentTypes ^= true;
            }

            if (differentTypes) {
                return 'flat';
            }

            return undefined;
        },
        complete: function (sourceNode, targetNodes, addedEntities) {
            var resource, process, newProcessIsHolding,
                addedEdge = addedEntities[0];
            if (sourceNode.hasClass('resource')) {
                resource = sourceNode[0];
                process = targetNodes[0];
                newProcessIsHolding = true;
            } else {
                resource = targetNodes[0];
                process = sourceNode[0];
                newProcessIsHolding = false;
            }

            if (newProcessIsHolding) {
                //a resource can be held by only 1 process
                removeOthersEdgesHolding(resource, addedEdge);
            }

            var edges = resource.edgesWith(process);
            for (var iEdge = 0; iEdge < edges.length; ++iEdge) {
                var edge = edges[iEdge];
                if (edge.id() != addedEdge.id()) {
                    self.graph.remove(edge);
                }
            }

            self.FindSCC();
        }
    };

    this.edgehandles(cytoscape, $);
    this.graph.edgehandles(defaults);

    this.graph.on('click', function (event) {
        if (event.originalEvent.detail >= 2) {
            if (event.cyTarget == self.graph) {
                self.addNode(event.cyPosition, !event.originalEvent.ctrlKey)
            }
        }
    });
    this.graph.on('click', 'node', function (event) {
        if (event.originalEvent.detail >= 2) {
            self.graph.remove(event.cyTarget);
            self.FindSCC();
        }
    });
    this.graph.on('click', 'edge', function (event) {
        if (event.originalEvent.detail >= 2) {
            self.graph.remove(event.cyTarget);
            self.FindSCC();
        }
    });
};

Sandbox.prototype = Object.create(AppMode.prototype);
Sandbox.prototype.constructor = Sandbox;

Sandbox.prototype.addNode = function (pos, isProcess) {
    var id, name, className;
    if (isProcess) {
        this.lastProcessId++;
        id = 'p' + this.lastProcessId;
        name = String.fromCharCode(65 + (this.lastProcessId % 26));
        className = 'process';
    } else {
        this.lastResourceId++;
        id = 'r' + this.lastResourceId;
        name = this.lastResourceId;
        className = 'resource';
    }
    this.graph.add([
        {group: 'nodes', data: {id: id, name: name}, classes: className, position: pos}
    ]);
};

var base_detach = Sandbox.prototype.detach;
Sandbox.prototype.detach = function () {
    base_detach.call(this);
    this.graph.off('click');
    this.graph.edgehandles('destroy');
};

Sandbox.prototype.FindSCC = function () {
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

    self.status.titleId = 'sandbox.title';
    self.status.descId = self.hasDeadlock? 'sandbox.dead' : 'sandbox.ok';
    self.triggerStatusUpdate();
};


module.exports = Sandbox;