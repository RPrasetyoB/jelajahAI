import type { Schema, Struct } from '@strapi/strapi';

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Shared SEO metadata';
    displayName: 'Seo';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedTutorialStep extends Struct.ComponentSchema {
  collectionName: 'components_shared_tutorial_steps';
  info: {
    description: 'A single step in a tutorial';
    displayName: 'Tutorial Step';
  };
  attributes: {
    body: Schema.Attribute.RichText & Schema.Attribute.Required;
    codeBlock: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'shared.seo': SharedSeo;
      'shared.tutorial-step': SharedTutorialStep;
    }
  }
}
