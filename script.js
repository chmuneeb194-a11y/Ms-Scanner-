/* script.js - Advanced Intelligence Control Engine with Auto-Classification Pipeline */

const video = document.getElementById('video');
const preview = document.getElementById('imagePreview');
const captureBtn = document.getElementById('captureBtn');
const resetBtn = document.getElementById('resetBtn');
const scanOverlay = document.getElementById('scanOverlay');
const resultPanel = document.getElementById('resultPanel');
const loadingOverlay = document.getElementById('loadingOverlay');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

let streamRef = null;
let forcedMode = 'auto'; // System defaults to smart auto-detect intelligence tracking

// Initialize system layout automatically on page bootstrap trigger
window.onload = startCamera;


/*--------------------------------------------------------------------------------------*/
/*=========================== FUNCTION START: toggleSidebar ============================*/
/*--------------------------------------------------------------------------------------*/
/* Manages the animation slide state of the primary navigation panel drawer */
function toggleSidebar() {
    sidebar.classList.toggle('active');
    sidebarOverlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
}
/*--------------------------------------------------------------------------------------*/
/*============================ FUNCTION END: toggleSidebar =============================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*=========================== FUNCTION START: setForceMode =============================*/
/*--------------------------------------------------------------------------------------*/
/* Allows user to optionally override auto detection to lock specific template logic */
function setForceMode(mode) {
    forcedMode = mode;
    const items = document.querySelectorAll('.menu-item');
    items.forEach(item => item.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    document.getElementById('hudModeText').innerText = mode === 'auto' ? "AI Auto-Detecting active" : `Locked: ${mode.toUpperCase()} Mode`;
    
    toggleSidebar();
    resetFlow();
}
/*--------------------------------------------------------------------------------------*/
/*============================ FUNCTION END: setForceMode ==============================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*========================= FUNCTION START: toggleThemeMode ============================*/
/*--------------------------------------------------------------------------------------*/
/* Converts design system palette fields across light mode and dark mode matrix spaces */
function toggleThemeMode() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if(isLight) {
        themeIcon.className = "fas fa-sun";
        themeText.innerText = "Light Theme";
    } else {
        themeIcon.className = "fas fa-moon";
        themeText.innerText = "Dark Theme";
    }
    toggleSidebar();
}
/*--------------------------------------------------------------------------------------*/
/*============================ FUNCTION END: toggleThemeMode ===========================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*======================= FUNCTION START: triggerAppDownload ===========================*/
/*--------------------------------------------------------------------------------------*/
/* Simulates setup installation binaries pipeline directly on consumer environment */
function triggerAppDownload() {
    alert("Triggering premium ms-scanner native installation framework packages...");
}

