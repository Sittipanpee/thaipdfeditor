import { PDFDocument, degrees, rgb } from "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm";
import fontkit from "https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.1.1/+esm";
import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/+esm";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs";

const THAI_FONT_URL = "./assets/fonts/Thonburi-0.ttf";
const THAI_FONT_BOLD_URL = "./assets/fonts/Thonburi-1.ttf";

const tools = [
  {
    id: "merge",
    name: "Merge PDF",
    group: "Organize PDF",
    color: "#eb7d5b",
    icon: "M",
    summary: "รวมไฟล์ PDF หลายไฟล์เป็นฉบับเดียว โดยเรียงด้วย drag and drop ได้",
    accept: ".pdf",
    multiple: true,
    enabled: true,
  },
  {
    id: "split",
    name: "Split PDF",
    group: "Organize PDF",
    color: "#eb7d5b",
    icon: "S",
    summary: "แบ่ง PDF ออกเป็นหลายไฟล์ตามจำนวนหน้าต่อชุด",
    accept: ".pdf",
    multiple: false,
    enabled: true,
  },
  {
    id: "extract",
    name: "Extract pages",
    group: "Organize PDF",
    color: "#eb7d5b",
    icon: "E",
    summary: "ดึงเฉพาะหน้าที่ต้องการออกเป็นไฟล์ใหม่",
    accept: ".pdf",
    multiple: false,
    enabled: true,
  },
  {
    id: "remove",
    name: "Remove pages",
    group: "Organize PDF",
    color: "#eb7d5b",
    icon: "R",
    summary: "ลบหน้าที่ไม่ต้องการแล้วดาวน์โหลด PDF ฉบับใหม่",
    accept: ".pdf",
    multiple: false,
    enabled: true,
  },
  {
    id: "organize",
    name: "Organize PDF",
    group: "Organize PDF",
    color: "#eb7d5b",
    icon: "O",
    summary: "จัดลำดับหน้า หมุนหน้า หรือลบบางหน้าแบบเห็นตัวอย่างก่อน",
    accept: ".pdf",
    multiple: false,
    enabled: true,
  },
  {
    id: "compress",
    name: "Compress PDF",
    group: "Optimize PDF",
    color: "#aacb73",
    icon: "C",
    summary: "ยังไม่เปิดใช้ในเวอร์ชัน local-first นี้",
    accept: ".pdf",
    multiple: false,
    enabled: false,
  },
  {
    id: "ocr",
    name: "OCR PDF",
    group: "Optimize PDF",
    color: "#aacb73",
    icon: "OCR",
    summary: "ยังไม่เปิดใช้ในเวอร์ชัน local-first นี้",
    accept: ".pdf",
    multiple: false,
    enabled: false,
  },
  {
    id: "jpg-to-pdf",
    name: "JPG to PDF",
    group: "Convert to PDF",
    color: "#f3d15f",
    icon: "J",
    summary: "แปลงรูปภาพเป็น PDF พร้อมจัดลำดับหน้า",
    accept: "image/jpeg,image/png",
    multiple: true,
    enabled: true,
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    group: "Convert from PDF",
    color: "#f3d15f",
    icon: "P",
    summary: "เรนเดอร์ทุกหน้าเป็นภาพ JPG แล้วดาวน์โหลดแยกหน้าได้",
    accept: ".pdf",
    multiple: false,
    enabled: true,
  },
  {
    id: "rotate",
    name: "Rotate PDF",
    group: "Edit PDF",
    color: "#b47aaa",
    icon: "↻",
    summary: "หมุนทั้งไฟล์หรือเฉพาะหน้าที่ระบุได้",
    accept: ".pdf",
    multiple: false,
    enabled: true,
  },
  {
    id: "page-numbers",
    name: "Add page numbers",
    group: "Edit PDF",
    color: "#b47aaa",
    icon: "#",
    summary: "ใส่เลขหน้าพร้อมตำแหน่ง ขนาด และสี รองรับข้อความไทย",
    accept: ".pdf",
    multiple: false,
    enabled: true,
  },
  {
    id: "watermark",
    name: "Add watermark",
    group: "Edit PDF",
    color: "#b47aaa",
    icon: "W",
    summary: "ใส่ลายน้ำข้อความแบบเอียงกลางหน้า พร้อมฝังฟอนต์ไทย",
    accept: ".pdf",
    multiple: false,
    enabled: true,
  },
  {
    id: "stamp-fields",
    name: "Stamp & fields",
    group: "Edit PDF",
    color: "#b47aaa",
    icon: "F",
    summary: "สร้างตราประทับ วันที่ และ calculated field โดยลากวางบนหน้า PDF ได้",
    accept: ".pdf",
    multiple: false,
    enabled: true,
  },
  {
    id: "protect",
    name: "Protect PDF",
    group: "PDF Security",
    color: "#5f86c5",
    icon: "L",
    summary: "ยังไม่เปิดใช้ในเวอร์ชัน local-first นี้",
    accept: ".pdf",
    multiple: false,
    enabled: false,
  },
  {
    id: "unlock",
    name: "Unlock PDF",
    group: "PDF Security",
    color: "#5f86c5",
    icon: "U",
    summary: "ยังไม่เปิดใช้ในเวอร์ชัน local-first นี้",
    accept: ".pdf",
    multiple: false,
    enabled: false,
  },
];

const groupedTools = Array.from(
  tools.reduce((map, tool) => {
    if (!map.has(tool.group)) map.set(tool.group, []);
    map.get(tool.group).push(tool);
    return map;
  }, new Map())
);

const state = {
  activeToolId: "stamp-fields",
  files: [],
  downloads: [],
  previews: [],
  stampFields: [],
  selectedPreviewPage: 1,
  dragFieldId: null,
  selectedFieldId: null,
};

const toolCatalog = document.querySelector("#toolCatalog");
const toolTitle = document.querySelector("#toolTitle");
const toolSummary = document.querySelector("#toolSummary");
const fileInput = document.querySelector("#fileInput");
const pickFilesButton = document.querySelector("#pickFilesButton");
const clearWorkspaceButton = document.querySelector("#clearWorkspaceButton");
const dropzone = document.querySelector("#dropzone");
const dropzoneTitle = document.querySelector("#dropzoneTitle");
const dropzoneHint = document.querySelector("#dropzoneHint");
const controlsPanel = document.querySelector("#controlsPanel");
const workspaceContent = document.querySelector("#workspaceContent");
const statusLine = document.querySelector("#statusLine");
const downloadCardTemplate = document.querySelector("#downloadCardTemplate");

