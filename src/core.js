(function (global) {

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

  global.Mediator = {
    on: PubSub.subscribe
  , off: PubSub.unsubscribe
  , emit: PubSub.publish
  , emitSync: PubSub.publishSync
  };

  delete global['PubSub'];
  
  var deps = {

  };

  global.Core = (function (deps) {

    var modules = {};

    return {
      register: function (moduleId, creator) {
        modules[moduleId] = {
          creator: creator
        , instance: undefined
        };
      }
    , start: function (moduleId) {
        var instance, obj = modules[moduleId];
        if (obj) {
          instance = obj.instance = obj.creator();
          instance && instance.init();
        }
      }
    , stop: function (moduleId) {
        var instance, obj = modules[moduleId];
        if (obj) {
          instance = obj.instance;
          instance && instance.destroy();
        }
      }
    };
  })(deps);

})(window);
/*

var deps = {

};

var Core = (function (deps) {

  var modules = {};

  function register (id, creator) {
    modules[id] = {
      creator: creator
    , id : id
    };
  }

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

  return {
    register: register,
    start: function () {},
    stop: function () {},
    startAll: function () {},
    stopAll: function () {}
  };
})(deps);

function Ajax () {}
Ajax.prototype.json = function (data, callbacks) {
  throw 'ajax.son() not implemented';
};

function Logger () {}
Logger.prototype.log = function (msg) {
  throw 'logger.log() not implemented';
};
Logger.prototype.err = function (err) {
  throw 'logger.err() not implemented';
};

*/
