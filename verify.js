// const Jimp = require("jimp");
import Jimp from "jimp";

async function verifyAadhaarCard(templateImagePath, uploadedImagePath) {
  try {
    // Load the template and the uploaded image
   
    const template = await Jimp.read(templateImagePath);
    const uploadedImage = await Jimp.read(uploadedImagePath);

    // Resize the images to make sure they have the same dimensions
    template.resize(uploadedImage.getWidth(), uploadedImage.getHeight());

    // Calculate Mean Squared Error (MSE) between images
    const distance = Jimp.distance(template, uploadedImage); // returns a float in the range [0, 1]
    const similarity = 1 - distance; // similarity is in the range [0, 1]

    const threshold = 0.8; // Adjust this threshold as needed
    if (similarity > threshold) {
      console.log("Document verified successfully")
      return true
      
    } else {
      console.log("Document verification failed.");
      return false;
    }
  } catch (error) {
    console.error("Error:", error.message);
    return false;

  }
}
// module.exports = verifyAadhaarCard

export default verifyAadhaarCard;
