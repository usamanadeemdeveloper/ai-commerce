import type { SchemaTypeDefinition } from "sanity";

import { categoryType } from "./categoryType";
import { customerType } from "./customerType";
import { orderType } from "./orderType";
import { productType } from "./productType";
import { storeType } from "./storeType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [storeType, categoryType, customerType, productType, orderType],
};
