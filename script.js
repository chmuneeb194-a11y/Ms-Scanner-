/* script.js - Advanced Ms Scanner AI Engine with Intelligent Distribution Ledger */

/* Iska kaam teeno zaroori documents ko connect karna ha */
const video = document.getElementById('video');
const preview = document.getElementById('imagePreview');
const captureBtn = document.getElementById('captureBtn');
const resetBtn = document.getElementById('resetBtn');
const scanOverlay = document.getElementById('scanOverlay');
const resultPanel = document.getElementById('resultPanel');
const loadingOverlay = document.getElementById('loadingOverlay');
let streamRef = null;
let data_simulated_for_share = []; // Global for sharing fallback

// Automatically open the camera on load (back camera)
window.onload = startCamera;


/*--------------------------------------------------------------------------------------*/
/*=========================== FUNCTION START: startCamera =============================*/
/*--------------------------------------------------------------------------------------*/
/* Iska kaam mobile ka back camera open karna ha */
async function startCamera() {
    try {
        preview.style.display = 'none';
        video.style.display = 'block';
        scanOverlay.style.display = 'block';
        
        streamRef = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }, 
            audio: false 
        });
        
        video.srcObject = streamRef;
        captureBtn.style.display = 'flex';
        resetBtn.style.display = 'none';
        resultPanel.style.display = 'none';
        loadingOverlay.style.display = 'none';
    } catch (err) {
        alert("Camera access denied! Please check permissions.");
        console.error(err);
    }
}
/*--------------------------------------------------------------------------------------*/
/*============================ FUNCTION END: startCamera ===============================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*=========================== FUNCTION START: captureFrame ============================*/
/*--------------------------------------------------------------------------------------*/
/* Iska kaam current camera frame capture karna ha */
function captureFrame() {
    if (!streamRef) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/jpeg');
    preview.src = imageDataUrl;
    preview.style.display = 'block';
    video.style.display = 'none';
    scanOverlay.style.display = 'none';
    captureBtn.style.display = 'none';
    resetBtn.style.display = 'flex';

    processAIWorkflow(imageDataUrl);
}
/*--------------------------------------------------------------------------------------*/
/*============================ FUNCTION END: captureFrame ==============================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*========================= FUNCTION START: processAIWorkflow =========================*/
/*--------------------------------------------------------------------------------------*/
function processAIWorkflow(imageData) {
    loadingOverlay.style.display = 'flex';
    document.getElementById('loadingMessage').innerText = "AI Classified: Distribution Ledger Sheet...";

    setTimeout(() => {
        const simulatedLedgerData = [
            { name: 'Dr. Malik', amount: 12000, return: 1500, manual: 100 },
            { name: 'Ali Pharma', amount: 8500, return: 0, manual: 250 },
            { name: 'PharmaPlus', amount: 9000, return: 2000, manual: 0 },
            { name: 'MediCare', amount: 15000, return: 5000, manual: 50 }
        ];
        
        data_simulated_for_share = simulatedLedgerData;

        const simulatedRawText = "Ms Scanner AI Ledger Report\nClassified: Medicine Distribution\n=========================\n" +
                               "Customer Count: 4\nTotal Initial Amount: 44500\nTotal Return: 8500\nTotal Manual: 400";

        document.getElementById('editableText').value = simulatedRawText;
        
        populateLedgerTable(simulatedLedgerData);
        reCalculateLocalText();
        loadingOverlay.style.display = 'none';
        
        openPanel('ledger');
    }, 5000);
}
/*--------------------------------------------------------------------------------------*/
/*========================== FUNCTION END: processAIWorkflow ===========================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*======================= FUNCTION START: populateLedgerTable =========================*/
/*--------------------------------------------------------------------------------------*/
/* Iska kaam Ledger Table ko dynamic tarike se fill karna ha */
function populateLedgerTable(data) {
    const tbody = document.getElementById('ledgerTable').querySelector('tbody');
    const tfoot = document.getElementById('ledgerTable').querySelector('tfoot');
    tbody.innerHTML = '';
    tfoot.innerHTML = '';

    let grandFinal = 0;

    data.forEach((row, index) => {
        const final = row.amount - row.return + row.manual;
        grandFinal += final;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.name}</td>
            <td>${row.amount}</td>
            <td>${row.return}</td>
            <td class="editable-amount" contenteditable="true" oninput="reCalculateLedger(${index}, this)">${row.manual}</td>
            <td id="final-${index}">${final}</td>
        `;
        tbody.appendChild(tr);
    });

    const totalTr = document.createElement('tr');
    totalTr.classList.add('total-row');
    totalTr.innerHTML = `
        <td colspan="4">Grand Total Balance:</td>
        <td id="grandTotal">${grandFinal}</td>
    `;
    tfoot.appendChild(totalTr);
}
/*--------------------------------------------------------------------------------------*/
/*============================ FUNCTION END: populateLedgerTable =======================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*======================= FUNCTION START: UI Modal Helpers ============================*/
/*--------------------------------------------------------------------------------------*/
function openPanel(mode) {
    resultPanel.style.display = 'flex';
    if(mode === 'ledger') {
        document.getElementById('panelTitle').innerText = "AI Scanner - Ledger Engine";
        document.getElementById('ledgerGroup').style.display = 'block';
        document.getElementById('ledgerCard').style.display = 'block';
        document.getElementById('generalOCRGroup').style.display = 'none';
    } else {
        document.getElementById('panelTitle').innerText = "AI Scanner - Text OCR Zone";
        document.getElementById('generalOCRGroup').style.display = 'block';
        document.getElementById('ledgerGroup').style.display = 'none';
    }
}

function closePanel() {
    resultPanel.style.display = 'none';
}

function resetFlow() {
    preview.src = "";
    startCamera();
}
/*--------------------------------------------------------------------------------------*/
/*======================== FUNCTION END: UI Modal Helpers ==============================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*====================== FUNCTION START: Calculations & Share =========================*/
/*--------------------------------------------------------------------------------------*/
function reCalculateLocalText() {
    const text = document.getElementById('editableText').value;
    const mathBox = document.getElementById('mathResult');
    document.getElementById('calcBox').style.display = 'flex';
    
    // Simple parser to find standard multiplication formats (e.g. 20 * 80)
    const match = text.match(/(\d+)\s*\*\\s*(\d+)/);
    if(match) {
        const res = parseInt(match[1]) * parseInt(match[2]);
        mathBox.innerText = `${match[1]} * ${match[2]} = ${res}`;
    } else {
        mathBox.innerText = "Processing live numbers...";
    }
}

function reCalculateLedger(index, element) {
    const val = parseInt(element.innerText) || 0;
    const tbody = document.getElementById('ledgerTable').querySelector('tbody');
    const row = tbody.rows[index];
    
    const amt = parseInt(row.cells[1].innerText) || 0;
    const ret = parseInt(row.cells[2].innerText) || 0;
    
    const newFinal = amt - ret + val;
    document.getElementById(`final-${index}`).innerText = newFinal;
    
    // Update grand total
    let newGrand = 0;
    for(let i=0; i<tbody.rows.length; i++) {
        newGrand += parseInt(document.getElementById(`final-${i}`).innerText) || 0;
    }
    document.getElementById('grandTotal').innerText = newGrand;
}

function shareContent() {
    const text = document.getElementById('editableText').value;
    if (navigator.share) {
        navigator.share({
            title: 'Ms Scanner AI Report',
            text: text,
        }).catch(console.error);
    } else {
        alert("Sharing not supported on this browser. Copying to clipboard:\n\n" + text);
        navigator.clipboard.writeText(text);
    }
}

function generatePDF() {
    alert("PDF Download Triggered! Generating layouts via jsPDF...");
}
/*--------------------------------------------------------------------------------------*/
/*======================= FUNCTION END: Calculations & Share ===========================*/
/*--------------------------------------------------------------------------------------*/
  
