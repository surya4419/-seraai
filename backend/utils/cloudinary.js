const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload PDF buffer to Cloudinary
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} filename - Desired filename
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Upload result
 */
async function uploadPDF(pdfBuffer, filename, options = {}) {
  try {
    logger.info('Uploading PDF to Cloudinary', { filename, size: pdfBuffer.length });

    const uploadOptions = {
      resource_type: 'raw',
      public_id: `pdfs/${filename.replace('.pdf', '')}`,
      format: 'pdf',
      access_mode: 'authenticated', // Secure access
      ...options
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            logger.info('PDF uploaded successfully', { 
              public_id: result.public_id,
              secure_url: result.secure_url 
            });
            resolve(result);
          }
        }
      );

      uploadStream.end(pdfBuffer);
    });
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Generate a signed URL for secure PDF access
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - URL generation options
 * @returns {string} Signed URL
 */
function generateSignedURL(publicId, options = {}) {
  try {
    const defaultOptions = {
      resource_type: 'raw',
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      ...options
    };

    const signedUrl = cloudinary.utils.private_download_url(publicId, 'pdf', defaultOptions);
    
    logger.info('Generated signed URL', { publicId, expiresAt: defaultOptions.expires_at });
    
    return signedUrl;
  } catch (error) {
    logger.error('Error generating signed URL:', error);
    throw error;
  }
}

/**
 * Delete PDF from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
async function deletePDF(publicId) {
  try {
    logger.info('Deleting PDF from Cloudinary', { publicId });

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });

    logger.info('PDF deleted successfully', { publicId, result: result.result });
    
    return result;
  } catch (error) {
    logger.error('Error deleting PDF:', error);
    throw error;
  }
}

/**
 * Get PDF metadata from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Resource metadata
 */
async function getPDFMetadata(publicId) {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'raw'
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
      size: result.bytes,
      createdAt: result.created_at,
      format: result.format
    };
  } catch (error) {
    logger.error('Error getting PDF metadata:', error);
    throw error;
  }
}

/**
 * List all PDFs in the pdfs folder
 * @param {Object} options - List options
 * @returns {Promise<Array>} List of PDF resources
 */
async function listPDFs(options = {}) {
  try {
    const defaultOptions = {
      resource_type: 'raw',
      type: 'upload',
      prefix: 'pdfs/',
      max_results: 100,
      ...options
    };

    const result = await cloudinary.api.resources(defaultOptions);
    
    return result.resources.map(resource => ({
      publicId: resource.public_id,
      url: resource.secure_url,
      size: resource.bytes,
      createdAt: resource.created_at,
      filename: resource.public_id.split('/').pop()
    }));
  } catch (error) {
    logger.error('Error listing PDFs:', error);
    throw error;
  }
}

/**
 * Check if Cloudinary is properly configured
 * @returns {boolean} Configuration status
 */
function isConfigured() {
  const config = cloudinary.config();
  return !!(config.cloud_name && config.api_key && config.api_secret);
}

/**
 * Test Cloudinary connection
 * @returns {Promise<boolean>} Connection status
 */
async function testConnection() {
  try {
    if (!isConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    // Try to get account details
    await cloudinary.api.ping();
    logger.info('Cloudinary connection test successful');
    return true;
  } catch (error) {
    logger.error('Cloudinary connection test failed:', error);
    return false;
  }
}

module.exports = {
  uploadPDF,
  generateSignedURL,
  deletePDF,
  getPDFMetadata,
  listPDFs,
  isConfigured,
  testConnection,
  cloudinary // Export the configured instance
};