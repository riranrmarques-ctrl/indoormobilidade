const SUPABASE_URL = "https://phuerrdaioaoylukhqml.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_u5dGbUm03WG2056mW2ySNQ_xltzBtU4";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let veiculos = [];
let pastaAberta = null;
let editPreviewObjectUrl = null;

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

const editModal = document.querySelector("#editModal");
const editNome = document.querySelector("#editNome");
const editZona = document.querySelector("#editZona");
const editImagem = document.querySelector("#editImagem");
const editPreviewEmpty = document.querySelector("#editPreviewEmpty");
const editPreviewImage = document.querySelector("#editPreviewImage");
const editZoom = document.querySelector("#editZoom");
const editPosX = document.querySelector("#editPosX");
const editPosY = document.querySelector("#editPosY");
const cancelEdit = document.querySelector("#cancelEdit");
const saveEdit = document.querySelector("#saveEdit");

const uploadModal = document.querySelector("#uploadModal");
const mediaTipo = document.querySelector("#mediaTipo");
const mediaNome = document.querySelector("#mediaNome");
const mediaFile = document.querySelector("#mediaFile");
const mediaLink = document.querySelector("#mediaLink");
const mediaFileBox = document.querySelector("#mediaFileBox");
const mediaLinkBox = document.querySelector("#mediaLinkBox");
const previewImage = document.querySelector("#previewImage");
const previewVideo = document.querySelector("#previewVideo");
const previewEmpty = document.querySelector("#previewEmpty");
const cancelUpload = document.querySelector("#cancelUpload");
const confirmUpload = document.querySelector("#confirmUpload");

document.addEventListener("DOMContentLoaded", iniciarPagina);

async function iniciarPagina() {
  await carregarVeiculos();

  folderHeaderBackButton?.addEventListener("click", closeFolderPage);
  addMediaButton?.addEventListener("click", abrirModalUpload);
  editVehicleButton?.addEventListener("click", editarPasta);
  deleteVehicleButton?.addEventListener("click", excluirPasta);
  createFolderButton?.addEventListener("click", criarPasta);

  detailCode?.addEventListener("click", () => copyCode(detailCode));

  cancelEdit?.addEventListener("click", fecharModalEdicao);
  saveEdit?.addEventListener("click", salvarEdicaoPasta);
  editImagem?.addEventListener("change", atualizarPreviewEdicao);
  editZoom?.addEventListener("input", aplicarAjustePreviewEdicao);
  editPosX?.addEventListener("input", aplicarAjustePreviewEdicao);
  editPosY?.addEventListener("input", aplicarAjustePreviewEdicao);

  cancelUpload?.addEventListener("click", fecharModalUpload);
  confirmUpload?.addEventListener("click", salvarNovaMidia);
  mediaTipo?.addEventListener("change", atualizarCamposUpload);
  mediaFile?.addEventListener("change", atualizarPreviewUpload);
}

