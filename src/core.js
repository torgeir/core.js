(function () {

  function delegate (fn) {
    return function () {
      fn.apply(this, arguments);
    };
  }

  function delegateMethods(from, to) {
    var key;
    for (key in from) {
      if (from.hasOwnProperty(key)) {
        to[key] = delegate(from[key]);
      }
    }
  }

  /**
   * Logger
   */
  var Logger = (function() {
    
    var hasConsole = typeof console === 'function';

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

  /**
   * Sandbox
   */
  var Sandbox = (function() {
    
    function create (baseLogger, baseSandbox) {
      var sandbox = {};
     
      sandbox.emit = delegate(PubSub.publish);
      sandbox.emitSync = delegate(PubSub.publishSync);
      sandbox.on = delegate(PubSub.subscribe);
      sandbox.off = delegate(PubSub.unsubscribe);

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
      , baseLogger = {}
      , baseSandbox = {}
      ;

    return {

      init: function (callback) {
        if (initialized) {
          return;
        }
        initialized = true;
        callback && callback(baseLogger, baseSandbox);
      },

      reset: function () {
        this.stopAll();
        initialized = false;  
        modules = {};
        baseLogger = {};
        baseSandbox = {};
      },

      register: function (moduleId, creator) {
        modules[moduleId] = {
          creator: creator
        , instance: undefined
        };
      },

      start: function (moduleId) {
        var instance, module = modules[moduleId];
        if (module) {
            var logger = Logger.create(baseLogger);
            var sandbox = Sandbox.create(logger, baseSandbox);
            instance = module.instance = module.creator(sandbox);
            instance && instance.init && instance.init();
        }
      },

      stop: function (moduleId) {
        var instance, module = modules[moduleId];
        if (module) {
          instance = module.instance;
          instance && instance.destroy && instance.destroy();
          module.instance = undefined;
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

  window.onerror = function (msg, url, line) {
    Log.err(msg);
  };

})();
