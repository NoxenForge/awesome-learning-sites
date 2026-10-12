import "./style.css";
import { categories, sites } from "./data/sites.js";

const grid = document.querySelector("#site-grid");
const search = document.querySelector("#search");
const filters = document.querySelector("#filters");
const reset = document.querySelector("#reset");
const params = new URLSearchParams(location.search);
let activeCategory = categories.some(({ id }) => id === params.get("category"))
  ? params.get("category")
  : "all";
search.value = params.get("q") || "";
document.querySelector("#total-count").textContent = sites.length;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

for (const category of categories) {
  const button = element("button", "filter", category.name);
  button.type = "button";
  button.dataset.category = category.id;
  button.addEventListener("click", () => {
    activeCategory = category.id;
    render();
  });
  filters.append(button);
}

function createCard(site) {
  const card = element("a", "site-card");
  card.href = site.url;
  card.target = "_blank";
  card.rel = "noopener noreferrer";
  const top = element("div", "card-top");
  top.append(element("span", `site-mark ${site.tone}`, site.mark));
  const hint = element(
    "span",
    site.owned ? "owned-badge" : "card-arrow",
    site.owned ? "我维护的项目" : "↗",
  );
  if (!site.owned) hint.setAttribute("aria-hidden", "true");
  top.append(hint);
  const heading = element("h3", "", site.name);
  const domain = element(
    "p",
    "domain",
    new URL(site.url).hostname.replace(/^www\./, ""),
  );
  const description = element("p", "card-description", site.description);
  const tags = element("div", "tags");
  for (const tag of site.tags) tags.append(element("span", "", tag));
  card.append(
    top,
    heading,
    domain,
    description,
    tags,
    element("span", "sr-only", "在新标签页打开"),
  );
  return card;
}

function render(updateUrl = true) {
  const query = search.value.trim().toLocaleLowerCase();
  const matching = sites.filter(
    (site) =>
      (activeCategory === "all" || site.category === activeCategory) &&
      [site.name, site.url, site.description, ...site.tags]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query),
  );
  grid.replaceChildren(...matching.map(createCard));
  document.querySelector("#result-count").textContent =
    `共 ${matching.length} 个站点`;
  document.querySelector("#empty").hidden = matching.length > 0;
  reset.hidden = activeCategory === "all" && !search.value;
  for (const button of filters.children)
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.category === activeCategory),
    );
  if (updateUrl) {
    const url = new URL(location.href);
    activeCategory === "all"
      ? url.searchParams.delete("category")
      : url.searchParams.set("category", activeCategory);
    query
      ? url.searchParams.set("q", search.value.trim())
      : url.searchParams.delete("q");
    history.replaceState(null, "", url);
  }
}

function clearFilters() {
  activeCategory = "all";
  search.value = "";
  render();
  search.focus();
}
search.addEventListener("input", () => render());
reset.addEventListener("click", clearFilters);
document.querySelector("#empty-reset").addEventListener("click", clearFilters);
window.addEventListener("popstate", () => {
  const params = new URLSearchParams(location.search);
  activeCategory = categories.some(({ id }) => id === params.get("category"))
    ? params.get("category")
    : "all";
  search.value = params.get("q") || "";
  render(false);
});
render(false);
