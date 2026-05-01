const SUPABASE_URL = "https://phuerrdaioaoylukhqml.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_u5dGbUm03WG2056mW2ySNQ_xltzBtU4";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let veiculos = [];
let pastaAberta = null;

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

const playlistList = document.querySelector("#playlistList");

document.addEventListener("DOMContentLoaded", iniciarPagina);

async function iniciarPagina() {
  await carregarVeiculos();
}

async function carregarVeiculos() {
  const { data, error } = await supabaseClient
    .from("veiculos")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao carregar veículos:", error);
    return;
  }

  veiculos = data || [];
  renderizarPastas();
}

function renderizarPastas() {
  if (!folderGrid) return;

  folderGrid.innerHTML = "";

  veiculos.forEach((item) => {
    const statusTexto = item.status === "inativo" ? "Inativo" : "Ativo";
    const statusClasse = item.status === "inativo" ? "inativo" : "ativo";

    const card = document.createElement("article");
    card.className = "folder-card";

    card.innerHTML = `
      <div class="folder-status ${statusClasse}">
        <span></span>
        ${statusTexto}
      </div>

      <button class="copy-code" data-code="${item.codigo}">
        ${item.codigo}
      </button>

      <div class="folder-image">
        ${
          item.imagem_url
            ? `<img src="${item.imagem_url}" alt="${item.nome}">`
            : ""
        }
      </div>

      <h2>${item.nome}</h2>

      <div class="folder-info">
        <div>
          <span>VEÍCULOS</span>
          <strong>${item.veiculos_vinculados || 0}</strong>
        </div>

        <div>
          <span>ZONA</span>
          <strong>${formatarArea(item.zona_area)}</strong>
        </div>
      </div>

      <button class="open-folder" data-code="${item.codigo}">
        Abrir pagina
      </button>
    `;

    folderGrid.appendChild(card);
  });

  ativarEventosDosCards();
}

function ativarEventosDosCards() {
  document.querySelectorAll(".copy-code").forEach((button) => {
    button.addEventListener("click", () => copyCode(button));
  });

  document.querySelectorAll(".open-folder").forEach((button) => {
    button.addEventListener("click", () => abrirPasta(button.dataset.code));
  });
}

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

async function abrirPasta(codigo) {
  const data = veiculos.find((item) => item.codigo === codigo);
  if (!data) return;

  pastaAberta = data;

  detailTitle.textContent = "BAIRRO DA CIDADE";
  detailDistrict.textContent = formatarArea(data.zona_area);
  detailCode.textContent = data.codigo;
  detailCode.dataset.code = data.codigo;
  detailVehicles.textContent = data.veiculos_vinculados || 0;
  detailCampaigns.textContent = data.campanhas_ativas || 0;
  detailQuizzes.textContent = formatarNumero(data.quiz_interacao || 0);

  openedFolderLabel.textContent = `Pasta aberta: ${data.nome}`;

  generalButton.classList.add("is-hidden");
  createFolderButton.classList.add("is-hidden");
  folderHeaderBackButton.classList.remove("is-hidden");
  playlistHeader.classList.add("is-folder-context");
  folderGrid.classList.add("is-hidden");
  folderPage.classList.remove("is-hidden");

  await carregarPlaylist(data.codigo);

  folderPage.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

async function carregarPlaylist(codigo) {
  if (!playlistList) return;

  playlistList.innerHTML = `
    <div class="playlist-empty">Carregando playlist...</div>
  `;

  const { data, error } = await supabaseClient
    .from("playlist_veiculos")
    .select("*")
    .eq("codigo", codigo)
    .order("ordem", { ascending: true });

  if (error) {
    console.error("Erro ao carregar playlist:", error);
    playlistList.innerHTML = `
      <div class="playlist-empty">Erro ao carregar playlist.</div>
    `;
    return;
  }

  if (!data || data.length === 0) {
    playlistList.innerHTML = `
      <div class="playlist-empty">Nenhuma mídia adicionada ainda.</div>
    `;
    return;
  }

  playlistList.innerHTML = "";

  data.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "playlist-item";

    row.innerHTML = `
      <button class="drag-button" type="button">⠿</button>

      <strong>${index + 1}.</strong>

      <span class="playlist-name">
        ${item.nome_arquivo || item.nome || item.link_url || "Mídia sem nome"}
      </span>

      <span class="playlist-type">
        ${item.tipo || "video"}
      </span>

      <div class="playlist-actions">
        <button type="button" onclick="abrirMidia('${item.id}')">↗</button>
        <button type="button" onclick="editarMidia('${item.id}')">✎</button>
        <button type="button" onclick="excluirMidia('${item.id}')">⌫</button>
      </div>
    `;

    playlistList.appendChild(row);
  });
}

function closeFolderPage() {
  pastaAberta = null;

  folderPage.classList.add("is-hidden");
  folderGrid.classList.remove("is-hidden");
  generalButton.classList.remove("is-hidden");
  createFolderButton.classList.remove("is-hidden");
  folderHeaderBackButton.classList.add("is-hidden");
  playlistHeader.classList.remove("is-folder-context");

  folderGrid.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

folderHeaderBackButton?.addEventListener("click", closeFolderPage);

async function abrirMidia(id) {
  const { data, error } = await supabaseClient
    .from("playlist_veiculos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return;

  const url = data.arquivo_url || data.video_url || data.link_url;

  if (url) {
    window.open(url, "_blank");
  }
}

async function editarMidia(id) {
  alert("Função de editar mídia será conectada no próximo passo.");
}

async function excluirMidia(id) {
  const confirmar = confirm("Deseja excluir esta mídia da playlist?");
  if (!confirmar) return;

  const { error } = await supabaseClient
    .from("playlist_veiculos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir mídia:", error);
    alert("Erro ao excluir mídia.");
    return;
  }

  if (pastaAberta) {
    await carregarPlaylist(pastaAberta.codigo);
  }
}

function formatarArea(valor) {
  if (!valor) return "0 km2";
  return `${String(valor).replace(".", ",")} km2`;
}

function formatarNumero(valor) {
  return Number(valor).toLocaleString("pt-BR");
}
