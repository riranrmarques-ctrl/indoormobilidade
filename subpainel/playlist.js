const folders = {
  Barra: {
    district: "Barra",
    status: "Ativa",
    code: "H4D3",
    vehicles: "38",
    zone: "7,4 kmÂ²",
  },
  Pituba: {
    district: "Pituba",
    status: "Ativa",
    code: "J3J2",
    vehicles: "42",
    zone: "10,8 kmÂ²",
  },
  "Rio Vermelho": {
    district: "Rio Vermelho",
    status: "Ativa",
    code: "J1N3",
    vehicles: "24",
    zone: "5,1 kmÂ²",
  },
  Itapua: {
    district: "Itapua",
    status: "Inativo",
    code: "M3D8",
    vehicles: "16",
    zone: "12,6 kmÂ²",
  },
  Ondina: {
    district: "Ondina",
    status: "Ativa",
    code: "A7B2",
    vehicles: "28",
    zone: "4,9 kmÂ²",
  },
  Imbui: {
    district: "Imbui",
    status: "Ativa",
    code: "C8L5",
    vehicles: "31",
    zone: "9,2 kmÂ²",
  },
  "Caminho das Arvores": {
    district: "Caminho das Arvores",
    status: "Ativa",
    code: "P9K4",
    vehicles: "35",
    zone: "6,3 kmÂ²",
  },
  Comercio: {
    district: "Comercio",
    status: "Inativo",
    code: "S2V6",
    vehicles: "12",
    zone: "3,8 kmÂ²",
  },
};

const detailTitle = document.querySelector("#detailTitle");
const detailDistrict = document.querySelector("#detailDistrict");
const detailCode = document.querySelector("#detailCode");
const detailVehicles = document.querySelector("#detailVehicles");
const folderPage = document.querySelector("#folderPage");
const folderGrid = document.querySelector("#folderGrid");
const openedFolderLabel = document.querySelector("#openedFolderLabel");
const backToFolders = document.querySelector("#backToFolders");
const generalButton = document.querySelector("#generalButton");
const createFolderButton = document.querySelector("#createFolderButton");
const deletePageButton = document.querySelector("#deletePageButton");
const openedFolderStatus = document.querySelector("#openedFolderStatus");
const playlistHeader = document.querySelector("#playlistHeader");

function copyCode(button) {
  const code = button.dataset.code;

  navigator.clipboard?.writeText(code);
  button.classList.add("copied");
  button.textContent = "Copiado";

  window.setTimeout(() => {
    button.classList.remove("copied");
    button.textContent = code;
  }, 1200);
}

document.querySelectorAll(".copy-code").forEach((button) => {
  button.addEventListener("click", () => copyCode(button));
});

document.querySelectorAll(".open-folder").forEach((button) => {
  button.addEventListener("click", () => {
    const data = folders[button.dataset.folder];
    if (!data) return;

    detailTitle.textContent = "BAIRRO DA CIDADE";
    detailDistrict.textContent = data.zone;
    detailCode.textContent = data.code;
    detailCode.dataset.code = data.code;
    detailVehicles.textContent = data.vehicles;
    openedFolderLabel.textContent = `Pasta aberta: ${data.district}`;
    openedFolderStatus.textContent = data.code;
    openedFolderStatus.dataset.code = data.code;

    generalButton.classList.add("is-hidden");
    createFolderButton.classList.add("is-hidden");
    deletePageButton.classList.remove("is-hidden");
    playlistHeader.classList.add("is-folder-context");
    folderGrid.classList.add("is-hidden");
    folderPage.classList.remove("is-hidden");
    folderPage.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

backToFolders.addEventListener("click", () => {
  folderPage.classList.add("is-hidden");
  folderGrid.classList.remove("is-hidden");
  generalButton.classList.remove("is-hidden");
  createFolderButton.classList.remove("is-hidden");
  deletePageButton.classList.add("is-hidden");
  playlistHeader.classList.remove("is-folder-context");
  folderGrid.scrollIntoView({ behavior: "smooth", block: "start" });
});
