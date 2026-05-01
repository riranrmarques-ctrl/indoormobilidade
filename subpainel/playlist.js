const folders = {
  Barra: {
    district: "Barra",
    status: "Ativa",
    code: "H4D3",
    vehicles: "38",
    zone: "7,4 km2",
    campaigns: "12",
    quizzes: "1.248",
  },
  Pituba: {
    district: "Pituba",
    status: "Ativa",
    code: "J3J2",
    vehicles: "42",
    zone: "10,8 km2",
    campaigns: "9",
    quizzes: "1.086",
  },
  "Rio Vermelho": {
    district: "Rio Vermelho",
    status: "Ativa",
    code: "J1N3",
    vehicles: "24",
    zone: "5,1 km2",
    campaigns: "7",
    quizzes: "742",
  },
  Itapua: {
    district: "Itapua",
    status: "Inativo",
    code: "M3D8",
    vehicles: "16",
    zone: "12,6 km2",
    campaigns: "3",
    quizzes: "328",
  },
  Ondina: {
    district: "Ondina",
    status: "Ativa",
    code: "A7B2",
    vehicles: "28",
    zone: "4,9 km2",
    campaigns: "6",
    quizzes: "684",
  },
  Imbui: {
    district: "Imbui",
    status: "Ativa",
    code: "C8L5",
    vehicles: "31",
    zone: "9,2 km2",
    campaigns: "8",
    quizzes: "913",
  },
  "Caminho das Arvores": {
    district: "Caminho das Arvores",
    status: "Ativa",
    code: "P9K4",
    vehicles: "35",
    zone: "6,3 km2",
    campaigns: "10",
    quizzes: "1.102",
  },
  Comercio: {
    district: "Comercio",
    status: "Inativo",
    code: "S2V6",
    vehicles: "12",
    zone: "3,8 km2",
    campaigns: "2",
    quizzes: "190",
  },
};

const detailTitle = document.querySelector("#detailTitle");
const detailDistrict = document.querySelector("#detailDistrict");
const detailCode = document.querySelector("#detailCode");
const detailVehicles = document.querySelector("#detailVehicles");
const detailCampaigns = document.querySelector("#detailCampaigns");
const detailQuizzes = document.querySelector("#detailQuizzes");
const folderPage = document.querySelector("#folderPage");
const folderGrid = document.querySelector("#folderGrid");
const openedFolderLabel = document.querySelector("#openedFolderLabel");
const folderHeaderBackButton = document.querySelector("#folderHeaderBackButton");
const generalButton = document.querySelector("#generalButton");
const createFolderButton = document.querySelector("#createFolderButton");
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
    detailCampaigns.textContent = data.campaigns;
    detailQuizzes.textContent = data.quizzes;
    openedFolderLabel.textContent = `Pasta aberta: ${data.district}`;

    generalButton.classList.add("is-hidden");
    createFolderButton.classList.add("is-hidden");
    folderHeaderBackButton.classList.remove("is-hidden");
    playlistHeader.classList.add("is-folder-context");
    folderGrid.classList.add("is-hidden");
    folderPage.classList.remove("is-hidden");
    folderPage.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

function closeFolderPage() {
  folderPage.classList.add("is-hidden");
  folderGrid.classList.remove("is-hidden");
  generalButton.classList.remove("is-hidden");
  createFolderButton.classList.remove("is-hidden");
  folderHeaderBackButton.classList.add("is-hidden");
  playlistHeader.classList.remove("is-folder-context");
  folderGrid.scrollIntoView({ behavior: "smooth", block: "start" });
}

folderHeaderBackButton.addEventListener("click", closeFolderPage);
