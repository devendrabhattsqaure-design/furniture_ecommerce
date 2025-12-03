const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'furniture-store/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'furniture-store/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }],
  },
});

const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'furniture-store/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});
const organizationStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'furniture-store/organizations',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

exports.uploadProduct = multer({ 
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

exports.uploadProfile = multer({ 
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

exports.uploadCategory = multer({ 
  storage: categoryStorage,
  limits: { fileSize: 3 * 1024 * 1024 }
});

const blogStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'furniture-store/blog',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }],
  },
});

exports.uploadBlog = multer({ 
  storage: blogStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
exports.uploadLogo = multer({ 
  storage: organizationStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

exports.cloudinary = cloudinary;

// Delete image from cloudinary
exports.deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Extract public ID from cloudinary URL
exports.extractPublicId = (url) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  const folderIndex = parts.indexOf('furniture-store');
  if (folderIndex !== -1) {
    const folders = parts.slice(folderIndex, -1);
    return `${folders.join('/')}/${publicId}`;
  }
  return publicId;
};