function closeDownloadBanner() {
    document.getElementById('downloadBanner').style.display = 'none';
}
/*--------------------------------------------------------------------------------------*/
/*======================== FUNCTION END: triggerAppDownload ============================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*=========================== FUNCTION START: startCamera =============================*/
/*--------------------------------------------------------------------------------------*/
/* Boots real-time system back-facing environmental digital camera video stream channel */
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
        alert("System Camera activation block encountered! Check access permissions.");
        console.error(err);
    }
}
/*--------------------------------------------------------------------------------------*/
/*============================ FUNCTION END: startCamera ===============================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*=========================== FUNCTION START: captureFrame ============================*/
/*--------------------------------------------------------------------------------------*/
/* Freezes frame buffer state matrix into flat base64 canvas tracking references */
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
/* CORE ENGINE: Runs real-time auto detection processing to classify scan targets automatically */
function processAIWorkflow(imageData) {
    loadingOverlay.style.display = 'flex';
    document.getElementById('loadingMessage').innerText = "AI Analyzing Framework Patterns (Auto Detect Active)...";

    setTimeout(() => {
        let activeClassification = forcedMode;
        
        // AUTO DETECT SIMULATION FILTER SYSTEM: If mode is auto, engine decides template structure organically
        if (forcedMode === 'auto') {
            // Simulated probability matrix: Randomly matching edge data patterns for real test scenario
            const randomProbabilitySelector = Math.random();
            if(randomProbabilitySelector < 0.3) {
                activeClassification = 'idcard';
            } else if (randomProbabilitySelector >= 0.3 && randomProbabilitySelector < 0.6) {
                activeClassification = 'passport';
            } else {
                activeClassification = 'document'; // Matches traditional high-density account ledgers
            }
        }

        document.getElementById('loadingMessage').innerText = `Pattern Matched: ${activeClassification.toUpperCase()} Mode Processing...`;

        setTimeout(() => {
            let simulatedRawText = "";
            
            if (activeClassification === 'idcard') {
                simulatedRawText = "PAKISTAN NATIONAL IDENTITY CARD\n---------------------------\nName: Chaudhry Muneeb\nID Number: 34101-9876543-1\nDOB: 12-10-1998\nAI Verification Token: VERIFIED_OK";
                document.getElementById('editableText').value = simulatedRawText;
                openPanel('text-ocr');
            } else if (activeClassification === 'passport') {
                simulatedRawText = "OFFICIAL ISLAMIC REPUBLIC OF PAKISTAN PASSPORT\n---------------------------------------\nType: P, Code: PAK, No: LE908214\nSurname: MUNEEB\nGiven Names: CHAUDHRY\nAuthority: DIGITAL IMMIGRATION MATRIX OFFICE";
                document.getElementById('editableText').value = simulatedRawText;
                openPanel('text-ocr');
            } else {
                // Default high tier distribution account ledgers mapping structure (Up to 100 allocation lines handling)
                const simulatedLedgerData = [
                    { name: 'Dr. Malik (Sahiwal HQ)', amount: 12000, return: 1500, manual: 100 },
                    { name: 'Ali Pharma (Arifwala Desk)', amount: 8500, return: 0, manual: 250 },
                    { name: 'PharmaPlus (Pakpattan Link)', amount: 9000, return: 2000, manual: 0 },
                    { name: 'MediCare (Chichawatni Center)', amount: 15000, return: 5000, manual: 50 }
                ];
                
                simulatedRawText = "Ms AI Master Ledger Account Reconciliation Terminal\n===================================================\nTotal Clients Detected: 4 Target Nodes\nInitial Ledger Balance Allocation Sum: 44,500 PKR";
                
                document.getElementById('editableText').value = simulatedRawText;
                populateLedgerTable(simulatedLedgerData);
                openPanel('ledger');
            }
            
            loadingOverlay.style.display = 'none';
        }, 2000);

    }, 2000);
}
/*--------------------------------------------------------------------------------------*/
/*========================== FUNCTION END: processAIWorkflow ===========================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*======================= FUNCTION START: populateLedgerTable =========================*/
/*--------------------------------------------------------------------------------------*/
/* Renders operational arrays structural tracking details into raw editable DOM rows */
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
            <td><b>${row.name}</b></td>
            <td>${row.amount}</td>
            <td>${row.return}</td>
            <td class="editable-amount" contenteditable="true" oninput="reCalculateLedger(${index}, this)">${row.manual}</td>
            <td id="final-${index}" style="font-weight:700;">${final}</td>
        `;
        tbody.appendChild(tr);
    });

    const totalTr = document.createElement('tr');
    totalTr.classList.add('total-row');
    totalTr.innerHTML = `
        <td colspan="4">Grand Total Balance Balance:</td>
        <td id="grandTotal">${grandFinal}</td>
    `;
    tfoot.appendChild(totalTr);
}
/*--------------------------------------------------------------------------------------*/
/*============================ FUNCTION END: populateLedgerTable =======================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*=========================== FUNCTION START: openPanel ===============================*/
/*--------------------------------------------------------------------------------------*/
/* Handles workspace visualization routing based on classification target context matches */
function openPanel(mode) {
    resultPanel.style.display = 'flex';
    if(mode === 'ledger') {
        document.getElementById('panelTitle').innerText = "AI Auto-Detected: Distribution Ledger Layout";
        document.getElementById('ledgerGroup').style.display = 'block';
        document.getElementById('ledgerCard').style.display = 'block';
        document.getElementById('generalOCRGroup').style.display = 'none';
    } else {
        document.getElementById('panelTitle').innerText = "AI Auto-Detected: Structured Document Scanner";
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
/*============================ FUNCTION END: openPanel =================================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*========================== FUNCTION START: shareContent ==============================*/
/*--------------------------------------------------------------------------------------*/
/* Encodes terminal contents across direct native social application pathways cleanly */
function shareContent() {
    const reportText = document.getElementById('editableText').value;
    
    if (navigator.share) {
        navigator.share({
            title: 'Ms AI Scanner Certified Export',
            text: reportText
        }).catch(err => console.log("System Share Process Terminated"));
    } else {
        const encodedText = encodeURIComponent(reportText);
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
        const emailUrl = `mailto:?subject=Ms Scanner Certified Log Sheet Output&body=${encodedText}`;
        
        const systemPrompt = confirm("Advanced Web Native Share Missing.\nClick OK to route directly to WhatsApp.\nClick Cancel to fallback to Email client.");
        if (systemPrompt) {
            window.open(whatsappUrl, '_blank');
        } else {
            window.location.href = emailUrl;
        }
    }
}
/*--------------------------------------------------------------------------------------*/
/*=========================== FUNCTION END: shareContent ===============================*/
/*--------------------------------------------------------------------------------------*/


/*--------------------------------------------------------------------------------------*/
/*======================== FUNCTION START: reCalculateLedger ===========================*/
/*--------------------------------------------------------------------------------------*/
/* Recomputes column records on the fly when manual matrix cells receive inline updates */
function reCalculateLedger(index, element) {
    const val = parseInt(element.innerText) || 0;
    const tbody = document.getElementById('ledgerTable').querySelector('tbody');
    const row = tbody.rows[index];
    
    const amt = parseInt(row.cells[1].innerText) || 0;
    const ret = parseInt(row.cells[2].innerText) || 0;
    
    const newFinal = amt - ret + val;
    document.getElementById(`final-${index}`).innerText = newFinal;
    
    let newGrand = 0;
    for(let i=0; i<tbody.rows.length; i++) {
        newGrand += parseInt(document.getElementById(`final-${i}`).innerText) || 0;
    }
    document.getElementById('grandTotal').innerText = newGrand;
}
/*--------------------------------------------------------------------------------------*/
/*========================= FUNCTION END: reCalculateLedger ============================*/
/*--------------------------------------------------------------------------------------*/
