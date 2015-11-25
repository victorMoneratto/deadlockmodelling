var $ = require('jquery');
var cytoscape = require('cytoscape');
var Polyglot = require('polyglot');

var AppMode = require('./app-mode');
var Guide = require('./guide');
var Sandbox = require('./sandbox');


    // $flag-icon-css-path: '../assets/images'
    // $flag-icon-rect-path: ''
    // @import "flag-icon"
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
    this.previousLabel = $("#previous-label");
    this.backToGuideLabel = $("#back-to-guide-label");
    this.nextLabel = $("#next-label");
    this.finishLabel = $("#finish-label");
    this.menuGuideLabel = $("#menu-guide-label");
    this.menuSandboxLabel = $("#menu-sandbox-label");
    this.howToUse = $("#how-to-use");
    this.explanationTitle = $('#explanation-title');
    this.explanationContent = $('#explanation-content');
    this.explanationContentContainer = $('#explanation-content-container');
    this.hideContentButton = $('#hide-content-button');
    this.helpButton = $('#help-button');
    this.helpContent = $('#help-content');
    
    this.menuAboutLabel = $("#menu-about-label");
    this.closeAboutButton = $('#close-about-button');
    this.aboutContainer = $('#about-container');
    //init polyglot and start localization
    this.polyglot = new Polyglot();
    this.locale = 'pt-BR';
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
        self.statusTitle.html(self.polyglot.t(self.activeMode.status.titleId));
        self.statusDesc.html(self.polyglot.t(self.activeMode.status.descId));

        self.previousLabel.html(self.polyglot.t('previousLabel'));
        self.backToGuideLabel.html(self.polyglot.t('backToGuideLabel'));
        self.nextLabel.html(self.polyglot.t('nextLabel'));
        self.finishLabel.html(self.polyglot.t('finishLabel'));
        self.menuGuideLabel.html(self.polyglot.t('menuGuideLabel'));
        self.menuSandboxLabel.html(self.polyglot.t('menuSandboxLabel'));
        self.howToUse.html(self.polyglot.t(self.activeMode.status.howToUseId));
        self.explanationTitle.html(self.polyglot.t('explanationTitle'));
        self.explanationContent.html(self.polyglot.t('explanationContent'));
        self.hideContentButton.html(self.polyglot.t('hideShowContentButton'));
        self.menuAboutLabel.html(self.polyglot.t('aboutLabel'));
        self.helpButton.html(self.polyglot.t('helpButton'));
        self.helpContent.html(self.polyglot.t('helpContent'));
    }).always(function () {
        self.graph.resize();
    });
};

App.prototype.setSandboxMode = function () {
    this.pagerStartGuide.removeClass('hidden');
    this.pagerFinishGuide.addClass('hidden');
    this.pagerNext.addClass('hidden');
    this.pagerPrevious.addClass('hidden');
    this.helpButton.removeClass('hidden');
    this.setActiveMode(new Sandbox(this.graph, cytoscape))
};

App.prototype.setGuideMode = function () {
    this.pagerPrevious.addClass('hidden');
    this.pagerStartGuide.addClass('hidden');
    
    this.helpButton.addClass('hidden');
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

App.prototype.toggleHelp = function () {
    if (this.helpContent.hasClass('hidden'))
    {
        this.helpContent.removeClass('hidden');
    }
    else {
        this.helpContent.addClass('hidden');
    }
}

App.prototype.setAbout = function () {
    app.aboutContainer.removeClass("hide");
}

App.prototype.closeAbout = function () {
    app.aboutContainer.addClass("hide");
}

App.prototype.hideContent = function () {
    if (app.explanationContentContainer.hasClass("hide")) {
        app.explanationContentContainer.removeClass("hide");
    }
    else {
        app.explanationContentContainer.addClass("hide");
    }
};

App.prototype.updateStatus = function () {
    app.statusTitle.html(this.polyglot.t(this.activeMode.status.titleId));
    app.statusDesc.html(this.polyglot.t(this.activeMode.status.descId));
    app.howToUse.html(this.polyglot.t(this.activeMode.status.howToUseId));

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
App.prototype.router = function (e) {
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
            case '#about':
                this.setAbout();
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

    app.pagerNext.click(function (){
        app.nextStep();
    });
    app.pagerPrevious.click(function () {
        app.previousStep();
    });
    app.hideContentButton.click(function () {
        app.hideContent();
    });
    app.closeAboutButton.click(function () {
        app.closeAbout();
    });
    app.helpButton.click(function() {
        app.toggleHelp();
    });
});

$(window).on('status-update', function (event) {
    app.updateStatus();
});

