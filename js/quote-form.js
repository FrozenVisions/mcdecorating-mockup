(function () {
  function showThanks(form) {
    var error = form.querySelector(".quote-error");
    var thanks = form.parentElement.querySelector(".quote-thanks");
    if (error) error.hidden = true;
    form.hidden = true;
    if (thanks) thanks.hidden = false;
  }

  document.querySelectorAll("form.quote-form").forEach(function (form) {
    if (new URLSearchParams(window.location.search).get("quote") === "sent") showThanks(form);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var honey = form.querySelector("[name='_honey']");
      if (honey && honey.value) {
        showThanks(form);
        return;
      }
      var button = form.querySelector("button[type='submit']");
      var error = form.querySelector(".quote-error");
      if (error) {
        error.hidden = true;
        error.textContent = "";
      }
      if (button) button.disabled = true;
      var endpoint = form.getAttribute("action").replace("://formsubmit.co/", "://formsubmit.co/ajax/");
      fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      }).then(function (response) {
        return response.json().then(function (data) {
          var success = data && String(data.success).toLowerCase() === "true";
          if (!response.ok || !success) {
            var rejected = new Error("submit failed");
            rejected.formError = true;
            throw rejected;
          }
          showThanks(form);
        });
      }).catch(function (err) {
        if (err && err.formError) {
          if (button) button.disabled = false;
          if (error) {
            error.hidden = false;
            error.textContent = "Sorry, that did not send. Please call 07907 588 541 or email martink.kelly@yahoo.co.uk.";
          }
          return;
        }
        form.submit();
      });
    });
  });
})();
