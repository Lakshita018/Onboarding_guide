/**
 * cloudinary.js
 * Cloudinary SDK v2 configuration.
 */
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'v5meggxj',
  api_key:    process.env.CLOUDINARY_API_KEY    || '543521553534172',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'N17vfCUgq5EmQbAnwGkdT1UxkEg',
});

console.log('Cloudinary configured for cloud:', cloudinary.config().cloud_name);

module.exports = cloudinary;