let thaiFontBytesPromise;
let thaiFontBoldBytesPromise;

renderCatalog();
syncToolUI();
attachEvents();

function attachEvents() {
  pickFilesButton.addEventListener("click", () => fileInput.click());
  clearWorkspaceButton.addEventListener("click", resetWorkspace);
  fileInput.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []);
    await loadFiles(files);
    fileInput.value = "";
  });

  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", async (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragover");
    const files = Array.from(event.dataTransfer?.files || []);
    await loadFiles(files);
  });
}

function renderCatalog() {
  toolCatalog.innerHTML = "";
  groupedTools.forEach(([groupName, groupTools]) => {
    const group = document.createElement("section");
    group.className = "tool-group";
    group.innerHTML = `<h3>${groupName}</h3><div class="tool-list"></div>`;
    const list = group.querySelector(".tool-list");

    groupTools.forEach((tool) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `tool-button${tool.enabled ? "" : " disabled"}${
        tool.id === state.activeToolId ? " active" : ""
      }`;
      button.dataset.toolId = tool.id;
      button.innerHTML = `
        <span class="tool-icon" style="background:${tool.color}">${tool.icon}</span>
        <span>
          <span class="tool-name">${tool.name}</span>
          <span class="tool-caption">${tool.summary}</span>
        </span>
        <span class="tool-state">${tool.enabled ? "Live" : "Soon"}</span>
      `;
      button.addEventListener("click", () => {
        state.activeToolId = tool.id;
        resetWorkspace();
        renderCatalog();
        syncToolUI();
      });
      list.appendChild(button);
    });
    toolCatalog.appendChild(group);
  });
}

function syncToolUI() {
  const tool = getActiveTool();
  toolTitle.textContent = tool.name;
  toolSummary.textContent = tool.summary;
  dropzoneTitle.textContent = tool.enabled
    ? `ลาก${tool.accept.includes("image") ? "รูปภาพ" : "ไฟล์ PDF"}มาวาง หรือกดเลือกไฟล์`
    : "โหมดนี้ยังไม่เปิดใช้";
  dropzoneHint.textContent = tool.enabled
    ? "ไฟล์จะประมวลผลในเบราว์เซอร์ของคุณและฝังฟอนต์ไทยลงไฟล์ตอน export"
    : "เวอร์ชันนี้โฟกัสเฉพาะงาน local-first ที่ทำงานได้จริง";
  pickFilesButton.disabled = !tool.enabled;
  fileInput.accept = tool.accept;
  fileInput.multiple = tool.multiple;
  controlsPanel.innerHTML = "";
  workspaceContent.innerHTML = "";
  if (tool.enabled) {
    renderControls();
    setStatus("พร้อมทำงาน", false);
  } else {
    renderDisabledPanel();
  }
}

function renderDisabledPanel() {
  const box = document.createElement("div");
  box.innerHTML = `
    <div class="chip-row">
      <span class="chip">ต้องใช้ engine เพิ่ม</span>
      <span class="chip">ยังไม่แตะ backend</span>
      <span class="chip">ไม่ปลอมฟีเจอร์</span>
    </div>
    <p class="footnote">
      ฟีเจอร์กลุ่มนี้ยังไม่ถูกเปิด เพราะถ้าจะให้ทำงานจริงจำเป็นต้องเพิ่มชุดประมวลผลหรือ backend อีกชั้น
      ซึ่งขัดกับเงื่อนไข local-first ของรอบนี้
    </p>
  `;
  controlsPanel.appendChild(box);
  setStatus("โหมดนี้ยังไม่เปิดใช้", false);
}

