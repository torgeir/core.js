(function () {
  'use strict'

  function delegate (fn, scope) {
    return function () {
      return fn.apply(scope || this, arguments);
    };
  }

  function delegateMethods(from, to) {
    var key, property;
    for (key in from) {
      if (from.hasOwnProperty(key)) {
        property = from[key];
        if (typeof property === 'function') {
          to[key] = delegate(property, from);
        }
        else {
          to[key] = {};
          delegateMethods(property, to[key]);
        }
      }
    }
  }

  /**
   * Logger
   */
  var Logger = (function() {
    
    var hasConsole = typeof console !== 'undefined';

    function log () {
      hasConsole && console.log && console.log.apply(console, arguments);
    }

    function warn () {
      hasConsole && console.warn && console.warn.apply(console, arguments);
    }

    function err () {
      hasConsole && console.err && console.err.apply(console, arguments);
    }

    function create (baseLogger) {
      var logger = {};
      
      logger.log = delegate(log);
      logger.warn = delegate(warn);
      logger.err = delegate(err);

      delegateMethods(baseLogger, logger);

      return logger;
    }

    return {
      create: create
    };

  })();


  /* https://github.com/daniellmb/MinPubSub */
  var PubSub;
  (function(d){var e=d.c_||{};d.publish=function(a,b){for(var c=e[a],f=c?c.length:0;f--;)c[f].apply(d,b||[])};d.subscribe=function(a,b){e[a]||(e[a]=[]);e[a].push(b);return[a,b]};d.unsubscribe=function(a){for(var b=e[a[0]],a=a[1],c=b?b.length:0;c--;)b[c]===a&&b.splice(c,1)}})(PubSub = {});


  /**
   * Sandbox
   */
  var Sandbox = (function() {
    
    function create (baseLogger, baseSandbox) {
      var sandbox = {};
     
      sandbox.emit = function (ev, data) { return PubSub.publish(ev, [data]); };
      sandbox.on = delegate(PubSub.subscribe, PubSub);
      sandbox.off = delegate(PubSub.unsubscribe, PubSub);

      delegateMethods(baseLogger, sandbox);
      delegateMethods(baseSandbox, sandbox);

      return sandbox;
    }

    return {
      create: create
    };

  })();


  /**
   * Core
   */
  var Core = window.Core = (function () {

    var initialized
      , modules = {}
      , logger = {}
      , baseLogger = {}
      , baseSandbox = {}
      ;

    function createModule (module) {
      var instance
        , sandbox = Sandbox.create(Logger.create(baseLogger), baseSandbox);
      
      try {
        instance = module.instance = module.creator(sandbox);
      }
      catch (e) {
        logger.warn('Creating module "' + module.id + '" failed with: ' + e);
      }

      return instance;
    }

    function initModule (module) {
      var instance = module.instance;

      try {
        instance && instance.init && instance.init();
      }
      catch (e) {
        logger.warn('Initializing module "' + module.id + '" failed with: ' + e);
      }
    }

    function destroyModule (module) {
      var instance = module.instance;

      try {
        instance && instance.destroy && instance.destroy();
      }
      catch (e) {
        logger.warn('Destroying module "' + module.id + '" failed with: ' + e);
      }

      module.instance = undefined;
    }

    function attachWindowErrorHandler (logger) {
      window.onerror = function (msg, url, line) {
        logger.err(msg + ', url: ' + url + ', line: ' + line);
      };
    }
    
    return {

      init: function (callback) {
        if (initialized) {
          return;
        }

        initialized = true;
        callback && callback(baseLogger, baseSandbox);
        logger = Logger.create(baseLogger);

        attachWindowErrorHandler(logger);
      },

      reset: function () {
        this.stopAll();
        initialized = false;  
        modules = {};
        baseLogger = {};
        baseSandbox = {};
        window.onerror = undefined;
      },

      register: function (moduleId, creator) {
        modules[moduleId] = {
          id: moduleId
        , creator: creator
        , instance: undefined
        };
      },

      start: function (moduleId) {
        var module = modules[moduleId];
        if (module) {
          createModule(module);
          initModule(module);
        }
      },

      stop: function (moduleId) {
        var module = modules[moduleId];
        if (module) {
          destroyModule(module);
        }
      },

      startAll: function () {
        var moduleId;
        for (moduleId in modules) {
          if (modules.hasOwnProperty(moduleId)) {
            this.start(moduleId);
          }
        }
      },

      stopAll: function () {
        var moduleId;
        for (moduleId in modules) {
          if (modules.hasOwnProperty(moduleId)) {
            this.stop(moduleId);
          }
        }
      }

    };

  })();

})();
