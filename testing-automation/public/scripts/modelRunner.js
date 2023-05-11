//import { download, onDownload } from "./downloader.js";

//Section of run model

//General run model, recibe a tensor and run it
async function runOnnxModel(tensor) {
  const input = new String(session.inputNames[0]);
  const feeds = { [input]: tensor };

  //console.log("printing session");
  // Run model with Tensor inputs and get the result.
  const result = await session.run(feeds);
  onDownload(result, "output.json");
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
  var startTime = performance.now();
  var timeImageArray = performance.now();
  const imageArray = await getImagesArray(url);
  var FTimeImageArray = performance.now();
  console.log(
    "Tiempo procesado en fetch de imágenes: ",
    FTimeImageArray - timeImageArray
  );
  //console.log(imageArray);

  var timeTensor = performance.now();
  const tensorImages = await getTensorFromBatch(
    imageSize,
    imageArray,
    arrayExpected,
    modelName
  );
  var FTimeTensor = performance.now();
  console.log(
    "Tiempo procesado en tensor de imágenes: ",
    FTimeTensor - timeTensor
  );

  var timeRunModel = performance.now();
  const result = await runOnnxModel(tensorImages);
  var FtimeRunModel = performance.now();
  console.log(
    "Tiempo procesado en ejecución de modelo: ",
    FtimeRunModel - timeRunModel
  );
  var finishTime = performance.now() - startTime;
  console.log("Tiempo procesado total: ", finishTime);
  return result;
}

//Obtains an array of images connecting to an url
async function getImagesArray(url) {
  imgArray = Array();

  //In case of using a server in localhost to host images
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
                //document.body.appendChild(image);
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
    //Using a link/links to get images
  } else {
    for (const url of arrayURLs) {
      //console.log(url);
      const image = await fetchUrl(url);
      //console.log(image);
      imgArray.push(image);
      //document.body.appendChild(image);
      //console.log("images on url = ", imgArray.length);
    }
  }
  //console.log(imgArray);
  return imgArray;
}

//function to use to fetch url and get the image
async function fetchUrl(url) {
  const image = await fetch(url)
    .then((response) => {
      return response.blob();
    })
    .then((imageBlob) => {
      // Create a new Image object
      //console.log(imageBlob);
      var image = new Image();

      // Set the src property to the URL created from the blob using createObjectURL()
      image.src = URL.createObjectURL(imageBlob);

      // Once the image has loaded, you can display it on the page
      image.onload = function () {
        // Add the image to the DOM
        //console.log(this.width);
        image.width = this.width;
        image.height = this.height;
        //document.body.appendChild(image);
      };
      return image;
    })
    .catch((error) => {
      console.error(error);
    });
  //console.log(image);
  return image;
}
//console.log(imgArray);