function renderControls() {
  const tool = getActiveTool();
  controlsPanel.innerHTML = "";
  const wrap = document.createElement("div");

  if (tool.id === "split") {
    wrap.innerHTML = `
      <div class="control-row">
        <div class="field">
          <label for="splitSize">จำนวนหน้าต่อไฟล์</label>
          <input id="splitSize" type="number" min="1" value="1" />
        </div>
        <div class="field wide">
          <label>ดำเนินการ</label>
          <div class="inline-actions">
            <button class="primary-button" id="runSplitButton" type="button">สร้างไฟล์แยก</button>
          </div>
        </div>
      </div>
    `;
  }

  if (tool.id === "extract" || tool.id === "remove" || tool.id === "rotate") {
    const label = tool.id === "rotate" ? "หน้าที่ต้องการหมุน เช่น 1,3-5 หรือ all" : "ช่วงหน้า เช่น 1,3-5";
    const extra =
      tool.id === "rotate"
        ? `
          <div class="field">
            <label for="rotateDegrees">องศา</label>
            <select id="rotateDegrees">
              <option value="90">90</option>
              <option value="180">180</option>
              <option value="270">270</option>
            </select>
          </div>
        `
        : "";
    const buttonText =
      tool.id === "extract" ? "สร้าง PDF ใหม่" : tool.id === "remove" ? "ลบหน้าที่เลือก" : "หมุนแล้วดาวน์โหลด";
    wrap.innerHTML = `
      <div class="control-row">
        <div class="field wide">
          <label for="rangeInput">${label}</label>
          <input id="rangeInput" type="text" value="${tool.id === "rotate" ? "all" : ""}" placeholder="1,3-5" />
        </div>
        ${extra}
        <div class="field">
          <label>ดำเนินการ</label>
          <button class="primary-button" id="rangeActionButton" type="button">${buttonText}</button>
        </div>
      </div>
    `;
  }

  if (tool.id === "page-numbers") {
    wrap.innerHTML = `
      <div class="control-row">
        <div class="field">
          <label for="numberPosition">ตำแหน่ง</label>
          <select id="numberPosition">
            <option value="bottom-right">ล่างขวา</option>
            <option value="bottom-center">ล่างกลาง</option>
            <option value="top-right">บนขวา</option>
            <option value="top-center">บนกลาง</option>
          </select>
        </div>
        <div class="field">
          <label for="numberSize">ขนาดตัวอักษร</label>
          <input id="numberSize" type="number" min="8" max="36" value="12" />
        </div>
        <div class="field">
          <label for="numberColor">สี</label>
          <input id="numberColor" type="color" value="#404040" />
        </div>
      </div>
      <div class="control-row">
        <div class="field wide">
          <label for="numberPrefix">คำนำหน้า</label>
          <input id="numberPrefix" type="text" value="หน้า " placeholder="เช่น หน้า " />
        </div>
        <div class="field">
          <label>ดำเนินการ</label>
          <button class="primary-button" id="pageNumberButton" type="button">เพิ่มเลขหน้า</button>
        </div>
      </div>
    `;
  }

  if (tool.id === "watermark") {
    wrap.innerHTML = `
      <div class="control-row">
        <div class="field wide">
          <label for="watermarkText">ข้อความลายน้ำ</label>
          <input id="watermarkText" type="text" value="เอกสารภายใน" />
        </div>
        <div class="field">
          <label for="watermarkOpacity">ความทึบ</label>
          <input id="watermarkOpacity" type="number" min="0.05" max="0.7" step="0.05" value="0.18" />
        </div>
        <div class="field">
          <label>ดำเนินการ</label>
          <button class="primary-button" id="watermarkButton" type="button">ใส่ลายน้ำ</button>
        </div>
      </div>
    `;
  }

  if (tool.id === "stamp-fields") {
    wrap.innerHTML = `
      <div class="control-row">
        <div class="field">
          <label for="fieldType">ชนิด</label>
          <select id="fieldType">
            <option value="date">Date stamp</option>
            <option value="text">Text field</option>
            <option value="calculated">Calculated field</option>
          </select>
        </div>
        <div class="field wide">
          <label for="fieldValue" id="fieldValueLabel">ข้อความ / สูตร</label>
          <input id="fieldValue" type="text" value="" placeholder="date: เว้นว่างได้, calculated: page + '/' + totalPages" />
        </div>
      </div>
      <div class="control-row">
        <div class="field">
          <label for="fieldColor">สีตัวอักษร</label>
          <input id="fieldColor" type="color" value="#5c3821" />
        </div>
        <div class="field">
          <label for="fieldFill">สีตราประทับ</label>
          <input id="fieldFill" type="color" value="#f8d5bc" />
        </div>
        <div class="field">
          <label for="fieldBorder">สีกรอบ</label>
          <input id="fieldBorder" type="color" value="#aa6a43" />
        </div>
      </div>
      <div class="control-row">
        <div class="field wide">
          <label for="fieldHint">ตัวอย่างสูตร</label>
          <input id="fieldHint" type="text" value="ใช้ page, totalPages, date เช่น 'หน้า ' + page + ' / ' + totalPages" disabled />
        </div>
        <div class="field">
          <label>ดำเนินการ</label>
          <div class="stack-actions">
            <button class="primary-button" id="addFieldButton" type="button">เพิ่ม field</button>
            <button class="ghost-button" id="exportStampButton" type="button">สร้าง PDF</button>
          </div>
        </div>
      </div>
    `;
  }

  if (tool.id === "merge" || tool.id === "jpg-to-pdf" || tool.id === "organize") {
    const text =
      tool.id === "merge"
        ? "รวมไฟล์"
        : tool.id === "jpg-to-pdf"
          ? "สร้าง PDF"
          : "จัดหน้าแล้วดาวน์โหลด";
    wrap.innerHTML = `
      <div class="inline-actions">
        <button class="primary-button" id="primaryActionButton" type="button">${text}</button>
      </div>
    `;
  }

  if (tool.id === "pdf-to-jpg") {
    wrap.innerHTML = `
      <div class="inline-actions">
        <button class="primary-button" id="pdfToJpgButton" type="button">เรนเดอร์เป็น JPG</button>
      </div>
    `;
  }

  controlsPanel.appendChild(wrap);
  bindControlActions();
}

function bindControlActions() {
  document.querySelector("#primaryActionButton")?.addEventListener("click", async () => {
    const tool = getActiveTool();
    if (tool.id === "merge") await runMerge();
    if (tool.id === "jpg-to-pdf") await runJpgToPdf();
    if (tool.id === "organize") await runOrganize();
  });

  document.querySelector("#runSplitButton")?.addEventListener("click", async () => runSplit());
  document.querySelector("#rangeActionButton")?.addEventListener("click", async () => {
    const tool = getActiveTool();
    if (tool.id === "extract") await runExtract();
    if (tool.id === "remove") await runRemove();
    if (tool.id === "rotate") await runRotate();
  });
  document.querySelector("#pageNumberButton")?.addEventListener("click", async () => runPageNumbers());
  document.querySelector("#watermarkButton")?.addEventListener("click", async () => runWatermark());
  document.querySelector("#pdfToJpgButton")?.addEventListener("click", async () => runPdfToJpg());
  document.querySelector("#addFieldButton")?.addEventListener("click", () => addStampField());
  document.querySelector("#exportStampButton")?.addEventListener("click", async () => runStampFields());
  document.querySelector("#fieldType")?.addEventListener("change", syncFieldLabels);
  syncFieldLabels();
}

function syncFieldLabels() {
  const type = document.querySelector("#fieldType")?.value;
  const label = document.querySelector("#fieldValueLabel");
  const input = document.querySelector("#fieldValue");
  if (!label || !input) return;
  if (type === "date") {
    label.textContent = "ข้อความนำหน้า (ถ้ามี)";
    input.placeholder = "เช่น อนุมัติเมื่อ";
  } else if (type === "text") {
    label.textContent = "ข้อความ";
    input.placeholder = "ข้อความที่ต้องการแสดง";
  } else {
    label.textContent = "สูตร";
    input.placeholder = "'หน้า ' + page + ' / ' + totalPages";
  }
}

function getActiveTool() {
  return tools.find((tool) => tool.id === state.activeToolId);
}

function resetWorkspace() {
  state.files = [];
  clearDownloads();
  state.previews = [];
  state.stampFields = [];
  state.selectedPreviewPage = 1;
  state.dragFieldId = null;
  state.selectedFieldId = null;
  workspaceContent.innerHTML = "";
  if (getActiveTool().enabled) {
    renderControls();
    setStatus("พร้อมทำงาน", false);
  } else {
    syncToolUI();
  }
}

