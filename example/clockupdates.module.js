(function() {

  Core.register('clock-updates', function (sandbox) {

    var clockUpdates = 0;

    sandbox.on('clock:update', function () {
      clockUpdates += 1;
      sandbox.log(clockUpdates + ' update events are received');
    });

    return {
      init: function () {},
      destroy: function () {}
    };

  });

})();
