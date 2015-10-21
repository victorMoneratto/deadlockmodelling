var $ = require('jquery');
var Polyglot = require('polyglot');
var cytoscape = require('cytoscape');

var AppMode = require('./app-mode');
var Guide = require('./guide');
var Sandbox = require('./sandbox');


function App() {
    //collect elements dom
    this.pageTitle = $('#title');
    this.graphContainer = $("#graph-container");
    this.pagerPrevious = $("#pager-previous");
    this.pagerNext = $("#pager-next");
    this.pagerStartGuide = $('#pager-startGuide');
    this.pagerFinishGuide = $("#pager-finishGuide");
    this.statusTitle = $('#status-title');
    this.statusDesc = $("#status-desc");

    //init polyglot and start localization
    this.polyglot = new Polyglot();
    this.translate('en-US');

    //init cytoscape
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

    if (window.location.hash === '#sandbox') {
        this.setSandboxMode();
    } else {
        this.setGuideMode();
    }
}

App.prototype.translate = function (locale) {
    'use strict';

    var l = (locale === 'pt-BR' ? 'pt-BR' : 'en-US');
    var self = this;
    $.getJSON('assets/locales/' + l + '.json', function (phrases) {
        self.polyglot.extend(phrases);

        document.title = self.polyglot.t('title');
        self.pageTitle.html(document.title);
    }).always(function () {
        self.graph.resize();
    });
};

App.prototype.setSandboxMode = function () {
    this.pagerStartGuide.removeClass('hidden');

    this.setActiveMode(new Sandbox(this.polyglot, this.graph))
};

App.prototype.setGuideMode = function () {
    this.pagerStartGuide.addClass('hidden');
    this.pagerFinishGuide.addClass('hidden');
    this.pagerPrevious.removeClass('hidden');
    this.pagerNext.removeClass('hidden');

    this.setActiveMode(new Guide(this.polyglot, this.graph))
};

App.prototype.setActiveMode = function (newMode) {
    if (this.activeMode instanceof AppMode) {
        this.activeMode.detach();
    }

    this.activeMode = newMode;
};

$(document).ready(function () {
    'use strict';

    var app = new App();

    app.pagerPrevious.click(function () {
        if (app.activeMode instanceof Guide) {
            app.activeMode.previous();
        }
    });

    app.pagerNext.click(function () {
        if (app.activeMode instanceof Guide) {
            app.activeMode.next();
        }
    });

    app.pagerStartGuide.click(function () {
        app.setGuideMode()
    });

    app.pagerFinishGuide.click(function () {
        app.setSandboxMode()
    });

    $(window).on('status-update', function (event) {
        if (event.status.title) {
            app.statusTitle.html(event.status.title);
        }
        if (event.status.desc) {
            app.statusDesc.html(event.status.desc);
        }
    });
});

