/**
 * Utility function to proxy Instagram images to bypass CORS restrictions
 * @param {string} imageUrl - The original image URL
 * @returns {string} - The proxied URL or original URL if proxy not needed
 */
export const getProxiedImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === 'N/A' || imageUrl === '/default-avatar.png') {
    return imageUrl || '/default-avatar.png';
  }

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // Check if the image needs proxy (Instagram CDN images)
  const needsProxy = 
    imageUrl.includes('cdninstagram.com') || 
    imageUrl.includes('instagram.') || 
    imageUrl.includes('fbcdn.net') ||
    imageUrl.includes('scontent');
  
  if (needsProxy) {
    return `${API_BASE}/api/image/proxy?url=${encodeURIComponent(imageUrl)}`;
  }
  
  // YouTube images work directly (yt3.ggpht.com, i.ytimg.com, googleusercontent.com)
  return imageUrl;
};
