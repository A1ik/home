import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: {
    kind: "local",
  },
  collections: {
    articles: collection({
      label: "Articles",
      slugField: "title",
      path: "src/content/articles/*/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        language: fields.select({
          label: "Language",
          options: [
            { label: "English", value: "en" },
            { label: "Русский", value: "ru" },
            { label: "Українська", value: "uk" },
          ],
          defaultValue: "en",
        }),
        publishedAt: fields.date({
          label: "Published At",
          validation: { isRequired: true },
        }),
        draft: fields.checkbox({
          label: "Draft",
          defaultValue: false,
        }),
        summary: fields.text({
          label: "Summary",
          multiline: true,
          validation: { isRequired: true },
        }),
        content: fields.markdoc({
          label: "Content",
        }),
      },
    }),
  },
});
