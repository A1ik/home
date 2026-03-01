export const languages = ["en", "ru", "uk"] as const;
export type Language = (typeof languages)[number];

export const defaultLang: Language = "en";

export const languageNames: Record<Language, string> = {
  en: "English",
  ru: "Русский",
  uk: "Українська",
};

export const localeMap: Record<Language, string> = {
  en: "en-US",
  ru: "ru-RU",
  uk: "uk-UA",
};

export function isValidLanguage(lang: string): lang is Language {
  return languages.includes(lang as Language);
}
