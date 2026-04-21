import { HomeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const storeType = defineType({
  name: "store",
  title: "Store",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => [rule.required().error("Store name is required")],
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (rule) => [
        rule.required().error("Slug is required for store URLs"),
      ],
    }),
    defineField({
      name: "ownerUserId",
      title: "Owner Clerk User ID",
      type: "string",
      validation: (rule) => [rule.required().error("Owner user ID is required")],
      description: "Clerk user ID for the store owner.",
    }),
    defineField({
      name: "tagline",
      type: "string",
      description: "Short storefront tagline shown on the home banner.",
    }),
    defineField({
      name: "chatPlaceholder",
      type: "string",
      description: "Input placeholder text for the shopping assistant.",
    }),
    defineField({
      name: "chatSuggestions",
      type: "array",
      of: [{ type: "string" }],
      description: "Optional quick prompts for the shopping assistant.",
      validation: (rule) => [rule.max(6).error("Keep suggestions up to 6")],
    }),
    defineField({
      name: "aiAssistantContext",
      type: "text",
      rows: 3,
      description:
        "Optional extra guidance for AI assistant tone and store-specific context.",
    }),
    defineField({
      name: "isActive",
      type: "boolean",
      initialValue: true,
      description: "Inactive stores are hidden from public storefronts.",
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "ownerUserId",
    },
    prepare({ title, subtitle }) {
      return {
        title: title ?? "Untitled Store",
        subtitle: subtitle ? `Owner: ${subtitle}` : "No owner",
      };
    },
  },
  orderings: [
    {
      title: "Newest First",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
    {
      title: "Name A-Z",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});