async function carregarVeiculos() {
  const { data, error } = await supabaseClient
    .from("veiculos")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao carregar veiculos:", error);
    folderGrid.innerHTML = `<p class="playlist-empty">Erro ao carregar veiculos.</p>`;
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
    const imagemUrl = item.imagem_url || "";
    const zoom = item.imagem_zoom || 1;
    const posX = item.imagem_pos_x || 0;
    const posY = item.imagem_pos_y || 0;

    const card = document.createElement("article");
    card.className = "folder-card";

    card.innerHTML = `
      <div class="status-line">
        <span>
          <span class="status-dot ${ativo ? "active" : "inactive"}"></span>
          <strong>${ativo ? "Ativo" : "Inativo"}</strong>
        </span>

        <button class="copy-code" type="button" data-code="${item.codigo || ""}">
          ${item.codigo || "---"}
        </button>
      </div>

      <div class="folder-cover">
        ${
          imagemUrl
            ? `<img src="${imagemUrl}" alt="${item.nome || "Pasta"}" style="transform: translate(${posX}%, ${posY}%) scale(${zoom});">`
            : `<span class="folder-cover-empty"></span>`
        }
      </div>

      <h2>${item.nome || "Pasta sem nome"}</h2>

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

      <button class="open-folder" type="button" data-code="${item.codigo || ""}">
        Abrir pagina
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
  const code = button.dataset.code || button.textContent.trim();
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
  detailCode.textContent = data.codigo || "---";
  detailCode.dataset.code = data.codigo || "";
  detailVehicles.textContent = data.veiculos_vinculados || 0;
  detailCampaigns.textContent = data.campanhas_ativas || 0;
  detailQuizzes.textContent = formatarNumero(data.quiz_interacao || 0);

  const imagemDetalhe = data.mapa_url || data.imagem_url;

  if (imagemDetalhe) {
    detailMapImage.src = imagemDetalhe;
    detailMapImage.style.display = "block";
  } else {
    detailMapImage.removeAttribute("src");
    detailMapImage.style.display = "none";
  }

  openedFolderLabel.textContent = `Pasta aberta: ${data.nome || ""}`;

  generalButton?.classList.add("is-hidden");
  createFolderButton?.classList.add("is-hidden");
  folderHeaderBackButton?.classList.remove("is-hidden");
  playlistHeader?.classList.add("is-folder-context");
  folderGrid?.classList.add("is-hidden");
  folderPage?.classList.remove("is-hidden");

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
    console.error("Erro ao carregar playlist:", error);
    playlistList.innerHTML = `<p class="playlist-empty">Erro ao carregar playlist.</p>`;
    return;
  }

  if (!data || !data.length) {
    playlistList.innerHTML = `<p class="playlist-empty">Nenhuma midia adicionada ainda.</p>`;
    return;
  }

  playlistList.innerHTML = "";

  data.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "file-row";

    row.innerHTML = `
      <span class="drag-handle">::</span>

      <strong>${index + 1}.</strong>

      <p>
        ${item.nome_arquivo || item.nome || item.arquivo_url || item.video_url || "Midia sem nome"}
        <small>
          ${item.tipo || "video"}
        </small>
      </p>

      <div class="file-actions">
        <button type="button" data-action="abrir" data-id="${item.id}">Abrir</button>
        <button type="button" data-action="editar" data-id="${item.id}">Editar</button>
        <button type="button" data-action="excluir" data-id="${item.id}">Excluir</button>
      </div>
    `;

    playlistList.appendChild(row);
  });

  playlistList.querySelectorAll("button[data-action]").forEach((button) => {
    const id = button.dataset.id;

    button.addEventListener("click", () => {
      if (button.dataset.action === "abrir") abrirMidia(id);
      if (button.dataset.action === "editar") editarMidia(id);
      if (button.dataset.action === "excluir") excluirMidia(id);
    });
  });
}

async function criarPasta() {
  const nome = prompt("Nome da nova pasta:");
  if (!nome) return;

  const zona = prompt("Zona / area em km2:");
  const codigo = gerarCodigoPasta();

  const { error } = await supabaseClient
    .from("veiculos")
    .insert({
      nome: nome.trim(),
      codigo,
      zona_area: converterNumero(zona || 0),
      veiculos_vinculados: 0,
      campanhas_ativas: 0,
      quiz_interacao: 0,
      status: "ativo",
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    });

  if (error) {
    console.error("Erro ao criar pasta:", error);
    alert("Erro ao criar pasta.");
    return;
  }

  await carregarVeiculos();
}

function abrirModalUpload() {
  if (!pastaAberta) {
    alert("Abra uma pasta primeiro.");
    return;
  }

  mediaTipo.value = "video";
  mediaNome.value = "";
  mediaFile.value = "";
  mediaLink.value = "";

  limparPreviewUpload();
  atualizarCamposUpload();

  uploadModal.classList.remove("is-hidden");
  uploadModal.setAttribute("aria-hidden", "false");
}

function fecharModalUpload() {
  uploadModal.classList.add("is-hidden");
  uploadModal.setAttribute("aria-hidden", "true");
  limparPreviewUpload();
}

function atualizarCamposUpload() {
  const tipo = mediaTipo.value;

  limparPreviewUpload();

  if (tipo === "video") {
    mediaFileBox.classList.remove("is-hidden");
    mediaLinkBox.classList.add("is-hidden");
    mediaFile.accept = "video/mp4,video/webm";
  }

  if (tipo === "imagem") {
    mediaFileBox.classList.remove("is-hidden");
    mediaLinkBox.classList.add("is-hidden");
    mediaFile.accept = "image/jpeg,image/jpg,image/png,image/webp";
  }

  if (tipo === "noticia" || tipo === "quiz") {
    mediaFileBox.classList.add("is-hidden");
    mediaLinkBox.classList.remove("is-hidden");
    mediaFile.accept = "";
    mediaFile.value = "";
  }
}

function atualizarPreviewUpload() {
  const file = mediaFile.files[0];
  if (!file) {
    limparPreviewUpload();
    return;
  }

  const url = URL.createObjectURL(file);

  previewEmpty.style.display = "none";

  if (file.type.startsWith("image")) {
    previewImage.src = url;
    previewImage.style.display = "block";
    previewVideo.style.display = "none";
    previewVideo.removeAttribute("src");
  } else if (file.type.startsWith("video")) {
    previewVideo.src = url;
    previewVideo.style.display = "block";
    previewImage.style.display = "none";
    previewImage.removeAttribute("src");
  }
}

function limparPreviewUpload() {
  previewImage.removeAttribute("src");
  previewVideo.removeAttribute("src");

  previewImage.style.display = "none";
  previewVideo.style.display = "none";

  if (previewEmpty) {
    previewEmpty.style.display = "block";
  }
}

async function salvarNovaMidia() {
  if (!pastaAberta) return;

  const tipoLimpo = mediaTipo.value;
  const nome = mediaNome.value.trim();

  if (!nome) {
    alert("Digite o nome da midia.");
    return;
  }

  let arquivo_url = null;
  let storage_path = null;
  let nome_arquivo = nome;

  if (tipoLimpo === "video" || tipoLimpo === "imagem") {
    const file = mediaFile.files[0];

    if (!file) {
      alert("Escolha um arquivo.");
      return;
    }

    const extensao = file.name.split(".").pop();
    const nomeSeguro = limparNomeArquivo(nome);
    const pastaSegura = limparNomeArquivo(pastaAberta.codigo);
    const caminho = `${pastaSegura}/${Date.now()}_${nomeSeguro}.${extensao}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("playlist-media")
      .upload(caminho, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Erro no upload:", uploadError);
      alert("Erro ao enviar arquivo para o Storage.");
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
    arquivo_url = mediaLink.value.trim();

    if (!arquivo_url) {
      alert("Cole a URL.");
      return;
    }

    nome_arquivo = nome;
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
      video_url: tipoLimpo === "video" ? arquivo_url : null,
      storage_path,
      ordem,
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    });

  if (error) {
    console.error("Erro ao salvar midia:", error);
    alert("Erro ao salvar midia no banco.");
    return;
  }

  fecharModalUpload();
  await carregarPlaylist(pastaAberta.codigo);
}

