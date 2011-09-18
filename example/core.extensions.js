(function () {

  function log (what) {
    typeof console !== 'undefined' && console.log && console.log(what);
  }

  function html (el, content) {
    el.innerHTML = content;
  };

  function get (selector) {
    return $(selector);
  };

  Core.init(function (Sandbox) {
    Sandbox.prototype.log = log;
    Sandbox.prototype.dom.html = html;
    Sandbox.prototype.dom.get = get
  });

})();
