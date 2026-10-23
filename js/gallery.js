(function () {
  var grid = document.getElementById("gallery-grid");
  if (!grid) return;

  function sortJobs(jobs) {
    return jobs.slice().sort(function (a, b) {
      var ba = Number(b.beforeAfter) - Number(a.beforeAfter);
      if (ba) return ba;
      var ft = Number(b.featured) - Number(a.featured);
      if (ft) return ft;
      var w = (b.weight || 0) - (a.weight || 0);
      if (w) return w;
      return a.title.localeCompare(b.title, "en-GB");
    });
  }

  function esc(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function figure(job) {
    var services = (job.services || []).join(" ");
    var badge = job.beforeAfter ? '<span class="badge">Before and after</span>' : "";
    return (
      '<figure class="shot" id="' + esc(job.id) + '" data-ba="' + (job.beforeAfter ? "true" : "false") + '" data-services="' + esc(services) + '">' +
        '<a class="shot-open" href="/images/jobs/' + esc(job.src) + '.jpg">' +
          '<picture>' +
            '<source srcset="/images/jobs/' + esc(job.src) + '.webp" type="image/webp">' +
            '<img src="/images/jobs/' + esc(job.src) + '.jpg" alt="' + esc(job.alt) + '" width="' + Number(job.width) + '" height="' + Number(job.height) + '" loading="lazy" decoding="async">' +
          "</picture>" +
          badge +
        "</a>" +
        "<figcaption><strong>" + esc(job.title) + "</strong><span>" + esc(job.caption) + "</span></figcaption>" +
      "</figure>"
    );
  }

  function applyFilter(filter) {
    grid.querySelectorAll(".shot").forEach(function (shot) {
      var services = shot.getAttribute("data-services") || "";
      var show = filter === "all" ||
        (filter === "before-after" && shot.getAttribute("data-ba") === "true") ||
        services.split(/\s+/).indexOf(filter) !== -1;
      shot.hidden = !show;
    });
    var visible = grid.querySelectorAll(".shot:not([hidden])").length;
    var status = document.getElementById("gallery-status");
    if (status) status.textContent = visible === 1 ? "Showing 1 job" : "Showing " + visible + " jobs";
  }

  document.querySelectorAll(".filters button").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll(".filters button").forEach(function (other) {
        other.setAttribute("aria-pressed", other === button ? "true" : "false");
      });
      applyFilter(button.getAttribute("data-filter"));
    });
  });

  var dialog = document.getElementById("lightbox");
  var dialogImg = document.getElementById("lightbox-img");
  var dialogCap = document.getElementById("lightbox-cap");
  var lastTrigger = null;
  if (dialog && dialogImg && typeof dialog.showModal === "function") {
    grid.addEventListener("click", function (event) {
      var link = event.target.closest(".shot-open");
      if (!link) return;
      event.preventDefault();
      var img = link.querySelector("img");
      var caption = link.parentElement.querySelector("figcaption");
      dialogImg.src = link.getAttribute("href");
      dialogImg.alt = img ? img.alt : "";
      dialogCap.textContent = caption ? caption.innerText : "";
      lastTrigger = link;
      dialog.showModal();
    });
    dialog.querySelector(".lightbox-close").addEventListener("click", function () {
      dialog.close();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      dialogImg.removeAttribute("src");
      if (lastTrigger) lastTrigger.focus();
    });
  }

  fetch("/data/jobs.json")
    .then(function (response) { return response.json(); })
    .then(function (jobs) {
      if (!Array.isArray(jobs)) return;
      var sorted = sortJobs(jobs);
      var ids = sorted.map(function (job) { return job.id; }).join(",");
      if (ids && ids !== grid.getAttribute("data-rendered")) {
        grid.innerHTML = sorted.map(figure).join("");
        grid.setAttribute("data-rendered", ids);
        var pressed = document.querySelector(".filters button[aria-pressed='true']");
        applyFilter(pressed ? pressed.getAttribute("data-filter") : "all");
      }
    })
    .catch(function () {});
})();
