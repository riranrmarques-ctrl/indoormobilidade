const campaigns = [
  {
    brand: "Restaurante Bahia Grill",
    status: "No ar",
    period: "08:00 - 22:00",
    vehicles: 32,
    interactions: 418,
  },
  {
    brand: "Clinica Sorriso Prime",
    status: "Agendada",
    period: "A partir de 02/05",
    vehicles: 18,
    interactions: 0,
  },
  {
    brand: "Academia Move Fit",
    status: "Revisao",
    period: "18:00 - 23:30",
    vehicles: 24,
    interactions: 166,
  },
];

const fleet = [
  { vehicle: "APP-2048", tablet: "DRV-TAB-042", area: "Barra", battery: 86, online: true },
  { vehicle: "APP-1180", tablet: "DRV-TAB-031", area: "Pituba", battery: 64, online: true },
  { vehicle: "APP-3021", tablet: "DRV-TAB-019", area: "Rio Vermelho", battery: 41, online: false },
  { vehicle: "APP-0994", tablet: "DRV-TAB-055", area: "Centro", battery: 78, online: true },
];

const contents = [
  { type: "Video", name: "Oferta almoço executivo", duration: "15s", target: "32 veiculos" },
  { type: "Quiz", name: "Pergunta patrocinada", duration: "Interativo", target: "Toda frota" },
  { type: "QR Code", name: "Cupom primeira compra", duration: "10s", target: "18 veiculos" },
];

const campaignList = document.querySelector("#campaignList");
const fleetList = document.querySelector("#fleetList");
const contentList = document.querySelector("#contentList");
const syncButton = document.querySelector("#syncButton");
const networkStatus = document.querySelector("#networkStatus");
const interactionTotal = document.querySelector("#interactionTotal");
const mapLabel = document.querySelector("#mapLabel");
const mapPoints = document.querySelectorAll(".map-point");
const regionFilter = document.querySelector("#regionFilter");

function renderCampaigns() {
  campaignList.innerHTML = campaigns
    .map(
      (campaign) => `
        <article class="campaign-row">
          <div>
            <strong>${campaign.brand}</strong>
            <span>${campaign.period}</span>
          </div>
          <div class="row-meta">
            <span>${campaign.vehicles} veiculos</span>
            <span>${campaign.interactions} interacoes</span>
            <mark>${campaign.status}</mark>
          </div>
        </article>
      `
    )
    .join("");
}

function renderFleet() {
  fleetList.innerHTML = fleet
    .map(
      (item) => `
        <article class="fleet-row">
          <div>
            <strong>${item.vehicle}</strong>
            <span>${item.tablet} · ${item.area}</span>
          </div>
          <div class="fleet-status">
            <span class="${item.online ? "online" : "offline"}">${item.online ? "Online" : "Offline"}</span>
            <small>${item.battery}% bateria</small>
          </div>
        </article>
      `
    )
    .join("");
}

function renderContents() {
  contentList.innerHTML = contents
    .map(
      (content) => `
        <article class="content-row">
          <span>${content.type}</span>
          <div>
            <strong>${content.name}</strong>
            <small>${content.duration} · ${content.target}</small>
          </div>
        </article>
      `
    )
    .join("");
