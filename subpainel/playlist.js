const SUPABASE_URL = "https://phuerrdaioaoylukhqml.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let veiculos = [];
let pastaAberta = null;

const folderGrid = document.querySelector("#folderGrid");

const editModal = document.querySelector("#editModal");
const editNome = document.querySelector("#editNome");
const editZona = document.querySelector("#editZona");
const editImagem = document.querySelector("#editImagem");

const previewImg = document.querySelector("#previewImg");
const zoom = document.querySelector("#zoom");
const posX = document.querySelector("#posX");
const posY = document.querySelector("#posY");

document.addEventListener("DOMContentLoaded", carregarVeiculos);

/* ========================= */
/* CARREGAR */
/* ========================= */

async function carregarVeiculos() {
  const { data } = await supabaseClient
    .from("veiculos")
    .select("*");

  veiculos = data || [];
  renderizar();
}

function renderizar() {
  folderGrid.innerHTML = "";

  veiculos.forEach(v => {

    const card = document.createElement("div");
    card.className = "folder-card";

    card.innerHTML = `
      <div class="folder-cover">
        ${v.imagem_url ? `<img src="${v.imagem_url}">` : ""}
      </div>

      <h3>${v.nome}</h3>

      <button onclick="editar('${v.codigo}')">
        Editar
      </button>
    `;

    folderGrid.appendChild(card);
  });
}

/* ========================= */
/* EDITAR */
/* ========================= */

window.editar = (codigo) => {

  pastaAberta = veiculos.find(v => v.codigo === codigo);

  editNome.value = pastaAberta.nome;
  editZona.value = pastaAberta.zona_area;

  if (pastaAberta.imagem_url) {
    previewImg.src = pastaAberta.imagem_url;
  }

  editModal.classList.remove("is-hidden");
};

/* ========================= */
/* PREVIEW */
/* ========================= */

editImagem.addEventListener("change", () => {

  const file = editImagem.files[0];
  if (!file) return;

  previewImg.src = URL.createObjectURL(file);

});

zoom.addEventListener("input", aplicar);
posX.addEventListener("input", aplicar);
posY.addEventListener("input", aplicar);

function aplicar() {
  previewImg.style.transform =
    `scale(${zoom.value}) translate(${posX.value}px, ${posY.value}px)`;
}

/* ========================= */
/* SALVAR */
/* ========================= */

async function salvar() {

  let imagem_url = pastaAberta.imagem_url;

  const file = editImagem.files[0];

  if (file) {

    const path = `img_${Date.now()}`;

    await supabaseClient.storage
      .from("playlist-media")
      .upload(path, file, { upsert: true });

    const { data } = supabaseClient.storage
      .from("playlist-media")
      .getPublicUrl(path);

    imagem_url = data.publicUrl;
  }

  await supabaseClient
    .from("veiculos")
    .update({
      nome: editNome.value,
      zona_area: editZona.value,
      imagem_url
    })
    .eq("codigo", pastaAberta.codigo);

  location.reload();
}
