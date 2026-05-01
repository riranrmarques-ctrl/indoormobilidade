
  },
};

function cleanLogoBackground() {
  document.querySelectorAll(".brand-logo").forEach((logo) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      context.drawImage(image, 0, 0);

      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = frame.data;

      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];

        const isDarkGreen = green >= red && green >= blue && red < 45 && green < 90 && blue < 55;
        const isNearBlack = red < 24 && green < 38 && blue < 30;

        if (isDarkGreen || isNearBlack) {
          pixels[index + 3] = 0;
        }
      }

      context.putImageData(frame, 0, 0);
      logo.src = canvas.toDataURL("image/png");
    };
    image.src = logo.getAttribute("src");
  });
}

const detailTitle = document.querySelector("#detailTitle");
const detailDistrict = document.querySelector("#detailDistrict");
const detailStatus = document.querySelector("#detailStatus");
const openedFolderLabel = document.querySelector("#openedFolderLabel");
const backToFolders = document.querySelector("#backToFolders");

cleanLogoBackground();

function copyCode(button) {
  const code = button.dataset.code;
