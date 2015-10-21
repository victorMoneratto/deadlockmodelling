var $ = require('jquery');
var AppMode = require('./app-mode');

var Sandbox = function(polyglot, graph) {
    'use strict';

    AppMode.call(this, polyglot, graph);
};

Sandbox.prototype = Object.create(AppMode.prototype);
Sandbox.prototype.constructor = Sandbox;

//var base_detach = Sandbox.prototype.detach;
//Sandbox.prototype.detach = function () {
//    base_detach.call(this);
//};

module.exports = Sandbox;