import { type SchemaTypeDefinition } from "sanity";
import { seoType } from "./seoType";
import { postType } from "./postType";
import { locationType } from "./locationType";
import { projectType } from "./projectType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [seoType, postType, locationType, projectType],
};
