import { type SchemaTypeDefinition } from "sanity";
import { seoType } from "./seoType";
import { postType } from "./postType";
import { locationType } from "./locationType";
import { projectType } from "./projectType";
import { productCategoryType } from "./productCategoryType";
import { productType } from "./productType";
import { brandType } from "./brandType";
import { faqType } from "./faqType";
import { resourceType } from "./resourceType";
import { homepageType } from "./homepageType";
import { siteSettingsType } from "./siteSettingsType";
import { testimonialType } from "./testimonialType";
import { teamMemberType } from "./teamMemberType";
import { timelineEntryType } from "./timelineEntryType";
import { processStepType } from "./processStepType";
import { certificationType } from "./certificationType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    seoType, postType, locationType, projectType,
    productCategoryType, productType, brandType, faqType, resourceType,
    homepageType, siteSettingsType,
    testimonialType, teamMemberType, timelineEntryType, processStepType, certificationType,
  ],
};
