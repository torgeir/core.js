(function () {

  /**
   * Log
   */
  var Log = (function() {
    
    var hasConsole = typeof console === 'function';

    function log () {
      hasConsole && console.log && console.log.apply(console, arguments);
    }

    function err () {
      hasConsole && console.err && console.err.apply(console, arguments);
    }

    return {
      log: log
    , err: err
    };

  })();

  /**
   * Sandbox
   */
  var Sandbox = (function() {
    
    function delegate (fn) {
      return function () {
        fn.apply(this, arguments);
      };
    }

    function create (base) {
      var key
        , sandbox = {};
     
      sandbox.emit = delegate(PubSub.publish);
      sandbox.emitSync = delegate(PubSub.publishSync);
      sandbox.on = delegate(PubSub.subscribe);
      sandbox.off = delegate(PubSub.unsubscribe);

      for (key in base) {
        if (base.hasOwnProperty(key)) { 
          sandbox[key] = delegate(base[key]);
        }
      }

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
      , baseSandbox = {}
      ;

    return {

      init: function (callback) {
        if (initialized) {
          return;
        }
        initialized = true;
        callback && callback(baseSandbox);
      },

      reset: function () {
        this.stopAll();
        initialized = false;  
        modules = {};
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
            instance = module.instance = module.creator(Sandbox.create(baseSandbox));
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
