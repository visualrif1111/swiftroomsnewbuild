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
import { productPageSettingsType } from "./productPageSettingsType";
import { testimonialType } from "./testimonialType";
import { teamMemberType } from "./teamMemberType";
import { timelineEntryType } from "./timelineEntryType";
import { processStepType } from "./processStepType";
import { certificationType } from "./certificationType";
import { pageSettingsType } from "./pageSettingsType";

// Page-builder: modular page document + reusable section blocks.
import { pageType } from "./documents/pageType";
import { buttonType } from "./blocks/buttonType";
import { heroBlock } from "./blocks/heroBlock";
import { richTextBlock } from "./blocks/richTextBlock";
import { imageBlock } from "./blocks/imageBlock";
import { galleryBlock } from "./blocks/galleryBlock";
import { videoBlock } from "./blocks/videoBlock";
import { statsBlock } from "./blocks/statsBlock";
import { featureGridBlock } from "./blocks/featureGridBlock";
import { testimonialsBlock } from "./blocks/testimonialsBlock";
import { logosBlock } from "./blocks/logosBlock";
import { faqBlock } from "./blocks/faqBlock";
import { ctaBlock } from "./blocks/ctaBlock";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    seoType, postType, locationType, projectType,
    productCategoryType, productType, brandType, faqType, resourceType,
    homepageType, siteSettingsType, productPageSettingsType,
    testimonialType, teamMemberType, timelineEntryType, processStepType, certificationType,
    pageSettingsType,
    // Page builder
    pageType,
    buttonType,
    heroBlock, richTextBlock, imageBlock, galleryBlock, videoBlock,
    statsBlock, featureGridBlock, testimonialsBlock, logosBlock, faqBlock, ctaBlock,
  ],
};