async function loadFiles(files) {
  const tool = getActiveTool();
  if (!tool.enabled || !files.length) return;

  const filtered = files.filter((file) => isAccepted(file, tool.accept));
  if (!filtered.length) return setStatus("ชนิดไฟล์ไม่ตรงกับโหมดที่เลือก", true);

  state.files = tool.multiple ? filtered : [filtered[0]];
  clearDownloads();
  workspaceContent.innerHTML = "";

  if (tool.id === "merge" || tool.id === "jpg-to-pdf") {
    renderQueueList();
  } else if (tool.id === "organize" || tool.id === "pdf-to-jpg" || tool.id === "stamp-fields") {
    await renderPdfPagesPreview(state.files[0]);
    if (tool.id === "stamp-fields") {
      state.selectedPreviewPage = 1;
      renderStampWorkbench();
    }
  } else {
    renderSingleFileCard(state.files[0]);
  }

  setStatus(`โหลดไฟล์แล้ว ${state.files.length} รายการ`, false);
}

function isAccepted(file, accept) {
  const accepts = accept.split(",");
  return accepts.some((rule) => {
    const trimmed = rule.trim();
    if (trimmed.startsWith(".")) return file.name.toLowerCase().endsWith(trimmed);
    return file.type === trimmed;
  });
}

function renderQueueList() {
  const list = document.createElement("div");
  list.className = "queue-list";

  state.files.forEach((file, index) => {
    const row = document.createElement("article");
    row.className = "queue-item";
    row.draggable = true;
    row.dataset.index = String(index);
    row.innerHTML = `
      <div>
        <p class="queue-item-title">${escapeHtml(file.name)}</p>
        <p class="queue-item-meta">${formatBytes(file.size)}${file.type ? ` · ${file.type}` : ""}</p>
      </div>
      <div class="queue-actions">
        <span class="chip">ลากเพื่อเรียง</span>
        <button class="mini-button" type="button" data-action="remove" data-index="${index}">ลบ</button>
      </div>
    `;
    row.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", row.dataset.index || "0");
      row.classList.add("is-dragging");
    });
    row.addEventListener("dragend", () => row.classList.remove("is-dragging"));
    row.addEventListener("dragover", (event) => event.preventDefault());
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      const from = Number(event.dataTransfer.getData("text/plain"));
      const to = Number(row.dataset.index || "0");
      moveFile(from, to);
    });
    list.appendChild(row);
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    state.files.splice(Number(button.dataset.index), 1);
    renderQueueList();
  });

  workspaceContent.innerHTML = "";
  workspaceContent.appendChild(list);
  if (state.downloads.length) renderDownloads();
}

function moveFile(from, to) {
  if (from === to || from < 0 || to < 0) return;
  const [item] = state.files.splice(from, 1);
  state.files.splice(to, 0, item);
  renderQueueList();
}

function renderSingleFileCard(file) {
  const card = document.createElement("article");
  card.className = "queue-item";
  card.innerHTML = `
    <div>
      <p class="queue-item-title">${escapeHtml(file.name)}</p>
      <p class="queue-item-meta">${formatBytes(file.size)}</p>
    </div>
    <div class="chip-row">
      <span class="chip">Local processing</span>
      <span class="chip">Thai font safe</span>
    </div>
  `;
  workspaceContent.innerHTML = "";
  workspaceContent.appendChild(card);
  if (state.downloads.length) renderDownloads();
}

async function renderPdfPagesPreview(file) {
  const mode = getActiveTool().id;
  setStatus("กำลังเรนเดอร์ตัวอย่างหน้า", false);
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  state.previews = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const thumbViewport = page.getViewport({ scale: 0.35 });
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = thumbViewport.width;
    thumbCanvas.height = thumbViewport.height;
    await page.render({ canvasContext: thumbCanvas.getContext("2d"), viewport: thumbViewport }).promise;

    const stageViewport = page.getViewport({ scale: 1.1 });
    const stageCanvas = document.createElement("canvas");
    stageCanvas.width = stageViewport.width;
    stageCanvas.height = stageViewport.height;
    await page.render({ canvasContext: stageCanvas.getContext("2d"), viewport: stageViewport }).promise;

    state.previews.push({
      pageNumber: i,
      rotation: 0,
      removed: false,
      dataUrl: thumbCanvas.toDataURL("image/jpeg", 0.84),
      stageDataUrl: stageCanvas.toDataURL("image/jpeg", 0.9),
    });
  }

  if (mode === "organize") renderOrganizeGrid();
  if (mode === "pdf-to-jpg") renderPdfJpgPreviewNote();
  setStatus(`พร้อมแล้ว ${pdf.numPages} หน้า`, false);
}

function renderOrganizeGrid() {
  const grid = document.createElement("div");
  grid.className = "pages-grid";
  state.previews.forEach((item, index) => grid.appendChild(createOrganizeCard(item, index)));
  workspaceContent.innerHTML = "";
  workspaceContent.appendChild(grid);
}

function renderPdfJpgPreviewNote() {
  const grid = document.createElement("div");
  grid.className = "pages-grid";
  state.previews.forEach((item) => {
    const card = document.createElement("article");
    card.className = "page-card";
    card.innerHTML = `
      <div class="page-preview"><img src="${item.dataUrl}" alt="page ${item.pageNumber}" /></div>
      <div class="page-header"><strong>หน้า ${item.pageNumber}</strong></div>
    `;
    grid.appendChild(card);
  });
  workspaceContent.innerHTML = "";
  workspaceContent.appendChild(grid);
}

function createOrganizeCard(item, index) {
  const card = document.createElement("article");
  card.className = "page-card";
  card.innerHTML = `
    <div class="page-preview">
      <img src="${item.dataUrl}" alt="page ${item.pageNumber}" />
    </div>
    <div class="page-header">
      <strong>หน้า ${item.pageNumber}</strong>
      <span class="page-meta">${item.removed ? "ถูกซ่อน" : `${item.rotation}°`}</span>
    </div>
    <div class="page-actions">
      <button class="mini-button" type="button" data-preview-action="left" data-index="${index}">ซ้าย</button>
      <button class="mini-button" type="button" data-preview-action="right" data-index="${index}">ขวา</button>
      <button class="mini-button" type="button" data-preview-action="rotate" data-index="${index}">หมุน</button>
      <button class="mini-button" type="button" data-preview-action="remove" data-index="${index}">${item.removed ? "คืน" : "ลบ"}</button>
    </div>
  `;
  card.addEventListener("click", (event) => {
    const button = event.target.closest("[data-preview-action]");
    if (!button) return;
    mutatePreview(button.dataset.previewAction, Number(button.dataset.index));
  });
  return card;
}

