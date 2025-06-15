const cloudinary = require('cloudinary').v2;
const ApiError = require('./ApiError.js');



/**
 * 
 * @param {string} publicId 
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new ApiError(500, `Failed to delete from Cloudinary: ${error.message}`);
    }
};

module.exports = { deleteFromCloudinary };