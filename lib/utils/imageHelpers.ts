export function getProfilePictureUrl(
  profilePicture?: string | { url?: string; publicId?: string; resourceType?: string } | null,
  avatar?: { url?: string; publicId?: string; resourceType?: string } | null
): string {
  // Check avatar field first (legacy field)
  if (avatar && typeof avatar === 'object' && avatar.url) {
    return avatar.url;
  }
  
  // Then check profilePicture
  if (!profilePicture) return '';
  
  if (typeof profilePicture === 'string' && profilePicture) {
    return profilePicture;
  }
  
  if (typeof profilePicture === 'object' && profilePicture.url) {
    return profilePicture.url;
  }
  
  return '';
}

export function createProfilePictureObject(url: string): { url: string; publicId?: string; resourceType: string } {
  const cloudinaryUrlMatch = url.match(/\/upload\/(?:v\d+\/)?([^/]+\/[^.]+)/);
  const publicId = cloudinaryUrlMatch ? cloudinaryUrlMatch[1] : undefined;
  
  return {
    url,
    publicId,
    resourceType: 'image',
  };
}

