(function () {
  var button = document.querySelector(".nav-toggle");
  var cluster = document.getElementById("site-nav");
  if (!button || !cluster) return;
  button.addEventListener("click", function () {
    var open = cluster.classList.toggle("is-open");
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();
