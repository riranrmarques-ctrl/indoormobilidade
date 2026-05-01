const folders = {
  Barra: {
    district: "Barra",
    status: "Ativa",
    code: "DRV-BAR-01",
  },
  Pituba: {
    district: "Pituba",
    status: "Ativa",
    code: "DRV-PIT-02",
  },
  "Rio Vermelho": {
    district: "Rio Vermelho",
    status: "Aguardando midia",
    code: "DRV-RVM-03",
  },
  Itapua: {
    district: "Itapua",
    status: "Sem exibicao",
    code: "DRV-ITA-04",
  },
};

const detailTitle = document.querySelector("#detailTitle");
const detailDistrict = document.querySelector("#detailDistrict");
const detailStatus = document.querySelector("#detailStatus");
const detailCode = document.querySelector("#detailCode");
const folderDetail = document.querySelector("#folderDetail");

document.querySelectorAll(".open-folder").forEach((button) => {
  button.addEventListener("click", () => {
    const data = folders[button.dataset.folder];

    detailTitle.textContent = "BAIRRO DA CIDADE";
    detailDistrict.textContent = data.district;
    detailStatus.textContent = data.status;
    detailCode.textContent = data.code;
    folderDetail.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
