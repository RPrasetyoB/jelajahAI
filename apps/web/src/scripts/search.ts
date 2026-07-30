import Fuse from "fuse.js";

type SearchItem = {
  title: string;
  excerpt: string;
  kind: string;
  url: string;
  category: string;
  tags: string[];
  author: string;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>\"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '\"': "&quot;",
      "'": "&#39;"
    };

    return entities[character] ?? character;
  });

export const initializeSearch = () => {
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  const status = document.getElementById("search-status");
  const indexElement = document.getElementById("search-index");

  if (!(input instanceof HTMLInputElement) || !results || !status || !indexElement) {
    return;
  }

  let searchIndex: SearchItem[];

  try {
    searchIndex = JSON.parse(indexElement.textContent ?? "[]") as SearchItem[];
  } catch {
    status.textContent = "Search index unavailable.";
    return;
  }

  const fuse = new Fuse(searchIndex, {
    keys: ["title", "excerpt", "category", "tags", "author"],
    threshold: 0.35,
    ignoreLocation: true
  });

  const render = (query: string) => {
    const trimmed = query.trim();
    const matches = trimmed ? fuse.search(trimmed).map((item) => item.item) : searchIndex.slice(0, 8);

    results.innerHTML = matches
      .map(
        (item) => `
          <article class="result-card">
            <p class="card-kicker">${escapeHtml(item.kind)}</p>
            <h2><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h2>
            <p>${escapeHtml(item.excerpt)}</p>
            <div class="result-meta">
              ${item.category ? `<span>${escapeHtml(item.category)}</span>` : ""}
              ${item.author ? `<span>${escapeHtml(item.author)}</span>` : ""}
              ${item.tags.slice(0, 3).map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}
            </div>
          </article>
        `
      )
      .join("");

    status.textContent = trimmed
      ? `${matches.length} result${matches.length === 1 ? "" : "s"} for "${trimmed}"`
      : `Showing ${matches.length} featured items`;
  };

  const params = new URL(window.location.href).searchParams;
  const initialQuery = params.get("q") ?? "";
  input.value = initialQuery;
  render(initialQuery);

  input.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    render(target.value);
    const url = new URL(window.location.href);
    if (target.value.trim()) {
      url.searchParams.set("q", target.value.trim());
    } else {
      url.searchParams.delete("q");
    }
    history.replaceState({}, "", url);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSearch, { once: true });
} else {
  initializeSearch();
}