function editarPasta() {
  if (!pastaAberta) return;

  editNome.value = pastaAberta.nome || "";
  editZona.value = pastaAberta.zona_area || "";
  editImagem.value = "";
  editZoom.value = pastaAberta.imagem_zoom || 1;
  editPosX.value = pastaAberta.imagem_pos_x || 0;
  editPosY.value = pastaAberta.imagem_pos_y || 0;

  if (pastaAberta.imagem_url) {
    editPreviewImage.src = pastaAberta.imagem_url;
    editPreviewImage.style.display = "block";
    editPreviewEmpty.style.display = "none";
  } else {
    editPreviewImage.removeAttribute("src");
    editPreviewImage.style.display = "none";
    editPreviewEmpty.style.display = "grid";
  }

  aplicarAjustePreviewEdicao();
  editModal.classList.remove("is-hidden");
  editModal.setAttribute("aria-hidden", "false");
}

function fecharModalEdicao() {
  editModal.classList.add("is-hidden");
  editModal.setAttribute("aria-hidden", "true");

  if (editPreviewObjectUrl) {
    URL.revokeObjectURL(editPreviewObjectUrl);
    editPreviewObjectUrl = null;
  }
}

function atualizarPreviewEdicao() {
  const file = editImagem.files[0];

  if (!file) {
    if (pastaAberta?.imagem_url) {
      editPreviewImage.src = pastaAberta.imagem_url;
      editPreviewImage.style.display = "block";
      editPreviewEmpty.style.display = "none";
    }
    return;
  }

  if (editPreviewObjectUrl) {
    URL.revokeObjectURL(editPreviewObjectUrl);
  }

  editPreviewObjectUrl = URL.createObjectURL(file);
  editPreviewImage.src = editPreviewObjectUrl;
  editPreviewImage.style.display = "block";
  editPreviewEmpty.style.display = "none";
  aplicarAjustePreviewEdicao();
}

function aplicarAjustePreviewEdicao() {
  if (!editPreviewImage) return;

  editPreviewImage.style.transform = `translate(${editPosX.value}%, ${editPosY.value}%) scale(${editZoom.value})`;
}

