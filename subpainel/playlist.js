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
const editVehicleButton = document.querySelector("#editVehicleButton");
const deleteVehicleButton = document.querySelector("#deleteVehicleButton");

document.addEventListener("DOMContentLoaded", iniciarPagina);

async function iniciarPagina() {
  await carregarVeiculos();

  folderHeaderBackButton?.addEventListener("click", closeFolderPage);
  addMediaButton?.addEventListener("click", adicionarMidia);
  editVehicleButton?.addEventListener("click", editarPasta);
  deleteVehicleButton?.addEventListener("click", excluirPasta);
  detailCode?.addEventListener("click", () => copyCode(detailCode));
}

async function carregarVeiculos() {
  const { data, error } = await supabaseClient
    .from("veiculos")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error(error);
    folderGrid.innerHTML = `<p class="playlist-empty">Erro ao carregar veículos.</p>`;
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
    const ativo = String(item.status || "ativo").toLowerCase() !== "inativo";

    const card = document.createElement("article");
    card.className = "folder-card";

    card.innerHTML = `
      <div class="status-line">
        <span>
          <span class="status-dot ${ativo ? "active" : "inactive"}"></span>
          <strong>${ativo ? "Ativo" : "Inativo"}</strong>
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
        <span><small>Veículos</small><strong>${item.veiculos_vinculados || 0}</strong></span>
        <span><small>Zona</small><strong>${formatarArea(item.zona_area)}</strong></span>
      </div>

      <button class="open-folder" type="button" data-code="${item.codigo}">
        Abrir página
      </button>
    `;

    folderGrid.appendChild(card);
  });

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

  detailTitle.textContent = data.nome || "BAIRRO DA CIDADE";
  detailDistrict.textContent = formatarArea(data.zona_area);
  detailCode.textContent = data.codigo;
  detailCode.dataset.code = data.codigo;
  detailVehicles.textContent = data.veiculos_vinculados || 0;
  detailCampaigns.textContent = data.campanhas_ativas || 0;
  detailQuizzes.textContent = formatarNumero(data.quiz_interacao || 0);

  detailMapImage.src = data.mapa_url || data.imagem_url || "mapa-salvador.png";
  openedFolderLabel.textContent = `Pasta aberta: ${data.nome}`;

  generalButton.classList.add("is-hidden");
  createFolderButton.classList.add("is-hidden");
  folderHeaderBackButton.classList.remove("is-hidden");
  playlistHeader.classList.add("is-folder-context");
  folderGrid.classList.add("is-hidden");
  folderPage.classList.remove("is-hidden");

  await carregarPlaylist(data.codigo);
}

async function carregarPlaylist(codigo) {
  playlistList.innerHTML = `<p class="playlist-empty">Carregando playlist...</p>`;

  const { data, error } = await supabaseClient
    .from("playlist_veiculos")
    .select("*")
    .eq("codigo", codigo)
    .order("ordem", { ascending: true });

  if (error) {
    console.error(error);
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
        ${item.nome_arquivo || item.nome || item.link_url || "Mídia sem nome"}
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

  let arquivo_url = null;
  let storage_path = null;
  let link_url = null;
  let nome_arquivo = nome;

  if (tipoLimpo === "video" || tipoLimpo === "imagem") {
    const file = await escolherArquivo(tipoLimpo);
    if (!file) return;

    const extensao = file.name.split(".").pop();
    const nomeSeguro = limparNomeArquivo(nome);
    const caminho = `${pastaAberta.codigo}/${Date.now()}_${nomeSeguro}.${extensao}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("playlist-media")
      .upload(caminho, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      alert("Erro ao enviar arquivo para o Storage. Verifique se você está logado e se as políticas estão liberadas.");
      return;
    }

    const { data: publicData } = supabaseClient.storage
      .from("playlist-media")
      .getPublicUrl(caminho);

    arquivo_url = publicData.publicUrl;
    storage_path = caminho;
    nome_arquivo = file.name;
  }

  if (tipoLimpo === "noticia" || tipoLimpo === "quiz") {
    link_url = prompt("Cole a URL que vai abrir:");
    if (!link_url) return;
  }

  const { data: ultima } = await supabaseClient
    .from("playlist_veiculos")
    .select("ordem")
    .eq("codigo", pastaAberta.codigo)
    .order("ordem", { ascending: false })
    .limit(1);

  const ordem = ultima?.length ? Number(ultima[0].ordem) + 1 : 1;

  const { error } = await supabaseClient
    .from("playlist_veiculos")
    .insert({
      codigo: pastaAberta.codigo,
      nome,
      tipo: tipoLimpo,
      nome_arquivo,
      arquivo_url,
      storage_path,
      link_url,
      ordem,
      ativo: true,
      duracao: tipoLimpo === "video" ? null : 10,
    });

  if (error) {
    console.error(error);
    alert("Erro ao salvar mídia no banco.");
    return;
  }

  await carregarPlaylist(pastaAberta.codigo);
}

async function editarPasta() {
  if (!pastaAberta) return;

  const novoNome = prompt("Nome do bairro/pasta:", pastaAberta.nome || "");
  if (!novoNome) return;

  const novoStatus = prompt("Status: ativo ou inativo", pastaAberta.status || "ativo") || pastaAberta.status;
  const novosVeiculos = prompt("Veículos vinculados:", pastaAberta.veiculos_vinculados || 0);
  const novaZona = prompt("Zona de área:", pastaAberta.zona_area || 0);
  const novasCampanhas = prompt("Campanhas ativas:", pastaAberta.campanhas_ativas || 0);
  const novosQuizzes = prompt("Quiz interação:", pastaAberta.quiz_interacao || 0);

  let imagem_url = pastaAberta.imagem_url || null;
  let imagem_path = pastaAberta.imagem_path || null;

  const trocarImagem = confirm("Deseja trocar a imagem/mapa desta pasta?");

  if (trocarImagem) {
    const file = await escolherArquivo("imagem");
    if (file) {
      const extensao = file.name.split(".").pop();
      const caminho = `${pastaAberta.codigo}/capa_${Date.now()}.${extensao}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("playlist-media")
        .upload(caminho, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        alert("Erro ao enviar imagem.");
        return;
      }

      const { data: publicData } = supabaseClient.storage
        .from("playlist-media")
        .getPublicUrl(caminho);

      imagem_url = publicData.publicUrl;
      imagem_path = caminho;
    }
  }

  const { error } = await supabaseClient
    .from("veiculos")
    .update({
      nome: novoNome,
      status: novoStatus,
      veiculos_vinculados: Number(novosVeiculos) || 0,
      zona_area: converterNumero(novaZona),
      campanhas_ativas: Number(novasCampanhas) || 0,
      quiz_interacao: Number(String(novosQuizzes).replace(/\D/g, "")) || 0,
      imagem_url,
      imagem_path,
      mapa_url: imagem_url,
      mapa_path: imagem_path,
      atualizado_em: new Date().toISOString(),
    })
    .eq("codigo", pastaAberta.codigo);

  if (error) {
    console.error(error);
    alert("Erro ao editar pasta.");
    return;
  }

  await carregarVeiculos();
  await abrirPasta(pastaAberta.codigo);
}

