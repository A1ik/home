import { defaultLang, isValidLanguage, localeMap } from "./config";
import type { Language } from "./config";
import { t } from "./ui";
import type { UiKey } from "./ui";

export function getLangFromUrl(url: URL): Language {
  const [, lang] = url.pathname.split("/");
  if (isValidLanguage(lang)) {
    return lang;
  }
  return defaultLang;
}

export function useTranslations(lang: Language) {
  return function translate(key: UiKey): string {
    return t(lang, key);
  };
}

export function getLocalizedPath(path: string, lang: Language): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (lang === defaultLang) {
    return cleanPath;
  }
  return `/${lang}${cleanPath}`;
}

export function getArticleUrl(slug: string, lang: Language): string {
  if (lang === defaultLang) {
    return `/articles/${slug}`;
  }
  return `/${lang}/articles/${slug}`;
}

export function formatDate(date: Date, lang: Language): string {
  return date.toLocaleDateString(localeMap[lang], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getAlternateUrls(
  currentPath: string,
  baseUrl: string
): { lang: Language; url: string }[] {
  const languages: Language[] = ["en", "ru", "uk"];
  const pathWithoutLang = currentPath.replace(/^\/(ru|uk)/, "") || "/";

  return languages.map((lang) => ({
    lang,
    url: `${baseUrl}${getLocalizedPath(pathWithoutLang, lang)}`,
  }));
}

/**
 * Extract slug from content collection entry ID
 * Entry ID format: "{lang}/{slug}" or "{lang}/{slug}/index" or "{lang}/{slug}/index.mdoc"
 */
export function getSlugFromEntryId(entryId: string, _lang: Language): string {
  const parts = entryId.split("/");
  // Remove language prefix and index file (with or without extension)
  return parts
    .slice(1)
    .filter((p) => !p.startsWith("index"))
    .join("/");
}
