var $ = require('jquery');

var Guide = function(polyglot, graph, status, pagerPrev, pagerNext, pagerFinish) {
    'use strict';

    this.polyglot = polyglot;
    this.guide = undefined;
    this.graph = graph;
    this.status = status;
    this.pagerPrevious = pagerPrev;
    this.pagerNext = pagerNext;
    this.pagerFinish = pagerFinish;
    this.step = 0;

    var self = this;
    this.pagerNext.click(function() {self.next()});
    this.pagerPrevious.click(function() {if(!self.pagerPrevious.hasClass('disabled')) self.previous()});
};

module.exports = Guide;

Guide.prototype.start = function () {
    'use strict';

    this.step = 0;

    this.pagerPrevious.addClass('disabled');
    this.pagerPrevious.removeClass('hidden');
    this.pagerNext.removeClass('hidden');
    this.pagerFinish.addClass('hidden');

    var self = this;
    $.getJSON('assets/guide.json', function(data) {
        self.guide = data;
        self.showStep();
    })

    $('#status-title').html(this.polyglot.t('guide.title'));
};

Guide.prototype.stop = function(g) {
    'use strict';

    delete this.guide;

    this.pagerPrevious.addClass('hidden');
    this.pagerNext.addClass('hidden');
    this.pagerFinish.addClass('hidden');
};

Guide.prototype.next = function() {
    'use strict';

    this.pagerPrevious.removeClass('disabled');

    this.step++;
    this.showStep();

    if(this.step == this.guide.steps.length - 1) {
        this.pagerNext.addClass('hidden');
        this.pagerFinish.removeClass('hidden');
    }
};

Guide.prototype.previous = function() {
    'use strict';

    this.step--;
    this.showStep();

    this.pagerFinish.addClass('hidden');
    this.pagerNext.removeClass('hidden');
    if(this.step == 0) {
        this.pagerPrevious.addClass('disabled');
    }
};

Guide.prototype.showStep = function() {
    'use strict';

    this.graph.remove(this.graph.elements());
    this.graph.add(this.guide.steps[this.step]);
    this.graph.layout();
    this.status.html(this.polyglot.t('guide.instruction.' + this.step));
};

Guide.prototype.translate = function () {
    'use strict';
};