async function excluirPasta() {
  if (!pastaAberta) return;

  const confirmar = confirm(`Deseja excluir a pasta ${pastaAberta.nome} e toda a playlist dela?`);
  if (!confirmar) return;

  const { data: midias } = await supabaseClient
    .from("playlist_veiculos")
    .select("storage_path")
    .eq("codigo", pastaAberta.codigo);

  const arquivos = (midias || [])
    .map((item) => item.storage_path)
    .filter(Boolean);

  if (arquivos.length) {
    await supabaseClient.storage
      .from("playlist-media")
      .remove(arquivos);
  }

  await supabaseClient
    .from("playlist_veiculos")
    .delete()
    .eq("codigo", pastaAberta.codigo);

  const { error } = await supabaseClient
    .from("veiculos")
    .delete()
    .eq("codigo", pastaAberta.codigo);

  if (error) {
    console.error(error);
    alert("Erro ao excluir pasta.");
    return;
  }

  closeFolderPage();
  await carregarVeiculos();
}

async function abrirMidia(id) {
  const { data, error } = await supabaseClient
    .from("playlist_veiculos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return alert("Erro ao abrir mídia.");

  const url = data.arquivo_url || data.video_url || data.link_url;

  if (!url) return alert("Esta mídia ainda não tem URL.");

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
    console.error(error);
    alert("Erro ao editar mídia.");
    return;
  }

  await carregarPlaylist(pastaAberta.codigo);
}

async function excluirMidia(id) {
  const confirmar = confirm("Deseja excluir esta mídia?");
  if (!confirmar) return;

  const { data: midia } = await supabaseClient
    .from("playlist_veiculos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (midia?.storage_path) {
    await supabaseClient.storage
      .from("playlist-media")
      .remove([midia.storage_path]);
  }

  const { error } = await supabaseClient
    .from("playlist_veiculos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Erro ao excluir mídia.");
    return;
  }

  await carregarPlaylist(pastaAberta.codigo);
}

function escolherArquivo(tipo) {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";

    if (tipo === "video") {
      input.accept = "video/mp4,video/webm";
    } else {
      input.accept = "image/jpeg,image/jpg,image/png,image/webp";
    }

    input.onchange = () => resolve(input.files[0] || null);
    input.click();
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
}

function limparNomeArquivo(nome) {
  return String(nome)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
}

function converterNumero(valor) {
  return Number(String(valor).replace(",", ".")) || 0;
}

function formatarArea(valor) {
  if (!valor) return "0 km2";
  return `${String(valor).replace(".", ",")} km2`;
}

function formatarNumero(valor) {
  return Number(valor || 0).toLocaleString("pt-BR");
}
