var $ = require('jquery');
var cytoscape = require('cytoscape');
var Polyglot = require('polyglot');

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
    this.locale = 'en-US';
    this.translate();

    //init cytoscape
    cytoscape.registerJquery($);

    this.graphContainer.cytoscape({
        wheelSensitivity: 0.15,
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
            .css({
                'width': '8',
                'target-arrow-shape': 'triangle',
                //'source-arrow-shape': 'circle',
                'line-color': '#000',
                'source-arrow-color': '#000',
                'target-arrow-color': '#000'
            })
            .selector('node.dead')
            .css({
                //'border-width': 6,
                //'border-color': 'red'
            })
            .selector('edge.dead')
            .css({
                'line-color': 'red',
                'target-arrow-color': 'red'
            })
    });

    this.graph = this.graphContainer.cytoscape('get');
}

App.prototype.translate = function (locale) {
    'use strict';

    if (locale != undefined) {
        this.locale = locale;
    }

    var self = this;
    $.getJSON('assets/locales/' + this.locale + '.json', function (phrases) {
        self.polyglot.extend(phrases);

        document.title = self.polyglot.t('title');
        self.pageTitle.html(document.title);
        app.statusTitle.html(self.polyglot.t(self.activeMode.status.titleId));
        app.statusDesc.html(self.polyglot.t(self.activeMode.status.descId));
    }).always(function () {
        self.graph.resize();
    });
};

App.prototype.setSandboxMode = function () {
    this.pagerStartGuide.removeClass('hidden');
    this.pagerFinishGuide.addClass('hidden');
    this.pagerPrevious.addClass('hidden');

    this.setActiveMode(new Sandbox(this.graph, cytoscape))
};

App.prototype.setGuideMode = function () {
    this.pagerPrevious.addClass('hidden');
    this.pagerStartGuide.addClass('hidden');

    this.pagerFinishGuide.addClass('hidden');
    this.pagerNext.removeClass('hidden');

    this.setActiveMode(new Guide(this.graph))
};

App.prototype.setActiveMode = function (newMode) {
    if (this.activeMode instanceof AppMode) {
        this.activeMode.detach();
    }

    this.graph.remove(this.graph.elements());

    this.activeMode = newMode;
    this.updateStatus();
};

App.prototype.updateStatus = function () {
    app.statusTitle.html(this.polyglot.t(this.activeMode.status.titleId));
    app.statusDesc.html(this.polyglot.t(this.activeMode.status.descId));

    this.graph.resize();
};

App.prototype.previousStep = function () {
    if (app.activeMode instanceof Guide) {
        app.pagerNext.removeClass('hidden');
        app.pagerFinishGuide.addClass('hidden');
        if (app.activeMode.previous()) {
            app.pagerPrevious.addClass('hidden');
        }
    }
};

App.prototype.nextStep = function () {
    if (app.activeMode instanceof Guide) {
        app.pagerPrevious.removeClass('hidden');
        if (app.activeMode.next()) {
            app.pagerNext.addClass('hidden');
            app.pagerFinishGuide.removeClass('hidden');
        }
    }
};
var isLoaded = false;
App.prototype.router = function () {
    if(!isLoaded) {
        if(location.hash === "#sandbox") {
            this.setSandboxMode();
        }
        else
        {
            this.setGuideMode();
        }
    }
    else {
        switch (location.hash) {
            case '#':
                break;
            case '#guide':
                this.setGuideMode();
                break;
            case '#sandbox':
                this.setSandboxMode();
                break;
            case '#translate':
                this.translate();
                break;
            case '#translate/pt-BR':
                this.translate('pt-BR');
                break;
            case '#translate/en-US':
                this.translate('en-US');
                break;
        }
    }
    isLoaded = true
};

var app;

$(function () {
    app = new App();
    app.router();

    window.addEventListener('hashchange', function () {
        app.router();
    }, false);

    app.pagerNext.click(function () {
        app.nextStep();
    });
    app.pagerPrevious.click(function () {
        app.previousStep();
    })
});

$(window).on('status-update', function (event) {
    app.updateStatus();
});

