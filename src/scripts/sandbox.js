var $ = require('jquery');
var AppMode = require('./app-mode');

var Sandbox = function (graph, cytoscape) {
    'use strict';

    AppMode.call(this, graph);

    //One per instance because I can't seem to disable it, just destroy
    this.edgehandles = require('./cytoscape-edgehandles');

    this.lastProcessId = -1;
    this.lastResourceId = 0;
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
            self.graph.elements().removeClass('dead');
            self.FindSCC();
        }
    });
    this.graph.on('click', 'edge', function (event) {
        if (event.originalEvent.detail >= 2) {
            self.graph.remove(event.cyTarget);
            self.graph.elements().removeClass('dead');
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

Sandbox.prototype.FindSCC = function (v) {
    var identified = {},
        stack      = [],
        index      = {},
        boundaries = [];

    var dfs = function (v) {
        index[v.id()] = stack.length;
        stack.push(v);
        boundaries.push(index[v.id()]);

        v.neighborhood('edge').each(function (i, e) {
            if (e.source() != v) return true;
            var w = e.target();

            if (index[w.id()] === undefined) {
                dfs(w);
            } else if (identified[w.id()] === undefined) {
                while (index[w.id()] < boundaries[boundaries.length - 1]) {
                    boundaries.pop();
                }
            }
        });

        if (boundaries[boundaries.length - 1] === index[v.id()]) {
            boundaries.pop();
            var nodes = [];
            var node;
            while ((node = stack.pop()) != v) {
                nodes.push(node);
                identified[node.id()] = true;
            }
            if (nodes.length > 0) {
                nodes.push(v);
                identified[v.id()] = true;
            }
            return nodes;
        }
    };

    this.graph.elements('node').each(function (ignored, v) {
        var dead = dfs(v);
        if (dead != undefined) {
            for (var i = 0; i < dead.length; ++i) {
                dead[i].addClass('dead');
            }
        }
    });
};


module.exports = Sandbox;