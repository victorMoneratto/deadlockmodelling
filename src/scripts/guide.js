var $ = require('jquery');
var AppMode = require('./app-mode');

var Guide = function (polyglot, graph) {
    'use strict';

    AppMode.call(this, polyglot, graph);

    this.step = 0;
    var self = this;
    $.getJSON('assets/guide.json', function (data) {
        self.guide = data;
        self.showStep();
    }).done(function () {
        self.triggerStatusUpdate(
            self.polyglot.t('guide.instruction.0'),
            self.polyglot.t('guide.title'));
    });
};

Guide.prototype = Object.create(AppMode.prototype);
Guide.prototype.constructor = Guide;

//var base_detach = Guide.prototype.detach;
//Guide.prototype.detach = function () {
//    base_detach.call(this);
//};

Guide.prototype.next = function () {
    this.step++;
    this.showStep();

    return this.step == this.guide.steps.length-1;
};

Guide.prototype.previous = function () {
    this.step--;
    this.showStep();

    return this.step == 0;
};

Guide.prototype.showStep = function () {
    'use strict';

    this.graph.remove(this.graph.elements());
    this.graph.add(this.guide.steps[this.step]);
    this.graph.layout();
    this.triggerStatusUpdate(this.polyglot.t('guide.instruction.' + this.step));
};

module.exports = Guide;