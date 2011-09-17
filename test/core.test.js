TestCase('Object.create', sinon.testCase({

  'test should exists' : function () {
    assertFunction(Object.create);
  },

  'test should inherit from argument': function () {
    var parent = {
      someFunction: function () { }
    };
    assertFunction(Object.create(parent).someFunction);
  }
}));

TestCase('Mediator', sinon.testCase({
  
  'test should call subscribers': function () {
    var spy = sinon.spy();
    Mediator.on('some channel', spy);
    Mediator.emitSync('some channel');
    sinon.assert.calledOnce(spy);
  }

}));


TestCase('Core', sinon.testCase({

  setUp: function () {
    var initSpy = this.initSpy = sinon.spy();
    var destroySpy = this.destroySpy = sinon.spy();
    Core.register('a module', function () {
      return { init: initSpy, destroy: destroySpy };
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
  }

}));
