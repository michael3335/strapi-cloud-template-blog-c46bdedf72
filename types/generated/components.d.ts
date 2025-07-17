import type { Schema, Struct } from '@strapi/strapi';

export interface SharedPhoto extends Struct.ComponentSchema {
  collectionName: 'components_shared_photos';
  info: {
    displayName: 'Photo';
    icon: 'picture';
  };
  attributes: {
    commentary: Schema.Attribute.Text;
    photo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.photo': SharedPhoto;
    }
  }
}
