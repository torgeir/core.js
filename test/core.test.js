TestCase('Core', sinon.testCase({

  setUp: function () {
    Core.init();
    var initSpy = this.initSpy = sinon.spy();
    var destroySpy = this.destroySpy = sinon.spy();
    Core.register('a module', function () {
      return { init: initSpy , destroy: destroySpy };
    });
  },

  'test should initialize module': function () {
    Core.start('a module');
    sinon.assert.calledOnce(this.initSpy);
  },

  'test should destroy module': function () {
    Core.start('a module');
    Core.stop('a module');
    sinon.assert.calledOnce(this.destroySpy);
  },

  'test should initialize all modules': function () {
    var anotherInitSpy = sinon.spy();
    Core.register('another module', function () {
      return { init: anotherInitSpy };
    });
    Core.startAll();
    sinon.assert.calledOnce(this.initSpy);
    sinon.assert.calledOnce(anotherInitSpy);
  },

  'test should destroy all modules': function () {
    var anotherDestroySpy = sinon.spy();
    Core.register('another module', function () {
      return { destroy: anotherDestroySpy };
    });
    Core.startAll();
    Core.stopAll();
    sinon.assert.calledOnce(this.destroySpy);
    sinon.assert.calledOnce(anotherDestroySpy);
  },

  'test should call subscribers': function () {
    var spy = sinon.spy();
    Core.reset();
    Core.register('module listening on sandbox', function (sandbox) {
      sandbox.on('some channel', spy);
    });
    Core.register('module broadcasting on sandbox', function (sandbox) {
      sandbox.emitSync('some channel');
    });
    Core.startAll();
    sinon.assert.calledOnce(spy);
  },

  'test should log errors on module creation': function () {
    Core.reset();
    var spy = sinon.spy();
    Core.init(function (logger) {
      logger.warn = spy;
    });
    Core.register('module throwing in creator', function (sandbox) {
      throw 'some error';
    });
    Core.startAll();
    sinon.assert.calledWith(spy, 'Creating module "module throwing in creator" failed with: some error');
  },

  'test should log errors on module initalization': function () {
    Core.reset();
    var spy = sinon.spy();
    Core.init(function (logger) {
      logger.warn = spy;
    });
    Core.register('module throwing in init', function (sandbox) {
      return {
        init: function () {
          throw 'some error';
        }
      };
    });
    Core.startAll();
    sinon.assert.calledWith(spy, 'Initializing module "module throwing in init" failed with: some error');
  },

  'test should log errors on module destruction': function () {
    Core.reset();
    var spy = sinon.spy();
    Core.init(function (logger) {
      logger.warn = spy;
    });
    Core.register('module throwing in destroy', function (sandbox) {
      return {
        destroy: function () {
          throw 'some error';
        }
      };
    });
    Core.startAll();
    Core.stopAll();
    sinon.assert.calledWith(spy, 'Destroying module "module throwing in destroy" failed with: some error');
  },

}));


TestCase('Core - Sandbox', sinon.testCase({

  'test should allow sandbox overrides': function () {
    var spy = sinon.spy();
    Core.reset();
    Core.init(function (logger, sandbox) {
      sandbox.someOverride = spy;
    });
    Core.register('module using custom sandbox', function (sandbox) {
      sandbox.someOverride();
    });
    Core.startAll();
    sinon.assert.calledOnce(spy);
  },

  'test sandboxes are independent': function () {
    var spy = sinon.spy();
    Core.reset();
    Core.register('module that tries to change sandbox', function (sandbox) {
      sandbox.someFunc = spy;
    });
    Core.register('module that tries to call changed sandbox', function (sandbox) {
      sandbox.someFunc && sandbox.someFunc();
    });
    Core.startAll();
    sinon.assert.notCalled(spy);
  }, 
  
  'test should allow namespaced sandbox overrides': function () {
    var spy = sinon.spy();
    Core.reset();
    Core.init(function (logger, sandbox) {
      sandbox.dom = {};
      sandbox.dom.find = spy;
    });
    Core.register('module using sandbox with namespaced methods', function (sandbox) {
      sandbox.dom.find();
    });
    Core.startAll();
    sinon.assert.calledOnce(spy);
  },

  'test sandboxes have independent namespaced methods': function () {
    var spy = sinon.spy();
    Core.reset();
    Core.init(function (logger, sandbox) {
      sandbox.dom = {};
    });
    Core.register('module changing namespace member', function (sandbox) {
      sandbox.dom.find = spy;
    });
    Core.register('module using changed namespace member', function (sandbox) {
      sandbox.dom.find && sandbox.dom.find();
    });
    Core.startAll();
    sinon.assert.notCalled(spy);
  }

}));


TestCase('Core - Logger', sinon.testCase({

  'test should expose log, warn, err on sandbox': function () {
    Core.reset();
    var log, warn, err;
    Core.register('some module', function (sandbox) {
      log = sandbox.log; 
      warn = sandbox.warn; 
      err = sandbox.err;
    });
    Core.startAll();
    assertTrue(typeof log === 'function');
    assertTrue(typeof warn === 'function');
    assertTrue(typeof err === 'function');
  },
    
  'test should allow logger overrides': function () {
    var spy = sinon.spy(); 
    Core.reset();
    Core.init(function (logger, sandbox) {
      logger.err = spy;
    });
    Core.register('module using custom logger', function (sandbox) {
      sandbox.err(); 
    });
    Core.startAll();
    sinon.assert.calledOnce(spy);
  },

  'test loggers are independent': function () {
    var spy = sinon.spy(); 
    Core.reset();
    Core.register('module changing logger', function (sandbox) {
      sandbox.err = spy; 
    });
    Core.register('module that tries to call the changed logger', function (sandbox) {
      sandbox.err(); 
    });
    Core.startAll();
    sinon.assert.notCalled(spy);
  },

  'test should catch errors on window': function () {
    Core.reset();
    var spy = sinon.spy();
    Core.init(function (logger) { logger.err = spy; });
    window.onerror('somewhere else', 'url', 'line number');
    sinon.assert.calledWith(spy, 'somewhere else, url: url, line: line number');
  }

}));
