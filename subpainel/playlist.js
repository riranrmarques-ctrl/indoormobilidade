const folders = {
  Barra: {
    district: "Barra",
    status: "Ativa",
    code: "H4D3",
    vehicles: "38",
  },
  Pituba: {
    district: "Pituba",
    status: "Ativa",
    code: "J3J2",
    vehicles: "42",
  },
  "Rio Vermelho": {
    district: "Rio Vermelho",
    status: "Pendente",
    code: "J1N3",
    vehicles: "24",
  },
  Itapua: {
    district: "Itapua",
    status: "Inativo",
    code: "M3D8",
    vehicles: "16",
  },
};

const detailTitle = document.querySelector("#detailTitle");
const detailDistrict = document.querySelector("#detailDistrict");
const detailStatus = document.querySelector("#detailStatus");
const detailCode = document.querySelector("#detailCode");
const detailVehicles = document.querySelector("#detailVehicles");
const folderPage = document.querySelector("#folderPage");
const folderGrid = document.querySelector("#folderGrid");
const openedFolderLabel = document.querySelector("#openedFolderLabel");
const backToFolders = document.querySelector("#backToFolders");

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

    detailTitle.textContent = "BAIRRO DA CIDADE";
    detailDistrict.textContent = data.district;
    detailStatus.textContent = data.status;
    detailCode.textContent = data.code;
    detailCode.dataset.code = data.code;
    detailVehicles.textContent = data.vehicles;
    openedFolderLabel.textContent = `Pasta aberta: ${data.district}`;

    folderGrid.classList.add("is-hidden");
    folderPage.classList.remove("is-hidden");
    folderPage.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

backToFolders.addEventListener("click", () => {
  folderPage.classList.add("is-hidden");
  folderGrid.classList.remove("is-hidden");
  folderGrid.scrollIntoView({ behavior: "smooth", block: "start" });
});
