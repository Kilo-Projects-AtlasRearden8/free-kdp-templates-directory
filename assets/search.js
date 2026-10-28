(function () {
  var GRID = document.getElementById("grid");
  var COUNT = document.getElementById("count");
  var SEARCH = document.getElementById("search");
  var CHIPS = document.querySelectorAll(".chip");

  var templates = [];
  var activeFilter = "all";
  var query = "";

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  function render() {
    var filtered = templates.filter(function (item) {
      var matchCategory = activeFilter === "all" || item.category === activeFilter;
      var haystack =
        item.title + " " + item.category + " " + item.platform + " " + item.cost + " " + item.steps.join(" ");
      var matchQuery = query === "" || haystack.toLowerCase().indexOf(query.toLowerCase()) !== -1;
      return matchCategory && matchQuery;
    });

    COUNT.textContent = filtered.length + " template" + (filtered.length === 1 ? "" : "s") + " found";

    GRID.innerHTML = "";

    if (filtered.length === 0) {
      var empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "No templates match your search.";
      GRID.appendChild(empty);
      return;
    }

    filtered.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "card";

      var stepsHtml = item.steps.map(function (step) {
        return "<li>" + escapeHtml(step) + "</li>";
      }).join("");

      card.innerHTML =
        "<h3>" + escapeHtml(item.title) + "</h3>" +
        '<div class="meta">' +
        '<span class="badge badge-cost">' + escapeHtml(item.cost) + "</span>" +
        '<span class="badge badge-platform">' + escapeHtml(item.platform) + "</span>" +
        "</div>" +
        '<p>' + escapeHtml(item.notes || "") + "</p>" +
        '<h4 style="margin:0 0 0.35rem; font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Steps</h4>' +
        '<ol class="steps">' + stepsHtml + "</ol>" +
        '<div class="link-row">' +
        '<a class="btn" href="' + escapeHtml(item.official_link) + '" target="_blank" rel="noopener">Official link</a>' +
        "</div>";

      GRID.appendChild(card);
    });
  }

  function load() {
    fetch("data/templates.json")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load templates: " + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        templates = data.templates || [];
        render();
      })
      .catch(function (error) {
        COUNT.textContent = "Error loading templates.";
        GRID.innerHTML = '<div class="empty">' + escapeHtml(error.message) + "</div>";
        console.error(error);
      });
  }

  SEARCH.addEventListener("input", function () {
    query = SEARCH.value.trim();
    render();
  });

  CHIPS.forEach(function (chip) {
    chip.addEventListener("click", function () {
      CHIPS.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      activeFilter = chip.getAttribute("data-filter");
      render();
    });
  });

  load();
})();