async function salvarEdicaoPasta() {
  if (!pastaAberta) return;

  const novoNome = editNome.value.trim();
  const novaZona = converterNumero(editZona.value);

  if (!novoNome) {
    alert("Digite o nome da pasta.");
    return;
  }

  let imagem_url = pastaAberta.imagem_url || null;
  let imagem_path = pastaAberta.imagem_path || null;

  const file = editImagem.files[0];

  if (file) {
    const extensao = file.name.split(".").pop();
    const pastaSegura = limparNomeArquivo(pastaAberta.codigo);
    const caminho = `${pastaSegura}/capa_${Date.now()}.${extensao}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("playlist-media")
      .upload(caminho, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Erro ao enviar imagem:", uploadError);
      alert("Erro ao enviar imagem.");
      return;
    }

    const { data: publicData } = supabaseClient.storage
      .from("playlist-media")
      .getPublicUrl(caminho);

    imagem_url = publicData.publicUrl;
    imagem_path = caminho;
  }

  const codigoAtual = pastaAberta.codigo;

  const updatePayload = {
    nome: novoNome,
    zona_area: novaZona,
    imagem_url,
    imagem_path,
    imagem_zoom: converterNumero(editZoom.value) || 1,
    imagem_pos_x: converterNumero(editPosX.value),
    imagem_pos_y: converterNumero(editPosY.value),
    atualizado_em: new Date().toISOString(),
  };

  let { error } = await supabaseClient
    .from("veiculos")
    .update(updatePayload)
    .eq("codigo", codigoAtual);

  if (error && String(error.message || "").includes("imagem_")) {
    const fallbackPayload = {
      nome: novoNome,
      zona_area: novaZona,
      imagem_url,
      imagem_path,
      atualizado_em: new Date().toISOString(),
    };

    const fallback = await supabaseClient
      .from("veiculos")
      .update(fallbackPayload)
      .eq("codigo", codigoAtual);

    error = fallback.error;
  }

  if (error) {
    console.error("Erro ao salvar edicao:", error);
    alert("Erro ao salvar edicao.");
    return;
  }

  fecharModalEdicao();

  await carregarVeiculos();
  await abrirPasta(codigoAtual);
}

async function excluirPasta() {
  if (!pastaAberta) return;

  const confirmar = confirm(
    `Deseja excluir a pasta ${pastaAberta.nome} e toda a playlist dela?`
  );

  if (!confirmar) return;

  const { data: midias } = await supabaseClient
    .from("playlist_veiculos")
    .select("storage_path")
    .eq("codigo", pastaAberta.codigo);

  const arquivos = (midias || [])
    .map((item) => item.storage_path)
    .filter(Boolean);

  if (pastaAberta.imagem_path) {
    arquivos.push(pastaAberta.imagem_path);
  }

  if (arquivos.length) {
    await supabaseClient.storage.from("playlist-media").remove(arquivos);
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
    console.error("Erro ao excluir pasta:", error);
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

  if (error || !data) {
    alert("Erro ao abrir midia.");
    return;
  }

  const url = data.arquivo_url || data.video_url;

  if (!url) {
    alert("Esta midia ainda nao tem URL.");
    return;
  }

  window.open(url, "_blank");
}

async function editarMidia(id) {
  const novoNome = prompt("Novo nome da midia:");
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
    console.error("Erro ao editar midia:", error);
    alert("Erro ao editar midia.");
    return;
  }

  if (pastaAberta) {
    await carregarPlaylist(pastaAberta.codigo);
  }
}

async function excluirMidia(id) {
  const confirmar = confirm("Deseja excluir esta midia?");
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
    console.error("Erro ao excluir midia:", error);
    alert("Erro ao excluir midia.");
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

  openedFolderLabel.textContent = "Gerencie as pastas e campanhas dos veiculos.";
}

function limparNomeArquivo(nome) {
  return String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

function converterNumero(valor) {
  return Number(String(valor || 0).replace(",", ".")) || 0;
}

function formatarArea(valor) {
  if (!valor) return "0 km2";
  return `${String(valor).replace(".", ",")} km2`;
}

function formatarNumero(valor) {
  return Number(valor || 0).toLocaleString("pt-BR");
}

function gerarCodigoPasta() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let codigo = "";

  for (let i = 0; i < 4; i++) {
    codigo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }

  return codigo;
}

window.abrirMidia = abrirMidia;
window.editarMidia = editarMidia;
window.excluirMidia = excluirMidia;
