import { defineQuery } from "next-sanity";

export const STORE_BY_SLUG_QUERY = defineQuery(`*[
  _type == "store"
  && slug.current == $slug
][0]{
  _id,
  name,
  tagline,
  chatPlaceholder,
  chatSuggestions,
  aiAssistantContext,
  "slug": slug.current,
  ownerUserId,
  isActive
}`);

export const STORE_BY_OWNER_USER_ID_QUERY = defineQuery(`*[
  _type == "store"
  && ownerUserId == $ownerUserId
]|order(createdAt asc)[0]{
  _id,
  name,
  "slug": slug.current,
  ownerUserId,
  isActive
}`);

export const STORE_SLUG_EXISTS_QUERY = defineQuery(`count(*[
  _type == "store"
  && slug.current == $slug
])`);

export const FIRST_ACTIVE_STORE_QUERY = defineQuery(`*[
  _type == "store"
  && isActive == true
]|order(createdAt asc)[0]{
  _id,
  name,
  "slug": slug.current,
  ownerUserId,
  isActive
}`);

export const ALL_ACTIVE_STORES_QUERY = defineQuery(`*[
  _type == "store"
  && isActive == true
]|order(name asc){
  _id,
  name,
  tagline,
  "slug": slug.current
}`);
