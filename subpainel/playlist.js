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
const detailMapImage = document.querySelector("#detailMapImage");

const folderPage = document.querySelector("#folderPage");
const folderGrid = document.querySelector("#folderGrid");
const openedFolderLabel = document.querySelector("#openedFolderLabel");
const folderHeaderBackButton = document.querySelector("#folderHeaderBackButton");
const generalButton = document.querySelector("#generalButton");
const createFolderButton = document.querySelector("#createFolderButton");
const playlistHeader = document.querySelector("#playlistHeader");
const playlistList = document.querySelector("#playlistList");
const addMediaButton = document.querySelector("#addMediaButton");

document.addEventListener("DOMContentLoaded", iniciarPagina);

async function iniciarPagina() {
  await carregarVeiculos();

  folderHeaderBackButton?.addEventListener("click", closeFolderPage);
  addMediaButton?.addEventListener("click", adicionarMidia);
  detailCode?.addEventListener("click", () => copyCode(detailCode));
}

async function carregarVeiculos() {
  const { data, error } = await supabaseClient
    .from("veiculos")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao carregar veiculos:", error);
    folderGrid.innerHTML = `<p class="playlist-empty">Erro ao carregar dados.</p>`;
    return;
  }

  veiculos = data || [];
  renderizarPastas();
}

function renderizarPastas() {
  folderGrid.innerHTML = "";

  if (!veiculos.length) {
    folderGrid.innerHTML = `<p class="playlist-empty">Nenhuma pasta cadastrada.</p>`;
    return;
  }

  veiculos.forEach((item) => {
    const statusBanco = String(item.status || "ativo").toLowerCase();
    const ativo = statusBanco !== "inativo";
    const statusTexto = ativo ? "Ativo" : "Inativo";
    const statusClasse = ativo ? "active" : "inactive";

    const card = document.createElement("article");
    card.className = "folder-card";

    card.innerHTML = `
      <div class="status-line">
        <span>
          <span class="status-dot ${statusClasse}"></span>
          <strong>${statusTexto}</strong>
        </span>
        <button class="copy-code" type="button" data-code="${item.codigo}">
          ${item.codigo}
        </button>
      </div>

      <div class="folder-cover salvador">
        ${item.imagem_url ? `<img src="${item.imagem_url}" alt="${item.nome}">` : ""}
      </div>

      <h2>${item.nome}</h2>

      <div class="folder-stats">
        <span>
          <small>Veiculos</small>
          <strong>${item.veiculos_vinculados || 0}</strong>
        </span>
        <span>
          <small>Zona</small>
          <strong>${formatarArea(item.zona_area)}</strong>
        </span>
      </div>

      <button class="open-folder" type="button" data-code="${item.codigo}">
        Abrir pagina
      </button>
    `;

    folderGrid.appendChild(card);
  });

  ativarEventosPastas();
}

function ativarEventosPastas() {
  document.querySelectorAll(".copy-code").forEach((button) => {
    button.addEventListener("click", () => copyCode(button));
  });

  document.querySelectorAll(".open-folder").forEach((button) => {
    button.addEventListener("click", () => abrirPasta(button.dataset.code));
  });
}

