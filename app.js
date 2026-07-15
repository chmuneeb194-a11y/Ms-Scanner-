/* ==========================================================
   === START: GLOBAL APP STATE VARIABLES ===
   ========================================================== */
let cropperInstance = null;         // Cropper.js instance container
let activeCapturedImage = null;     // Stores original base64 image data
let currentCameraMode = 'single';   // 'single' or 'batch' mode controller
let localMediaStream = null;        // Camera hardware stream controller
let typedFieldsArray = [];          // Holds coordinates and text of tapped entries
let isFlashlightOn = false;         // Flash toggle state tracker
let isHDModeActive = true;          // Camera resolution setting tracker
/* ==========================================================
   === END: GLOBAL APP STATE VARIABLES ===
   ========================================================== */


/* ==========================================================
   === START: TAB NAVIGATION CONTROLLER ===
   ========================================================== */
function switchTab(targetTabId) {
    // Hide all view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    // Remove active style from tab buttons
    document.querySelectorAll('.ios-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected panel
    const activePanel = document.getElementById(`panel-${targetTabId}`);
    if (activePanel) {
        activePanel.classList.add('active');
    }
    // Highlight active button
    const activeBtn = document.getElementById(`tab-${targetTabId}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}
/* ==========================================================
   === END: TAB NAVIGATION CONTROLLER ===
   ========================================================== */


/* ==========================================================
   === START: CAMERA STREAM INITIALIZATION ===
   ========================================================== */
async function openLiveCamera() {
    const cameraOverlay = document.getElementById('cameraOverlay');
    const webcamVideo = document.getElementById('webcamStream');
    cameraOverlay.style.display = 'flex';

    // Set resolution constraints based on UHD 4K setting
    const videoWidth = isHDModeActive ? 3840 : 1920;
    const videoHeight = isHDModeActive ? 2160 : 1080;

    const constraints = {
        video: {
            facingMode: 'environment',
            width: { ideal: videoWidth },
            height: { ideal: videoHeight }
        },
        audio: false
    };

    try {
        localMediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        webcamVideo.srcObject = localMediaStream;
    } catch (err) {
        console.error("Camera access failed: ", err);
        alert("Please allow camera permissions to use the 2026 AI Live Scanner.");
        closeLiveCamera();
    }
}
/* ==========================================================
   === END: CAMERA STREAM INITIALIZATION ===
   ========================================================== */


/* ==========================================================
   === START: CAMERA SHUTDOWN FUNCTION ===
   ========================================================== */
function closeLiveCamera() {
    const cameraOverlay = document.getElementById('cameraOverlay');
    cameraOverlay.style.display = 'none';

    if (localMediaStream) {
        localMediaStream.getTracks().forEach(track => track.stop());
        localMediaStream = null;
    }
}
/* ==========================================================
   === END: CAMERA SHUTDOWN FUNCTION ===
   ========================================================== */


/* ==========================================================
   === START: FLASH & RESOLUTION CONTROLLERS ===
   ========================================================== */
function toggleCameraFlash() {
    if (!localMediaStream) return;
    const track = localMediaStream.getVideoTracks()[0];
    isFlashlightOn = !isFlashlightOn;

    // Check if system torch feature is supported
    const capabilities = track.getCapabilities();
    if (capabilities.torch) {
        track.applyConstraints({
            advanced: [{ torch: isFlashlightOn }]
        }).then(() => {
            document.getElementById('flashlightToggleBtn').innerText = isFlashlightOn ? "💡" : "⚡";
        }).catch(err => console.error("Torch error:", err));
    } else {
        alert("Flash/Torch is not supported on this mobile lens.");
    }
}

function toggleCameraResolution() {
    isHDModeActive = !isHDModeActive;
    const resBtn = document.getElementById('resToggleBtn');
    if (isHDModeActive) {
        resBtn.innerText = "UHD 4K";
        resBtn.style.color = "var(--ios-accent-blue)";
    } else {
        resBtn.innerText = "FHD 1080p";
        resBtn.style.color = "var(--text-gray)";
    }
    // Restart camera with new settings
    if (localMediaStream) {
        closeLiveCamera();
        openLiveCamera();
    }
}
/* ==========================================================
   === END: FLASH & RESOLUTION CONTROLLERS ===
   ========================================================== */


/* ==========================================================
   === START: CAMERA MODE CHIP SWITCHER ===
   ========================================================== */
function setCameraMode(mode, element) {
    currentCameraMode = mode;
    // Update active pill UI
    document.querySelectorAll('.mode-pill').forEach(pill => {
        pill.classList.remove('active');
    });
    element.classList.add('active');

    const badge = document.getElementById('batchCountBadge');
    if (mode === 'batch') {
        badge.style.visibility = 'visible';
    } else {
        badge.style.visibility = 'hidden';
    }
}
/* ==========================================================
   === END: CAMERA MODE CHIP SWITCHER ===
   ========================================================== */


/* ==========================================================
   === START: IMAGE FILE UPLOAD FROM GALLERY ===
   ========================================================== */
function handleFile(inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        closeLiveCamera();
        startAutoCropper(e.target.result);
    };
    reader.readAsDataURL(file);
}
/* ==========================================================
   === END: IMAGE FILE UPLOAD FROM GALLERY ===
   ========================================================== */
// === START OF FUNCTION: handleCanvasTap ===
function handleCanvasTap(event) {
    const imgBase = document.getElementById('canvasImageBase');
    const container = document.getElementById('editableFieldsContainer');
    
    const rect = imgBase.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    const adjustedX = clickX - 25; 
    const adjustedY = clickY - 7;

    const pctX = (adjustedX / rect.width) * 100;
    const pctY = (adjustedY / rect.height) * 100;

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.className = 'live-tap-input-field';
    
    inputField.style.left = `${pctX}%`;
    inputField.style.top = `${pctY}%`;
    
    container.appendChild(inputField);
    inputField.focus();

    inputField.addEventListener('blur', function() {
        if (inputField.value.trim() !== "") {
            inputField.style.border = "none";
            inputField.style.background = "transparent";
            
            saveTypedFieldData(pctX, pctY, inputField.value);
            calculateSubtotals();
        } else {
            inputField.remove();
        }
    });

    inputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            inputField.blur();
        }
    });
}
// === END OF FUNCTION: handleCanvasTap ===

/* ==========================================================
   === START: SAVE TYPED FIELD INTERNAL DATA ===
   ========================================================== */
function saveTypedFieldData(x, y, textVal) {
    typedFieldsArray.push({
        xCoord: x,
        yCoord: y,
        text: textVal
    });
}
/* ==========================================================
   === END: SAVE TYPED FIELD INTERNAL DATA ===
   ========================================================== */


/* ==========================================================
   === START: LIVE MATH CALCULATOR & SUBTOTAL ENGINE ===
   ========================================================== */
function executeLiveMathCalculation() {
    let subtotalSum = 0;
    let counts = 0;

    // Read all inputs inside the editable container
    const allInputs = document.querySelectorAll('.live-tap-input-field');
    
    allInputs.forEach(input => {
        const val = input.value.replace(/[^0-9.-]/g, ''); // پریمیم فلٹر: صرف نمبرز نکالے گا
        if (val !== "" && !isNaN(val)) {
            subtotalSum += parseFloat(val);
            counts++;
        }
    });

    // Update bottom Live Status Panel dynamically
    const mathStatusEl = document.getElementById('liveMathStatus');
    if (counts > 0) {
        // Format to standard Pakistani Currency / Decimal Representation
        const formattedSum = subtotalSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        mathStatusEl.innerHTML = `Total Fields: <strong>${counts}</strong> | Subtotal: <strong style="color:#0bb376;">RS. ${formattedSum}</strong>`;
    } else {
        mathStatusEl.innerText = "No Numbers Found";
    }
}
/* ==========================================================
   === END: LIVE MATH CALCULATOR & SUBTOTAL ENGINE ===
   ========================================================== */
/* ==========================================================
   === START: REAL-TIME AUTOMATIC CROPPER ENGINE ===
   ========================================================== */
function startAutoCropper(imageSrc) {
    const cropOverlay = document.getElementById('cropScreenOverlay');
    const cropImg = document.getElementById('cropImageTarget');
    
    cropImg.src = imageSrc;
    cropOverlay.style.display = 'flex';

    // Destroy existing instance to avoid memory leak
    if (cropperInstance) {
        cropperInstance.destroy();
    }

    // Initialize CropperJS with custom styling to automatically detect document bounds
    setTimeout(() => {
        cropperInstance = new Cropper(cropImg, {
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.95, // 95% boundary auto selection
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
        });
    }, 200);
}

function rotateCropImage() {
    if (cropperInstance) {
        cropperInstance.rotate(90);
    }
}

function resetCropSelection() {
    if (cropperInstance) {
        cropperInstance.reset();
    }
}

function cancelCropper() {
    document.getElementById('cropScreenOverlay').style.display = 'none';
    if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
    }
}
/* ==========================================================
   === END: REAL-TIME AUTOMATIC CROPPER ENGINE ===
   ========================================================== */


/* ==========================================================
   === START: CROP APPLY & WORKSPACE LOADING ===
   ========================================================== */
function applyCropAndContinue() {
    if (!cropperInstance) return;

    // Get cropped canvas data
    const canvas = cropperInstance.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });

    activeCapturedImage = canvas.toDataURL('image/jpeg', 0.95);
    
    // Set workspace base image
    const wsImg = document.getElementById('canvasImageBase');
    wsImg.src = activeCapturedImage;

    // Clear any previous typed fields
    document.getElementById('editableFieldsContainer').innerHTML = "";
    typedFieldsArray = [];
    executeLiveMathCalculation();

    // Show workspace & close cropper
    cancelCropper();
    document.getElementById('premiumWorkspace').classList.add('active');
}
/* ==========================================================
   === END: CROP APPLY & WORKSPACE LOADING ===
   ========================================================== */


/* ==========================================================
   === START: 2026 ADVANCED IMAGE FILTERS ===
   ========================================================== */
function applyImageFilter(filterType) {
    const wsImg = document.getElementById('canvasImageBase');
    
    // Reset filters active state
    document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
    
    // Map active filter styling
    if (filterType === 'original') {
        wsImg.style.filter = 'none';
        document.getElementById('filter-orig').classList.add('active');
    } else if (filterType === 'magicColor') {
        // High contrast, vivid document enhancer
        wsImg.style.filter = 'contrast(1.2) saturate(1.1) brightness(1.02)';
        document.getElementById('filter-magic').classList.add('active');
    } else if (filterType === 'bw') {
        // Ultimate black and white document look
        wsImg.style.filter = 'contrast(1.6) brightness(0.95) grayscale(1)';
        document.getElementById('filter-bw').classList.add('active');
    } else if (filterType === 'grayscale') {
        wsImg.style.filter = 'grayscale(1)';
        document.getElementById('filter-gray').classList.add('active');
    }
}
/* ==========================================================
   === END: 2026 ADVANCED IMAGE FILTERS ===
   ========================================================== */


/* ==========================================================
   === START: CAMERA SHUTTER SNAPSHOT CAPTURE ===
   ========================================================== */
function captureLiveSnapshot() {
    const video = document.getElementById('webcamStream');
    if (!video.srcObject) return;

    document.getElementById('globalLoader').style.display = 'flex';

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw current frame on canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const rawImage = canvas.toDataURL('image/jpeg', 0.95);
    
    document.getElementById('globalLoader').style.display = 'none';
    closeLiveCamera();
    
    // Send directly to auto cropper
    startAutoCropper(rawImage);
}
/* ==========================================================
   === END: CAMERA SHUTTER SNAPSHOT CAPTURE ===
   ========================================================== */


/* ==========================================================
   === START: COMPILING & EXPORTING PDF ENGINE ===
   ========================================================== */
async function processDoc(formatType) {
    document.getElementById('globalLoader').style.display = 'flex';
    
    const baseImg = document.getElementById('canvasImageBase');
    
    // Create offline canvas to merge base image and typed inputs
    const mergeCanvas = document.createElement('canvas');
    mergeCanvas.width = baseImg.naturalWidth;
    mergeCanvas.height = baseImg.naturalHeight;
    const ctx = mergeCanvas.getContext('2d');

    // Load actual image
    const imgObj = new Image();
    imgObj.src = baseImg.src;
    
    imgObj.onload = function() {
        // Apply currently active CSS filters on offline canvas context
        ctx.filter = getComputedStyle(baseImg).filter;
        ctx.drawImage(imgObj, 0, 0, mergeCanvas.width, mergeCanvas.height);
        ctx.filter = 'none'; // reset filter for text

        // Write every typed field at exact responsive coordinates
        typedFieldsArray.forEach(field => {
            // Convert percentage back to actual natural pixels
            const xPixel = (field.xCoord / 100) * mergeCanvas.width;
            const yPixel = (field.yCoord / 100) * mergeCanvas.height;

            // Apply exact Sahiwal delivery invoice text font matching (Arial Bold, Black, 11px scale)
            // Scaling font relative to canvas size for high-res output
            const fontScale = mergeCanvas.width * 0.015; // Responsive scale factor
            ctx.font = `600 ${fontScale}px Arial, sans-serif`;
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'right'; // Align entries perfectly
            ctx.fillText(field.text, xPixel + (fontScale * 2), yPixel + fontScale);
        });

        const finalDataURL = mergeCanvas.toDataURL('image/jpeg', 0.95);

        if (formatType === 'pdf') {
            // Generate professional PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'px', [mergeCanvas.width, mergeCanvas.height]);
            pdf.addImage(finalDataURL, 'JPEG', 0, 0, mergeCanvas.width, mergeCanvas.height);
            pdf.save('Shadab_Pharmacy_Supply_Summary.pdf');
        }

        document.getElementById('globalLoader').style.display = 'none';
    };
}
/* ==========================================================
   === END: COMPILING & EXPORTING PDF ENGINE ===
   ========================================================== */
/* ==========================================================
   === START: ADVANCED WEB SHARE API FOR WHATSAPP/SYSTEM ===
   ========================================================== */
async function shareToWhatsApp() {
    document.getElementById('globalLoader').style.display = 'flex';
    
    const baseImg = document.getElementById('canvasImageBase');
    const mergeCanvas = document.createElement('canvas');
    mergeCanvas.width = baseImg.naturalWidth;
    mergeCanvas.height = baseImg.naturalHeight;
    const ctx = mergeCanvas.getContext('2d');

    const imgObj = new Image();
    imgObj.src = baseImg.src;
    
    imgObj.onload = async function() {
        ctx.filter = getComputedStyle(baseImg).filter;
        ctx.drawImage(imgObj, 0, 0, mergeCanvas.width, mergeCanvas.height);
        ctx.filter = 'none';

        // Write typed texts
        typedFieldsArray.forEach(field => {
            const xPixel = (field.xCoord / 100) * mergeCanvas.width;
            const yPixel = (field.yCoord / 100) * mergeCanvas.height;
            const fontScale = mergeCanvas.width * 0.015;
            ctx.font = `600 ${fontScale}px Arial, sans-serif`;
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'right';
            ctx.fillText(field.text, xPixel + (fontScale * 2), yPixel + fontScale);
        });
// === START OF BLOCK: PRINT TOTAL ON CANVAS ===
if (currentSubtotalSum > 0) {
    const formattedSum = currentSubtotalSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalX = mergeCanvas.width * 0.61; 
    const totalY = mergeCanvas.height * 0.585; 
    const fontScaleTotal = mergeCanvas.width * 0.014;

    ctx.font = `700 ${fontScaleTotal}px Arial, sans-serif`;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'right';
    ctx.fillText(formattedSum, totalX, totalY);
}
// === END OF BLOCK: PRINT TOTAL ON CANVAS ===
       
        // Convert canvas drawing to BLOB (File Format)
        mergeCanvas.toBlob(async (blob) => {
            document.getElementById('globalLoader').style.display = 'none';
            if (!blob) {
                alert("Error compiling image file.");
                return;
            }

            // Create a real file object
            const file = new File([blob], "Shadab_Pharmacy_Summary.jpg", { type: "image/jpeg" });

            // Check if mobile device supports native sharing
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Shadab Pharmacy Summary',
                        text: 'Generated via MS CamScanner AI Pro'
                    });
                } catch (err) {
                    console.log("Sharing failed, opening fallback link: ", err);
                    window.open(`https://api.whatsapp.com/send?text=Summary generated but could not auto-attach. Please check Gallery.`, '_blank');
                }
            } else {
                // Fallback for desktop/older browsers
                const dummyLink = document.createElement('a');
                dummyLink.href = URL.createObjectURL(blob);
                dummyLink.download = "Shadab_Pharmacy_Summary.jpg";
                dummyLink.click();
                alert("Native sharing not supported on this device. The processed image has been downloaded to your gallery. You can now send it manually to WhatsApp!");
            }
        }, 'image/jpeg', 0.95);
    };
}
/* ==========================================================
   === END: ADVANCED WEB SHARE API FOR WHATSAPP/SYSTEM ===
   ========================================================== */