function mutatePreview(action, index) {
  const current = state.previews[index];
  if (!current) return;
  if (action === "left" && index > 0) {
    [state.previews[index - 1], state.previews[index]] = [state.previews[index], state.previews[index - 1]];
  }
  if (action === "right" && index < state.previews.length - 1) {
    [state.previews[index + 1], state.previews[index]] = [state.previews[index], state.previews[index + 1]];
  }
  if (action === "rotate") current.rotation = (current.rotation + 90) % 360;
  if (action === "remove") current.removed = !current.removed;
  renderOrganizeGrid();
}

function addStampField() {
  if (!state.previews.length) return setStatus("เลือก PDF ก่อน", true);
  const nextIndex = state.stampFields.length + 1;
  const field = {
    id: `field-${crypto.randomUUID()}`,
    name: `field_${nextIndex}`,
    type: document.querySelector("#fieldType")?.value || "date",
    value: document.querySelector("#fieldValue")?.value || "",
    fontSize: 16,
    textColor: document.querySelector("#fieldColor")?.value || "#5c3821",
    fillColor: document.querySelector("#fieldFill")?.value || "#f8d5bc",
    borderColor: document.querySelector("#fieldBorder")?.value || "#aa6a43",
    pageNumber: state.selectedPreviewPage,
    xPct: 0.08,
    yPct: Math.min(0.72, 0.1 + state.stampFields.filter((item) => item.pageNumber === state.selectedPreviewPage).length * 0.12),
    boxWidth: 170,
    editingName: false,
  };
  state.stampFields.push(field);
  state.selectedFieldId = field.id;
  renderStampWorkbench();
  setStatus(`เพิ่ม field ${field.name} แล้ว`, false);
}

function renderStampWorkbench() {
  if (!state.previews.length) return;
  const selected = state.previews.find((item) => item.pageNumber === state.selectedPreviewPage) || state.previews[0];
  const fieldsForPage = state.stampFields.filter((item) => item.pageNumber === selected.pageNumber);

  const wrapper = document.createElement("div");
  wrapper.className = "stamp-layout";
  wrapper.innerHTML = `
    <aside class="stamp-sidebar">
      <div class="chip-row">
        <span class="chip">ลาก field บนหน้าได้</span>
        <span class="chip">รองรับไทย</span>
      </div>
      <div class="stamp-thumbs"></div>
    </aside>
    <section class="stamp-stage-panel">
      <div class="stamp-stage-meta">
        <div>
          <strong>หน้า ${selected.pageNumber}</strong>
          <p class="page-meta">เพิ่มตราประทับ, วันที่, หรือ calculated field แล้วลากไปวางตำแหน่ง</p>
        </div>
      </div>
      <div class="stamp-stage" id="stampStage">
        <img src="${selected.stageDataUrl}" alt="preview page ${selected.pageNumber}" />
        ${fieldsForPage
          .map((field) => {
            const text = escapeHtml(computeFieldText(field, selected.pageNumber, state.previews.length));
            const isSelected = field.id === state.selectedFieldId;
            return `
              <article
                class="stamp-box${isSelected ? " selected" : ""}"
                data-field-id="${field.id}"
                style="
                  left:${field.xPct * 100}%;
                  top:${field.yPct * 100}%;
                  font-size:${field.fontSize}px;
                  width:${field.boxWidth}px;
                  color:${field.textColor};
                  background:${hexToRgba(field.fillColor, 0.9)};
                  border-color:${field.borderColor};
                "
              >
                <button class="stamp-box-head" type="button" data-field-head="${field.id}">
                  ${
                    field.editingName
                      ? `<input class="stamp-box-name-input" data-field-name-input="${field.id}" value="${escapeHtml(field.name)}" />`
                      : `<span class="stamp-box-name">${escapeHtml(field.name)}</span>`
                  }
                </button>
                <div class="stamp-box-body" data-field-drag="${field.id}">
                  <span class="stamp-box-value">${text}</span>
                </div>
                <button class="stamp-box-resize" type="button" aria-label="resize field" data-field-resize="${field.id}"></button>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;

  const thumbs = wrapper.querySelector(".stamp-thumbs");
  state.previews.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `stamp-thumb${item.pageNumber === selected.pageNumber ? " active" : ""}`;
    button.innerHTML = `<img src="${item.dataUrl}" alt="thumb ${item.pageNumber}" /><span>หน้า ${item.pageNumber}</span>`;
    button.addEventListener("click", () => {
      state.selectedPreviewPage = item.pageNumber;
      renderStampWorkbench();
    });
    thumbs.appendChild(button);
  });

  const fieldList = document.createElement("div");
  fieldList.className = "field-list";
  state.stampFields.forEach((field) => {
    const card = document.createElement("article");
    card.className = "field-card";
    card.innerHTML = `
      <div>
        <p class="download-title">${escapeHtml(field.name)}</p>
        <p class="download-meta">หน้า ${field.pageNumber} · ${field.type} · ${escapeHtml(computeFieldText(field, field.pageNumber, state.previews.length))}</p>
      </div>
      <div class="queue-actions">
        <button class="mini-button" type="button" data-field-action="select" data-field-id="${field.id}">เลือก</button>
        <button class="mini-button" type="button" data-field-action="jump" data-field-id="${field.id}">ดู</button>
        <button class="mini-button" type="button" data-field-action="delete" data-field-id="${field.id}">ลบ</button>
      </div>
    `;
    fieldList.appendChild(card);
  });
  fieldList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-field-action]");
    if (!button) return;
    const fieldId = button.dataset.fieldId;
    if (button.dataset.fieldAction === "delete") {
      state.stampFields = state.stampFields.filter((field) => field.id !== fieldId);
      if (state.selectedFieldId === fieldId) state.selectedFieldId = null;
      renderStampWorkbench();
    }
    if (button.dataset.fieldAction === "select") {
      state.selectedFieldId = fieldId;
      renderStampWorkbench();
    }
    if (button.dataset.fieldAction === "jump") {
      const field = state.stampFields.find((item) => item.id === fieldId);
      if (!field) return;
      state.selectedPreviewPage = field.pageNumber;
      state.selectedFieldId = fieldId;
      renderStampWorkbench();
    }
  });

  workspaceContent.innerHTML = "";
  workspaceContent.appendChild(wrapper);
  if (state.stampFields.length) workspaceContent.appendChild(fieldList);
  if (state.downloads.length) renderDownloads();
  installStampDragging();
}

