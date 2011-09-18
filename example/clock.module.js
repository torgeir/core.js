(function() {

  Core.register('clock', function (sandbox) {

    var interval = 1000
      , clocks = []
      , dom = sandbox.dom;

    function create (el) {
      var clock = new Clock(el, interval);
      clocks.push(clock);
      clock.start();
    }

    /**
     * Clock class
     */
    function Clock (el, interval) {
      this.el = el;
      this.interval = interval;
      this.timeout = undefined;
    }
    Clock.prototype.start = function () {
      var that = this;
      this.timeout = setTimeout(function () {
        that.update(new Date());
      }, this.interval);
    };
    Clock.prototype.stop = function () {
      this.timeout && clearTimeout(this.timeout);
    };
    Clock.prototype.update = function (date) {
      dom.html(this.el, date);
      sandbox.emit('clock:update', date);
      this.start();
    };

    return {
      init: function () {
        var i , len , clockEls = dom.get('.clock');
        for (i = 0, len = clockEls.length; i < len; i += 1) {
          create(clockEls[i]);
        }
      },
      destroy: function () {
        var i;
        for (i = 0, len = clocks.length; i < len; i += 1) {
          clocks[i].stop();
        }
        clocks = [];
      }
    };

  });

})();