function copyCode(button) {
  const code = button.dataset.code;
  if (!code) return;

  navigator.clipboard?.writeText(code);

  button.classList.add("copied");
  button.textContent = "Copiado";

  setTimeout(() => {
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

  if (data.mapa_url) {
    detailMapImage.src = data.mapa_url;
  } else {
    detailMapImage.src = "mapa-salvador.png";
  }

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
  playlistList.innerHTML = `<p class="playlist-empty">Carregando playlist...</p>`;

  const { data, error } = await supabaseClient
    .from("playlist_veiculos")
    .select("*")
    .eq("codigo", codigo)
    .order("ordem", { ascending: true });

  if (error) {
    console.error("Erro ao carregar playlist:", error);
    playlistList.innerHTML = `<p class="playlist-empty">Erro ao carregar playlist.</p>`;
    return;
  }

  if (!data || !data.length) {
    playlistList.innerHTML = `<p class="playlist-empty">Nenhuma mídia adicionada ainda.</p>`;
    return;
  }

  playlistList.innerHTML = "";

  data.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "file-row";

    row.innerHTML = `
      <span class="drag-handle">⋮⋮</span>
      <strong>${index + 1}.</strong>

      <p>
        ${item.nome_arquivo || item.nome || item.link_url || "Midia sem nome"}
        <small style="display:block;opacity:.65;text-transform:uppercase;margin-top:4px;">
          ${item.tipo || "video"}
        </small>
      </p>

      <div class="file-actions">
        <button type="button" onclick="abrirMidia('${item.id}')">↗</button>
        <button type="button" onclick="editarMidia('${item.id}')">✎</button>
        <button type="button" onclick="excluirMidia('${item.id}')">⌫</button>
      </div>
    `;

    playlistList.appendChild(row);
  });
}

async function adicionarMidia() {
  if (!pastaAberta) {
    alert("Abra uma pasta primeiro.");
    return;
  }

  const tipo = prompt("Tipo da mídia: video, imagem, noticia ou quiz");

  if (!tipo) return;

  const tipoLimpo = tipo.trim().toLowerCase();

  if (!["video", "imagem", "noticia", "quiz"].includes(tipoLimpo)) {
    alert("Tipo inválido. Use: video, imagem, noticia ou quiz.");
    return;
  }

  const nome = prompt("Nome da mídia:");
  if (!nome) return;

  let linkUrl = null;
  let arquivoUrl = null;
  let storagePath = null;
  let nomeArquivo = nome;

  if (tipoLimpo === "noticia" || tipoLimpo === "quiz") {
    linkUrl = prompt("Cole a URL que vai abrir:");
    if (!linkUrl) return;
  } else {
    alert("Na próxima etapa vamos ligar o botão ao upload real do arquivo no Storage. Agora ele salva o item no banco.");
  }

  const { data: playlistAtual } = await supabaseClient
    .from("playlist_veiculos")
    .select("ordem")
    .eq("codigo", pastaAberta.codigo)
    .order("ordem", { ascending: false })
    .limit(1);

  const proximaOrdem = playlistAtual?.length ? Number(playlistAtual[0].ordem) + 1 : 1;

  const { error } = await supabaseClient
    .from("playlist_veiculos")
    .insert({
      codigo: pastaAberta.codigo,
      nome,
      tipo: tipoLimpo,
      nome_arquivo: nomeArquivo,
      arquivo_url: arquivoUrl,
      storage_path: storagePath,
      link_url: linkUrl,
      ordem: proximaOrdem,
      ativo: true,
      duracao: tipoLimpo === "video" ? null : 10,
    });

  if (error) {
    console.error("Erro ao adicionar mídia:", error);
    alert("Erro ao adicionar mídia.");
    return;
  }

  await carregarPlaylist(pastaAberta.codigo);
}

async function abrirMidia(id) {
  const { data, error } = await supabaseClient
    .from("playlist_veiculos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    alert("Erro ao abrir mídia.");
    return;
  }

  const url = data.arquivo_url || data.video_url || data.link_url;

  if (!url) {
    alert("Esta mídia ainda não tem URL.");
    return;
  }

  window.open(url, "_blank");
}

async function editarMidia(id) {
  const novoNome = prompt("Novo nome da mídia:");
  if (!novoNome) return;

  const { error } = await supabaseClient
    .from("playlist_veiculos")
    .update({
      nome: novoNome,
      nome_arquivo: novoNome,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao editar mídia:", error);
    alert("Erro ao editar mídia.");
    return;
  }

  if (pastaAberta) {
    await carregarPlaylist(pastaAberta.codigo);
  }
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

function formatarArea(valor) {
  if (!valor) return "0 km2";
  return `${String(valor).replace(".", ",")} km2`;
}

function formatarNumero(valor) {
  return Number(valor).toLocaleString("pt-BR");
}