function installStampDragging() {
  const stage = document.querySelector("#stampStage");
  if (!stage) return;
  let dragging = null;

  stage.querySelectorAll(".stamp-box").forEach((box) => {
    const fieldId = box.dataset.fieldId;
    const body = box.querySelector("[data-field-drag]");
    const head = box.querySelector("[data-field-head]");
    const nameInput = box.querySelector("[data-field-name-input]");
    const resizeHandle = box.querySelector("[data-field-resize]");

    box.addEventListener("click", () => {
      state.selectedFieldId = fieldId;
      state.stampFields.forEach((field) => {
        if (field.id !== fieldId) field.editingName = false;
      });
    });

    head?.addEventListener("click", (event) => {
      event.stopPropagation();
      const field = state.stampFields.find((item) => item.id === fieldId);
      if (!field) return;
      state.selectedFieldId = fieldId;
      state.stampFields.forEach((item) => {
        item.editingName = item.id === fieldId;
      });
      renderStampWorkbench();
    });

    nameInput?.addEventListener("click", (event) => event.stopPropagation());
    nameInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commitFieldName(fieldId, event.currentTarget.value);
      }
      if (event.key === "Escape") {
        const field = state.stampFields.find((item) => item.id === fieldId);
        if (!field) return;
        field.editingName = false;
        renderStampWorkbench();
      }
    });
    nameInput?.addEventListener("blur", (event) => commitFieldName(fieldId, event.currentTarget.value));

    body?.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      const field = state.stampFields.find((item) => item.id === fieldId);
      if (!field) return;
      state.selectedFieldId = fieldId;
      dragging = { mode: "move", fieldId };
      body.setPointerCapture(event.pointerId);
      box.classList.add("is-dragging");
    });
    body?.addEventListener("pointermove", (event) => {
      if (!dragging || dragging.fieldId !== fieldId || dragging.mode !== "move") return;
      const rect = stage.getBoundingClientRect();
      const xPct = clamp((event.clientX - rect.left) / rect.width, 0.02, 0.95);
      const yPct = clamp((event.clientY - rect.top) / rect.height, 0.02, 0.95);
      const field = state.stampFields.find((item) => item.id === fieldId);
      if (!field) return;
      field.xPct = xPct;
      field.yPct = yPct;
      box.style.left = `${xPct * 100}%`;
      box.style.top = `${yPct * 100}%`;
    });
    body?.addEventListener("pointerup", (event) => releaseDrag(event, box, body));
    body?.addEventListener("pointercancel", (event) => releaseDrag(event, box, body));

    resizeHandle?.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      const field = state.stampFields.find((item) => item.id === fieldId);
      if (!field) return;
      dragging = {
        mode: "resize",
        fieldId,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: field.boxWidth,
        startFontSize: field.fontSize,
      };
      resizeHandle.setPointerCapture(event.pointerId);
      box.classList.add("is-dragging");
    });
    resizeHandle?.addEventListener("pointermove", (event) => {
      if (!dragging || dragging.fieldId !== fieldId || dragging.mode !== "resize") return;
      const field = state.stampFields.find((item) => item.id === fieldId);
      if (!field) return;
      const delta = Math.max(event.clientX - dragging.startX, event.clientY - dragging.startY);
      field.boxWidth = clamp(dragging.startWidth + delta, 120, 360);
      field.fontSize = clamp(dragging.startFontSize + delta * 0.08, 10, 36);
      box.style.width = `${field.boxWidth}px`;
      box.style.fontSize = `${field.fontSize}px`;
    });
    resizeHandle?.addEventListener("pointerup", (event) => releaseDrag(event, box, resizeHandle));
    resizeHandle?.addEventListener("pointercancel", (event) => releaseDrag(event, box, resizeHandle));
  });

  const activeInput = stage.querySelector(".stamp-box-name-input");
  if (activeInput) {
    activeInput.focus();
    activeInput.select();
  }

  function releaseDrag(event, box, captureNode) {
    if (!dragging || dragging.fieldId !== box.dataset.fieldId) return;
    dragging = null;
    captureNode.releasePointerCapture?.(event.pointerId);
    box.classList.remove("is-dragging");
    renderStampWorkbench();
  }
}

function commitFieldName(fieldId, rawName) {
  const field = state.stampFields.find((item) => item.id === fieldId);
  if (!field) return;
  field.name = (rawName || "").trim() || field.name;
  field.editingName = false;
  state.selectedFieldId = fieldId;
  renderStampWorkbench();
}

