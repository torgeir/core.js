(function() {

  /**
    * Clock class
    */
  function Clock (el, interval) {
    this.el = el;
    this.interval = interval;
    this.timeout = undefined;
  }
  Clock.prototype.start = function (sandbox) {
    var that = this;
    this.timeout = setTimeout(function () {
      that.update(sandbox, new Date());
    }, this.interval);
  };
  Clock.prototype.stop = function () {
    this.timeout && clearTimeout(this.timeout);
  };
  Clock.prototype.update = function (sandbox, date) {
    sandbox.dom.html(this.el, date);
    sandbox.emit('clock:update', date);
    this.start(sandbox);
  };


  /**
   * Clock module
   */
  Core.register('clock', function (sandbox) {

    var interval = 1000
      , clocks = []
      , dom = sandbox.dom;

    function create (el) {
      var clock = new Clock(el, interval);
      clocks.push(clock);
      clock.start(sandbox);
    }

    return {

      init: function () {
        var i , len , clockEls = dom.get('.clock');
        for (i = 0, len = clockEls.length; i < len; i += 1) {
          create(clockEls[i]);
        }
      },

      destroy: function () {
        var i, len;
        for (i = 0, len = clocks.length; i < len; i += 1) {
          clocks[i].stop();
        }
        clocks = [];
      }

    };

  });

})();
