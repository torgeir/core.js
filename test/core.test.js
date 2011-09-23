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

  'test should expose log, warn, err on sandbox': function () {
    Core.reset();
    var log, warn, err;
    Core.register('some module', function (sandbox) {
      log = sandbox.log; 
      warn = sandbox.warn; 
      err = sandbox.err; 
    });
    Core.startAll();
    assertTrue(typeof log == 'function');
    assertTrue(typeof warn == 'function');
    assertTrue(typeof err == 'function');
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
  }

}));