async function runMerge() {
  if (!state.files.length) return setStatus("เลือก PDF อย่างน้อย 1 ไฟล์ก่อน", true);
  const merged = await PDFDocument.create();
  for (const file of state.files) {
    const source = await PDFDocument.load(await file.arrayBuffer());
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  await createDownload({
    bytes: await merged.save(),
    name: "merged.pdf",
    meta: `${state.files.length} ไฟล์`,
    mime: "application/pdf",
  });
}

async function runSplit() {
  if (!state.files[0]) return setStatus("เลือก PDF ก่อน", true);
  const splitSize = Math.max(1, Number(document.querySelector("#splitSize")?.value || "1"));
  const source = await PDFDocument.load(await state.files[0].arrayBuffer());
  const pageIndices = source.getPageIndices();
  clearDownloads();

  for (let start = 0; start < pageIndices.length; start += splitSize) {
    const doc = await PDFDocument.create();
    const subset = pageIndices.slice(start, start + splitSize);
    const pages = await doc.copyPages(source, subset);
    pages.forEach((page) => doc.addPage(page));
    await createDownload({
      bytes: await doc.save(),
      name: `${baseName(state.files[0].name)}-${start + 1}-${start + subset.length}.pdf`,
      meta: `${subset.length} หน้า`,
      mime: "application/pdf",
    });
  }
  setStatus("สร้างไฟล์แยกแล้ว", false);
}

async function runExtract() {
  if (!state.files[0]) return setStatus("เลือก PDF ก่อน", true);
  const source = await PDFDocument.load(await state.files[0].arrayBuffer());
  const indices = parseRanges(document.querySelector("#rangeInput")?.value || "", source.getPageCount());
  if (!indices.length) return setStatus("ระบุช่วงหน้าให้ถูกต้อง", true);

  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(source, indices);
  pages.forEach((page) => doc.addPage(page));
  await createDownload({
    bytes: await doc.save(),
    name: `${baseName(state.files[0].name)}-extract.pdf`,
    meta: `${indices.length} หน้า`,
    mime: "application/pdf",
  });
}

async function runRemove() {
  if (!state.files[0]) return setStatus("เลือก PDF ก่อน", true);
  const source = await PDFDocument.load(await state.files[0].arrayBuffer());
  const removeIndices = new Set(parseRanges(document.querySelector("#rangeInput")?.value || "", source.getPageCount()));
  const keep = source.getPageIndices().filter((index) => !removeIndices.has(index));
  if (!keep.length) return setStatus("ผลลัพธ์ต้องเหลืออย่างน้อย 1 หน้า", true);

  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(source, keep);
  pages.forEach((page) => doc.addPage(page));
  await createDownload({
    bytes: await doc.save(),
    name: `${baseName(state.files[0].name)}-trimmed.pdf`,
    meta: `เหลือ ${keep.length} หน้า`,
    mime: "application/pdf",
  });
}

async function runRotate() {
  if (!state.files[0]) return setStatus("เลือก PDF ก่อน", true);
  const pdf = await PDFDocument.load(await state.files[0].arrayBuffer());
  const degreesValue = Number(document.querySelector("#rotateDegrees")?.value || "90");
  const rangeText = document.querySelector("#rangeInput")?.value || "all";
  const targets =
    rangeText.trim().toLowerCase() === "all"
      ? pdf.getPageIndices()
      : parseRanges(rangeText, pdf.getPageCount());
  if (!targets.length) return setStatus("ระบุช่วงหน้าให้ถูกต้อง", true);
  targets.forEach((index) => {
    const page = pdf.getPage(index);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + degreesValue) % 360));
  });
  await createDownload({
    bytes: await pdf.save(),
    name: `${baseName(state.files[0].name)}-rotated.pdf`,
    meta: `${targets.length} หน้า · ${degreesValue}°`,
    mime: "application/pdf",
  });
}

async function runPageNumbers() {
  if (!state.files[0]) return setStatus("เลือก PDF ก่อน", true);
  const pdf = await PDFDocument.load(await state.files[0].arrayBuffer());
  const font = await embedThaiFont(pdf);
  const position = document.querySelector("#numberPosition")?.value || "bottom-right";
  const size = Number(document.querySelector("#numberSize")?.value || "12");
  const prefix = document.querySelector("#numberPrefix")?.value || "";
  const color = hexToRgb(document.querySelector("#numberColor")?.value || "#404040");

  pdf.getPages().forEach((page, index) => {
    const { width, height } = page.getSize();
    const text = normalizeThai(`${prefix}${index + 1}`);
    const textWidth = font.widthOfTextAtSize(text, size);
    const coords = getPosition(position, width, height, textWidth, size);
    page.drawText(text, {
      x: coords.x,
      y: coords.y,
      size,
      font,
      color: rgb(color.r / 255, color.g / 255, color.b / 255),
    });
  });

  await createDownload({
    bytes: await pdf.save(),
    name: `${baseName(state.files[0].name)}-numbered.pdf`,
    meta: `${pdf.getPageCount()} หน้า`,
    mime: "application/pdf",
  });
}

async function runWatermark() {
  if (!state.files[0]) return setStatus("เลือก PDF ก่อน", true);
  const pdf = await PDFDocument.load(await state.files[0].arrayBuffer());
  const font = await embedThaiBoldFont(pdf);
  const text = normalizeThai(document.querySelector("#watermarkText")?.value?.trim() || "เอกสารภายใน");
  const opacity = Number(document.querySelector("#watermarkOpacity")?.value || "0.18");

  pdf.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const size = Math.min(width, height) / 8;
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size,
      font,
      rotate: degrees(-35),
      opacity,
      color: rgb(0.62, 0.62, 0.62),
    });
  });

  await createDownload({
    bytes: await pdf.save(),
    name: `${baseName(state.files[0].name)}-watermark.pdf`,
    meta: text,
    mime: "application/pdf",
  });
}

async function runStampFields() {
  if (!state.files[0]) return setStatus("เลือก PDF ก่อน", true);
  if (!state.stampFields.length) return setStatus("เพิ่ม field อย่างน้อย 1 รายการก่อน", true);

  const pdf = await PDFDocument.load(await state.files[0].arrayBuffer());
  const regularFont = await embedThaiFont(pdf);
  const totalPages = pdf.getPageCount();

  state.stampFields.forEach((field) => {
    const page = pdf.getPage(field.pageNumber - 1);
    const { width, height } = page.getSize();
    const paddingX = 10;
    const paddingY = 8;
    const text = normalizeThai(computeFieldText(field, field.pageNumber, totalPages));
    const textWidth = regularFont.widthOfTextAtSize(text, field.fontSize);
    const rectWidth = Math.max(field.boxWidth || 0, textWidth + paddingX * 2);
    const rectHeight = field.fontSize + paddingY * 2;
    const x = field.xPct * width;
    const topY = field.yPct * height;
    const y = height - topY - rectHeight;
    const fill = hexToRgb(field.fillColor);
    const stroke = hexToRgb(field.borderColor || "#aa6a43");
    const textColor = hexToRgb(field.textColor);

    page.drawRectangle({
      x,
      y,
      width: rectWidth,
      height: rectHeight,
      color: rgb(fill.r / 255, fill.g / 255, fill.b / 255),
      borderWidth: 1,
      borderColor: rgb(stroke.r / 255, stroke.g / 255, stroke.b / 255),
      opacity: 0.88,
    });
    page.drawText(text, {
      x: x + paddingX,
      y: y + paddingY,
      size: field.fontSize,
      font: regularFont,
      color: rgb(textColor.r / 255, textColor.g / 255, textColor.b / 255),
    });
  });

  await createDownload({
    bytes: await pdf.save(),
    name: `${baseName(state.files[0].name)}-stamped.pdf`,
    meta: `${state.stampFields.length} fields`,
    mime: "application/pdf",
  });
}

