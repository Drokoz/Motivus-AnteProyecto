//import { download, onDownload } from "./downloader.js";

//Section of run model

//General run model, recibe a tensor and run it
async function runOnnxModel(tensor) {
  const input = new String(session.inputNames[0]);
  const feeds = { [input]: tensor };

  //console.log("printing session");
  // Run model with Tensor inputs and get the result.
  const result = await session.run(feeds);
  return result;
}

//Run the onnx model from the image loaded in page
async function runSingleModel(imageSize, arrayExpected, modelName) {
  var startTime = performance.now();
  const tensor = await getTensorFromImage(imageSize, arrayExpected, modelName);
  var startTime2 = performance.now();
  const result = await runOnnxModel(tensor);
  var finishTime2 = performance.now() - startTime2;
  console.log("Tiempo procesado en ejecución modelo: ", finishTime2);
  console.log("Tiempo procesado total: ", finishTime);
  var finishTime = performance.now() - startTime;
  console.log("Tiempo procesado total: ", finishTime);
  return result;
}

//Run the model obtaining a batch or an image from an url
async function runBatchModel(
  imageSize,
  arrayExpected,
  url,
  fileName,
  modelName
) {
  const imageArray = await getImagesArray(url);
  console.log(imageArray);

  var startTime = performance.now();
  const tensorImages = await getTensorFromBatch(
    imageSize,
    imageArray,
    arrayExpected,
    modelName
  );
  var startTime2 = performance.now();
  const result = await runOnnxModel(tensorImages);
  var finishTime2 = performance.now() - startTime2;
  //console.log("Tiempo procesado en ejecución modelo: ", finishTime2);
  var finishTime = performance.now() - startTime;
  console.log("Tiempo procesado total: ", finishTime);
  return result;
}

//Obtains an array of images connecting to an url
async function getImagesArray(url) {
  imgArray = Array();
  if (url.includes("localhost")) {
    fetch(url, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((imagesList) => {
        imagesList.forEach((filename) => {
          fetch(`${url}/${filename}`)
            .then((response) => response.blob())
            .then((imageBlob) => {
              // Create a new Image object
              var image = new Image();

              // Set the src property to the URL created from the blob using createObjectURL()
              image.src = URL.createObjectURL(imageBlob);

              // Once the image has loaded, you can display it on the page
              image.onload = function () {
                // Add the image to the DOM
                image.width = this.width;
                image.height = this.height;
                document.body.appendChild(image);
                imgArray.push(image);
              };
            })
            .catch((error) => {
              console.error(error);
            });
        });
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    fetch(url)
      .then((response) => {
        console.log(response.json());
        console.log(response.blob());
      })
      .then((imageBlob) => {
        // Create a new Image object
        var image = new Image();

        // Set the src property to the URL created from the blob using createObjectURL()
        image.src = URL.createObjectURL(imageBlob);

        // Once the image has loaded, you can display it on the page
        image.onload = function () {
          // Add the image to the DOM
          image.width = this.width;
          image.height = this.height;
          document.body.appendChild(image);
          imgArray.push(image);
        };
      })
      .catch((error) => {
        console.error(error);
      });
  }
  console.log(imgArray);
  return imgArray;
}
