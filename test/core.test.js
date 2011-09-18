TestCase('Object', sinon.testCase({

  'test create() should exist' : function () {
    assertFunction(Object.create);
  },

  'test create() should return obj that inherits argument': function () {
    var parent = { someFunction: function () {} };
    assertFunction(Object.create(parent).someFunction);
  },

  'test freeze() should exist' : function () {
    assertFunction(Object.freeze);
  }

}));


TestCase('Core', sinon.testCase({

  setUp: function () {
    Core.init();
    var initSpy = this.initSpy = sinon.spy();
    var destroySpy = this.destroySpy = sinon.spy();
    Core.register('a module', function () {
      return { init: initSpy , destroy: destroySpy };
    });
  },

  tearDown: function () {
    Core.reset();  
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

  'test should allow sandbox overrides': function () {
    var spy = sinon.spy();
    Core.reset();
    Core.init(function (Sandbox) {
      Sandbox.prototype.someOverride = spy;
    });
    Core.register('module using custom sandbox', function (sandbox) {
      sandbox.someOverride();
    });
    Core.startAll();
    sinon.assert.calledOnce(spy);
  }

}));

TestCase('Sandbox', sinon.testCase({

  'test should call subscribers': function () {
    var spy = sinon.spy();
    Core.register('module listening on sandbox', function (sandbox) {
      sandbox.on('some channel', spy);
    });
    Core.register('module broadcasting on sandbox', function (sandbox) {
      sandbox.emitSync('some channel');
    });
    Core.startAll();
    sinon.assert.calledOnce(spy);
  }

}));

