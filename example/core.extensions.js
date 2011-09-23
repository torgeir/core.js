(function () {

  function log (what) {
    console.log('Custom logger says:');
    console.log('> ' + what);
  }

  function html (el, content) {
    el.innerHTML = content;
  }

  function get (selector) {
    return $(selector);
  }

  Core.init(function (logger, sandbox) {

    /* Override default logger methods */
    logger.log = log;

    /* Override default sandbox methods */
    sandbox.dom = {
      get: get
    , html: html
    };
  });

})();
