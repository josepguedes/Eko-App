import { ImageSourcePropType } from 'react-native';

/**
 * Converts a group banner image string to the appropriate image source
 * Handles predefined group images and custom URI images
 */
export function getGroupImageSource(bannerImage: string | null): ImageSourcePropType {
  if (bannerImage && bannerImage.endsWith('.jpg')) {
    // Predefined group image
    const imageMap: { [key: string]: any } = {
      'group1.jpg': require('@/assets/images/defined-groups/group1.jpg'),
      'group2.jpg': require('@/assets/images/defined-groups/group2.jpg'),
      'group3.jpg': require('@/assets/images/defined-groups/group3.jpg'),
      'group4.jpg': require('@/assets/images/defined-groups/group4.jpg'),
      'group5.jpg': require('@/assets/images/defined-groups/group5.jpg'),
      'group6.jpg': require('@/assets/images/defined-groups/group6.jpg'),
    };
    return imageMap[bannerImage] || require('@/assets/images/partial-react-logo.png');
  } else if (bannerImage && bannerImage !== 'default') {
    // Custom URI image
    return { uri: bannerImage };
  } else {
    // Default image
    return require('@/assets/images/partial-react-logo.png');
  }
}
