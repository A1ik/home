import type { Language } from "./config";

export const ui = {
  en: {
    "nav.home": "Home",
    "nav.articles": "Articles",
    "articles.heading": "Articles",
    "articles.empty": "No articles yet.",
    "articles.back": "Back to articles",
    "article.publishedOn": "Published on",
    "footer.copyright": "doichev.com",
  },
  ru: {
    "nav.home": "Главная",
    "nav.articles": "Статьи",
    "articles.heading": "Статьи",
    "articles.empty": "Статей пока нет.",
    "articles.back": "Назад к статьям",
    "article.publishedOn": "Опубликовано",
    "footer.copyright": "doichev.com",
  },
  uk: {
    "nav.home": "Головна",
    "nav.articles": "Статті",
    "articles.heading": "Статті",
    "articles.empty": "Статей поки немає.",
    "articles.back": "Назад до статей",
    "article.publishedOn": "Опубліковано",
    "footer.copyright": "doichev.com",
  },
} as const;

export type UiKey = keyof (typeof ui)["en"];

export function t(lang: Language, key: UiKey): string {
  return ui[lang][key] ?? ui.en[key];
}
