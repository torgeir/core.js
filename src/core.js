(function (global) {

  /**
   * Polyfills
   */
  if (!Object.create) {
    Object.create = (function () {

      function F() {}

      return function (proto) {
        if (arguments.length > 1) {
          throw new Error('Object.create takes one argument.');
        }
        F.prototype = proto;
        return new F();
      };

    })();
  }

  if (!Object.freeze) {
    Object.freeze = Object.create;
  }

  function throwNotImplemented () {
    throw "not implemented";
  }

  /**
   * Dom
   */
  var Dom = (function () {

    function get () {
      throwNotImplemented();
      return this;
    }

    function on () {
      throwNotImplemented();
      return this;
    }

    function off () {
      throwNotImplemented();
      return this;
    }

    function html () {
      throwNotImplemented();
      return this;
    }

    function text () {
      throwNotImplemented();
      return this;
    }

    function css () {
      throwNotImplemented();
      return this;
    }

    function hasClass () {
      throwNotImplemented();
      return this;
    }

    function addClass () {
      throwNotImplemented();
      return this;
    }

    function removeClass () {
      throwNotImplemented();
      return this;
    }

    return {
      get: get
    , on: on
    , off: off
    , html: html
    , text: text
    , css: css
    , hasClass: hasClass
    , addClass: addClass
    , removeClass: removeClass
    };

  })();

  /**
   * Ajax
   */
  var Ajax = (function() {

    function json () {
      throwNotImplemented();
    }

    function xml () {
      throwNotImplemented();
    }

    return {
      json: json
    , xml: xml
    };

  })();

  /**
   * Log
   */
  var Log = (function() {

    function log () {
      throwNotImplemented();
    }

    function err () {
      throwNotImplemented();
    }

    return {
      log: log
    , err: err
    };

  })();

  /**
   * Sandbox
   */
  function Sandbox () { }
  Sandbox.prototype.on = PubSub.subscribe;
  Sandbox.prototype.off = PubSub.unsubscribe;
  Sandbox.prototype.emit = PubSub.publish;
  Sandbox.prototype.emitSync = PubSub.publishSync;
  Sandbox.prototype.dom = Object.create(Dom);
  Sandbox.prototype.ajax = Object.create(Ajax);
  Sandbox.prototype.log = Object.create(Log);

  /**
   * Core
   */
  var Core = global.Core = (function () {

    var initialized
      , modules = {};

    /*
    function createModule (id) {
      var name
        , method
        , instance = modules[id].creator(sandbox);

      for (name in instance) {
        method = instance[name];

        if (typeof method === 'function') {
          instance[name] = (function (name, method) {
            return function () {
              try { return method.apply(this, arguments); }
              catch (ex) { log('method "' + name + '" threw: ' + ex.message); }
            };
          })(name, method);
        }
      }

      return instance;
    }
    */

    return {

      init: function (callback) {
        if (initialized) {
          return;
        }
        initialized = true;
        callback && callback(Sandbox);
      },

      reset: function () {
        initialized = false;  
        modules = {};
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
          try {
            instance = module.instance = module.creator(new Sandbox());
            instance && instance.init && instance.init();
          } catch (ex) {
            console.log(ex)
          }
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

})(window);