async function runOrganize() {
  if (!state.files[0] || !state.previews.length) return setStatus("เลือก PDF ก่อน", true);
  const source = await PDFDocument.load(await state.files[0].arrayBuffer());
  const doc = await PDFDocument.create();

  for (const preview of state.previews) {
    if (preview.removed) continue;
    const [page] = await doc.copyPages(source, [preview.pageNumber - 1]);
    if (preview.rotation) page.setRotation(degrees(preview.rotation));
    doc.addPage(page);
  }

  if (!doc.getPageCount()) return setStatus("ผลลัพธ์ต้องเหลืออย่างน้อย 1 หน้า", true);
  await createDownload({
    bytes: await doc.save(),
    name: `${baseName(state.files[0].name)}-organized.pdf`,
    meta: `${doc.getPageCount()} หน้า`,
    mime: "application/pdf",
  });
}

async function runJpgToPdf() {
  if (!state.files.length) return setStatus("เลือกรูปก่อน", true);
  const doc = await PDFDocument.create();
  for (const file of state.files) {
    const bytes = await file.arrayBuffer();
    const image = file.type === "image/png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  await createDownload({
    bytes: await doc.save(),
    name: "images-to-pdf.pdf",
    meta: `${state.files.length} รูป`,
    mime: "application/pdf",
  });
}

async function runPdfToJpg() {
  if (!state.files[0]) return setStatus("เลือก PDF ก่อน", true);
  const file = state.files[0];
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  clearDownloads();

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.9);
    await createDownload({
      bytes: await blob.arrayBuffer(),
      name: `${baseName(file.name)}-page-${i}.jpg`,
      meta: `หน้า ${i}`,
      mime: "image/jpeg",
    });
  }
  setStatus("แปลงเป็น JPG แล้ว", false);
}

async function createDownload({ bytes, name, meta, mime }) {
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  state.downloads.push({ url, name, meta });
  renderDownloads();
  setStatus(`สร้างไฟล์ ${name} แล้ว`, false);
}

function renderDownloads() {
  let list = workspaceContent.querySelector(".downloads-list");
  if (!list) {
    list = document.createElement("div");
    list.className = "downloads-list";
    workspaceContent.appendChild(list);
  }
  list.innerHTML = "";
  state.downloads.forEach((item) => {
    const fragment = downloadCardTemplate.content.cloneNode(true);
    fragment.querySelector(".download-title").textContent = item.name;
    fragment.querySelector(".download-meta").textContent = item.meta;
    const link = fragment.querySelector(".download-link");
    link.href = item.url;
    link.download = item.name;
    list.appendChild(fragment);
  });
}

function clearDownloads() {
  state.downloads.forEach((item) => URL.revokeObjectURL(item.url));
  state.downloads = [];
}

function parseRanges(input, totalPages) {
  const parts = input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const set = new Set();
  parts.forEach((part) => {
    if (part.includes("-")) {
      const [rawStart, rawEnd] = part.split("-");
      const start = Math.max(1, Number(rawStart));
      const end = Math.min(totalPages, Number(rawEnd));
      for (let value = start; value <= end; value += 1) set.add(value - 1);
    } else {
      const value = Number(part);
      if (value >= 1 && value <= totalPages) set.add(value - 1);
    }
  });
  return Array.from(set).sort((a, b) => a - b);
}

function computeFieldText(field, pageNumber, totalPages) {
  const today = new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(new Date());

  if (field.type === "date") {
    return normalizeThai(`${field.value ? `${field.value} ` : ""}${today}`.trim());
  }

  if (field.type === "text") {
    return normalizeThai(field.value || field.name);
  }

  try {
    const expression = field.value || "page";
    const evaluator = new Function(
      "page",
      "totalPages",
      "date",
      "Math",
      `return (${expression});`
    );
    const result = evaluator(pageNumber, totalPages, today, Math);
    return normalizeThai(String(result));
  } catch {
    return normalizeThai(`ERR:${field.name}`);
  }
}

async function embedThaiFont(pdf) {
  pdf.registerFontkit(fontkit);
  const bytes = await loadThaiFontBytes();
  return pdf.embedFont(bytes, { subset: false });
}

async function embedThaiBoldFont(pdf) {
  pdf.registerFontkit(fontkit);
  const bytes = await loadThaiBoldFontBytes();
  return pdf.embedFont(bytes, { subset: false });
}

async function loadThaiFontBytes() {
  if (!thaiFontBytesPromise) {
    thaiFontBytesPromise = fetch(THAI_FONT_URL).then(async (response) => {
      if (!response.ok) throw new Error("โหลดฟอนต์ไทยไม่สำเร็จ");
      return response.arrayBuffer();
    });
  }
  return thaiFontBytesPromise;
}

async function loadThaiBoldFontBytes() {
  if (!thaiFontBoldBytesPromise) {
    thaiFontBoldBytesPromise = fetch(THAI_FONT_BOLD_URL).then(async (response) => {
      if (!response.ok) throw new Error("โหลดฟอนต์ไทยไม่สำเร็จ");
      return response.arrayBuffer();
    });
  }
  return thaiFontBoldBytesPromise;
}

function getPosition(position, width, height, textWidth, fontSize) {
  const margin = 24;
  const map = {
    "bottom-right": { x: width - textWidth - margin, y: margin },
    "bottom-center": { x: (width - textWidth) / 2, y: margin },
    "top-right": { x: width - textWidth - margin, y: height - fontSize - margin },
    "top-center": { x: (width - textWidth) / 2, y: height - fontSize - margin },
  };
  return map[position] || map["bottom-right"];
}

function setStatus(message, isError) {
  statusLine.textContent = message;
  statusLine.classList.toggle("error", Boolean(isError));
}

function normalizeThai(text) {
  return text.normalize("NFC");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function baseName(fileName) {
  return fileName.replace(/\.[^.]+$/, "");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
