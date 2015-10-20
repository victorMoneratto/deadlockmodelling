var $ = require('jquery');
var Polyglot = require('polyglot');
var Guide = require('./guide');
var cytoscape = require('cytoscape');


function App() {
    this.polyglot = new Polyglot();

    this.graphContainer = $("#graph-container");

    cytoscape.registerJquery($);
    this.graphContainer.cytoscape({
        style: cytoscape.stylesheet()
            .selector('node')
            .css({
                'content': 'data(name)',
                'text-valign': 'center',
                'width': '60',
                'height': '60',
                'border-color': '#000',
                'border-width': 3,
                'background-color': 'white'
            })
            .selector('node.process')
            .css({
                'shape': 'ellipse'
            })
            .selector('node.resource')
            .css({
                'shape': 'rectangle'
            })
            .selector('edge')
            .css({'target-arrow-shape': 'triangle'})
    });

    this.graph = this.graphContainer.cytoscape('get');

    var pagerNext = $("#pager-next"),
        pagerPrevious = $("#pager-previous"),
        pagerFinish = $("#pager-finishGuide"),
        status = $("#status-desc");

    this.isInGuide = true;
    this.guide = new Guide(this.polyglot, this.graph, status, pagerPrevious, pagerNext, pagerFinish);
}

var app = new App();

$(document).ready(function () {
    'use strict';

    app.translate('en-US');

    app.graph.resize();
    app.guide.start(app.graph);
});

App.prototype.translate = function (locale) {
    'use strict';

    var l = (locale == 'pt-BR' ? 'pt-BR' : 'en-US');
    var self = this;
    $.getJSON('assets/locales/' + l + '.json', function (phrases) {
        self.polyglot.extend(phrases);
        document.title = self.polyglot.t('title');
        $('#title').html(document.title);

        if (app.isInGuide) {
            app.guide.translate();
        } else {

        }
    });
};

$('#pager-finishGuide').click(function(event) {
});