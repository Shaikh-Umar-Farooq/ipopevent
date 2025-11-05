/**
 * Compress Lineup Image for Email
 * Run: node scripts/compress-lineup-image.js
 * 
 * Compresses the lineup image to be suitable for email embedding
 * Target: < 200KB for optimal email delivery
 */

const fs = require('fs');
const path = require('path');

async function compressImage() {
  console.log('🖼️  Image Compression Tool\n');
  
  const originalPath = path.join(__dirname, '..', 'public', 'Vertical_Lineup-Silhoutte-BMS_New-copy (1).png');
  const outputPath = path.join(__dirname, '..', 'public', 'lineup-compressed.png');
  
  if (!fs.existsSync(originalPath)) {
    console.error('❌ Original image not found at:', originalPath);
    return;
  }
  
  const stats = fs.statSync(originalPath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('📊 Original Image:');
  console.log(`   Path: ${originalPath}`);
  console.log(`   Size: ${fileSizeKB} KB (${fileSizeMB} MB)\n`);
  
  console.log('❌ Image is too large for email embedding!');
  console.log('\n📝 Recommended Solutions:\n');
  
  console.log('1. Online Compression (Easiest):');
  console.log('   • Visit: https://tinypng.com or https://squoosh.app');
  console.log('   • Upload: public/Vertical_Lineup-Silhoutte-BMS_New-copy (1).png');
  console.log('   • Target: < 200 KB for best email compatibility');
  console.log('   • Save as: lineup-compressed.png\n');
  
  console.log('2. Use ImageMagick (Command line):');
  console.log('   brew install imagemagick  # Install if needed');
  console.log('   cd public');
  console.log('   magick "Vertical_Lineup-Silhoutte-BMS_New-copy (1).png" -quality 85 -resize 800x lineup-compressed.png\n');
  
  console.log('3. Use Sharp (Node.js - requires installation):');
  console.log('   npm install sharp');
  console.log('   # Then use the compress script\n');
  
  console.log('4. Manual Optimization:');
  console.log('   • Reduce image dimensions (e.g., max width 800px)');
  console.log('   • Save as optimized PNG or convert to JPG');
  console.log('   • Use PNG-8 instead of PNG-24 if possible\n');
  
  console.log('💡 After compression:');
  console.log('   • Update the filename in generate-and-send.ts and test-email.js');
  console.log('   • Or replace the original file with compressed version\n');
  
  // Check if sharp is available
  try {
    const sharp = require('sharp');
    console.log('✅ Sharp is installed! Attempting compression...\n');
    
    await sharp(originalPath)
      .resize(800, null, { // Resize width to 800px, maintain aspect ratio
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(outputPath);
    
    const outputStats = fs.statSync(outputPath);
    const outputSizeKB = (outputStats.size / 1024).toFixed(2);
    
    console.log('✅ Compression successful!');
    console.log(`   Output: ${outputPath}`);
    console.log(`   New Size: ${outputSizeKB} KB`);
    console.log(`   Reduction: ${((1 - outputStats.size / stats.size) * 100).toFixed(1)}%\n`);
    
    if (outputStats.size > 200000) {
      console.log('⚠️  Still larger than 200KB. Consider:');
      console.log('   • Further reducing dimensions');
      console.log('   • Converting to JPG format');
      console.log('   • Using online tools for better compression\n');
    } else {
      console.log('🎉 Image is now optimized for email!\n');
      console.log('Next steps:');
      console.log('   1. Replace original file or update code to use lineup-compressed.png');
      console.log('   2. Test email with: node scripts/test-email.js\n');
    }
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('📦 Sharp not installed. Install it with:');
      console.log('   npm install sharp\n');
      console.log('Or use one of the manual methods above.');
    } else {
      console.error('❌ Compression failed:', error.message);
    }
  }
}

compressImage().catch(console.error);