/* ==========================================================
   === START: SIGNATURE CANVAS SETUP VARIABLES ===
   ========================================================== */
let sigCanvas = null;
let sigCtx = null;
let isDrawingSignature = false;
/* ==========================================================
   === END: SIGNATURE CANVAS SETUP VARIABLES ===
   ========================================================== */


/* ==========================================================
   === START: OPEN & CLOSE SIGNATURE OVERLAY ===
   ========================================================== */
function openSignatureOverlay() {
    const overlay = document.getElementById('signatureOverlay');
    overlay.style.display = 'flex';
    
    // Initialize Canvas if not already done
    sigCanvas = document.getElementById('signatureCanvas');
    sigCtx = sigCanvas.getContext('2d');
    
    // Set correct drawing resolution
    sigCanvas.width = sigCanvas.offsetWidth;
    sigCanvas.height = sigCanvas.offsetHeight;
    
    // Smooth lines setup
    sigCtx.strokeStyle = "#000000"; // Black signature ink
    sigCtx.lineWidth = 3;
    sigCtx.lineCap = "round";
    sigCtx.lineJoin = "round";

    // Setup touch and mouse drawing listeners
    attachSignatureDrawListeners();
}

function closeSignatureOverlay() {
    document.getElementById('signatureOverlay').style.display = 'none';
    clearSignature();
}
/* ==========================================================
   === END: OPEN & CLOSE SIGNATURE OVERLAY ===
   ========================================================== */


