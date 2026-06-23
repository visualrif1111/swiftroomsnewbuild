import { type SchemaTypeDefinition } from "sanity";
import { postType } from "./postType";
import { locationType } from "./locationType";
import { projectType } from "./projectType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [postType, locationType, projectType],
};
