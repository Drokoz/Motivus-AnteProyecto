const ort = require("onnxruntime-node");
const Jimp = require("jimp");
const ndarray = require("ndarray");
const ops = require("ndarray-ops");
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

async function loadImage(base64Str) {
  const buffer = Buffer.from(base64Str, "base64");
  const image = await Jimp.read(buffer);
  return image;
}
//Preprocess raw image data to match YoloV4 requirement.
function preprocessYOLO(width, height, img) {
  //width and height = iw, ih

  //Obtaining real values of width and height
  const realHeight = img.height;
  const realWidth = img.width;

  //Scaling image
  const scale = Math.min(height / realHeight, width / realWidth);
  const newWidth = parseInt(realWidth * scale);
  const newHeight = parseInt(realHeight * scale);
  console.log(scale, newWidth, newHeight, realWidth, realHeight);

  // Resize the image
  image.resize(newWidth, newHeight);

  //Create array from images and processed data
  const imageResized = ndarray(new Float32Array(image_resized.bitmap.data), [
    newHeight,
    newWidth,
    4
  ]);
  console.log(imageResized);

  const arrayExpected = [height, width, 3];

  const imagePadded = ndarray(
    new Float32Array(width * height * 3),
    arrayExpected
  );

  //Asigns 128 to make an np.full
  ops.assigns(imagePadded, 128.0);

  const dWidth = Math.floor((width - newWidth) / 2);
  const dHeight = Math.floor((height - newHeight) / 2);

  ops.assign(
    imagePadded
      .hi(dHeight + newHeight, dWidth + newWidth, null)
      .lo(dHeight, dWidth, null),
    imageResized.hi(null, null, 3)
  );
  ops.divseq(imagePadded, 255.0);

  const array = [1, 3, height, width];
  const inputTensor = new ort.Tensor("float32", imagePadded.data, array);
  return inputTensor;
}

async function runModel(width, height, base64Str) {
  // Load the ONNX model
  const sessionOptions = {
    executionProviders: ["wasm"],
    enableProfiling: true
  };

  const session = await ort.InferenceSession.create(
    "yolov4.onnx",
    sessionOptions
  );

  console.log(session);

  // Load the image
  const image = await loadImage(base64Str);
  console.log(image);

  // Obtaing tensor
  const input = preprocessYOLO(width, height, image);

  // Run the inference
  const output = await session.run({ input });

  // Get the predicted class
  const scores = output.values().next().value.data;
  const predictedClass = scores.indexOf(Math.max(...scores));

  console.log(`Predicted class: ${predictedClass}`);
}
// use an async context to call onnxruntime functions.
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const width = parseInt(args[0]);
    const height = parseInt(args[1]);
    const images = args[2];

    const gzipData = fs.readFileSync(images);
    const imageData = zlib.gunzipSync(gzipData); // decompress the gzip data
    const imageStrings = imageData.toString().split("\n"); // split the data into an array of base64-encoded strings

    // for (let i = 0; i < imageStrings.length; i++) {
    //   const image = new Image(); // create a new image object
    //   image.src = `data:image/jpeg;base64,${imageStrings[i]}`; // set the image source to the base64-encoded image data
    //   // use the image object as needed
    // }

    console.log(imageStrings);
    // Run the model with the provided parameters
    await runModel(width, height, imageStrings).catch(console.error);
  } catch (e) {
    document.write(`failed to inference ONNX model: ${e}.`);
  }
}

main();