/* ==========================================================
   === START: DETECT DRAWING TOUCH & MOUSE EVENTS ===
   ========================================================== */
function attachSignatureDrawListeners() {
    // Mouse events
    sigCanvas.addEventListener('mousedown', startDrawing);
    sigCanvas.addEventListener('mousemove', drawLine);
    sigCanvas.addEventListener('mouseup', stopDrawing);
    sigCanvas.addEventListener('mouseout', stopDrawing);

    // Touch events for Mobile/iPad screen
    sigCanvas.addEventListener('touchstart', function (e) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        sigCanvas.dispatchEvent(mouseEvent);
    }, { passive: true });

    sigCanvas.addEventListener('touchmove', function (e) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        sigCanvas.dispatchEvent(mouseEvent);
    }, { passive: true });

    sigCanvas.addEventListener('touchend', function (e) {
        const mouseEvent = new MouseEvent("mouseup", {});
        sigCanvas.dispatchEvent(mouseEvent);
    }, { passive: true });
}

function startDrawing(e) {
    isDrawingSignature = true;
    const rect = sigCanvas.getBoundingClientRect();
    sigCtx.beginPath();
    sigCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function drawLine(e) {
    if (!isDrawingSignature) return;
    const rect = sigCanvas.getBoundingClientRect();
    sigCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    sigCtx.stroke();
}

function stopDrawing() {
    isDrawingSignature = false;
}
/* ==========================================================
   === END: DETECT DRAWING TOUCH & MOUSE EVENTS ===
   ========================================================== */


/* ==========================================================
   === START: CLEAR SIGNATURE CANVAS ===
   ========================================================== */
function clearSignature() {
    if (sigCtx && sigCanvas) {
        sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    }
}
/* ==========================================================
   === END: CLEAR SIGNATURE CANVAS ===
   ========================================================== */


/* ==========================================================
   === START: SAVE SIGNATURE & OVERLAY ON IMAGE ===
   ========================================================== */
function saveSignatureAndApply() {
    if (!sigCanvas) return;
    
    // Convert drawn signature to Base64
    const sigDataUrl = sigCanvas.toDataURL('image/png');
    
    // Create an image element to overlay on the workspace
    const sigImg = document.createElement('img');
    sigImg.src = sigDataUrl;
    sigImg.style.position = "absolute";
    
    // Position signature near the standard "Signature:" line area
    sigImg.style.bottom = "12%";
    sigImg.style.left = "15%";
    sigImg.style.width = "120px";
    sigImg.style.pointerEvents = "auto";
    sigImg.style.cursor = "move"; // Drag & drop supported
    sigImg.id = "dynamicDocSignature";
    
    // Remove previous signature if exists
    const oldSig = document.getElementById('dynamicDocSignature');
    if (oldSig) oldSig.remove();

    // Attach to canvas wrapper
    document.getElementById('canvasBaseWrapper').appendChild(sigImg);
    
    // Close signature pad
    closeSignatureOverlay();
    alert("Signature placed on document! You can drag to position if needed.");
}
/* ==========================================================
   === END: SAVE SIGNATURE & OVERLAY ON IMAGE ===
   ========================================================== */
// global variable definition (place this where other globals are defined or right above)
let currentSubtotalSum = 0;

// === START OF FUNCTION: calculateSubtotals ===
function calculateSubtotals() {
    let tempSum = 0;
    const allInputs = document.querySelectorAll('.live-tap-input-field');
    
    allInputs.forEach(input => {
        const val = input.value.replace(/[^0-9.-]/g, ''); 
        if (val !== "" && !isNaN(val)) {
            tempSum += parseFloat(val);
        }
    });

    currentSubtotalSum = tempSum;
    updateLiveCalculatorUI();
}
// === END OF FUNCTION: calculateSubtotals ===

// === START OF FUNCTION: updateLiveCalculatorUI ===
function updateLiveCalculatorUI() {
    const mathStatusEl = document.getElementById('liveMathStatus');
    if (mathStatusEl) {
        if (currentSubtotalSum > 0) {
            const formattedSum = currentSubtotalSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            mathStatusEl.innerHTML = `Running Total: <strong style="color:#0bb376;">RS. ${formattedSum}</strong>`;
        } else {
            mathStatusEl.innerText = "No Entries Recorded";
        }
    }
}
// === END OF FUNCTION: updateLiveCalculatorUI ===
