import { GoogleGenAI } from "@google/genai";

// --- Global DOM Element References ---
const userPromptInput = document.getElementById('userPrompt') as HTMLInputElement;
const enhanceButton = document.getElementById('enhanceButton') as HTMLButtonElement;
const loadingAnimation = document.getElementById('loadingAnimation');
const loadingText = document.getElementById('loadingText');
const resultsDiv = document.getElementById('results');
const imagePromptOutputContainer = document.getElementById('imagePromptOutputContainer') as HTMLElement;
const videoPromptOutputContainer = document.getElementById('videoPromptOutputContainer') as HTMLElement;
const imagePromptVariationsDiv = document.getElementById('imagePromptVariationsDiv') as HTMLElement;
const videoPromptVariationsDiv = document.getElementById('videoPromptVariationsDiv') as HTMLElement;
const errorMessageDiv = document.getElementById('errorMessage');
const errorMessageText = document.getElementById('errorMessageText');
const analyzeOriginalPromptButton = document.getElementById('analyzeOriginalPromptButton') as HTMLButtonElement;
const originalPromptAnalysisResultDiv = document.getElementById('originalPromptAnalysisResult');
const originalPromptAnalysisText = document.getElementById('originalPromptAnalysisText');
const originalPromptAnalysisLoader = document.getElementById('originalPromptAnalysisLoader');
const promptDetailSlider = document.getElementById('promptDetailSlider') as HTMLInputElement;
const promptDetailValue = document.getElementById('promptDetailValue') as HTMLSpanElement;
const downloadPromptsButton = document.getElementById('downloadPromptsButton') as HTMLButtonElement;
const onlyImageCheckbox = document.getElementById('onlyImageCheckbox') as HTMLInputElement;
const onlyVideoCheckbox = document.getElementById('onlyVideoCheckbox') as HTMLInputElement;
const onlyImageCheckboxLabel = document.getElementById('onlyImageCheckboxLabel') as HTMLLabelElement;
const onlyVideoCheckboxLabel = document.getElementById('onlyVideoCheckboxLabel') as HTMLLabelElement;
const resultsSeparator = document.getElementById('resultsSeparator') as HTMLElement;
const notificationSound = document.getElementById('notificationSound') as HTMLAudioElement | null; 

// --- Detail Style Checkboxes ---
const highlyDetailedCheckbox = document.getElementById('highlyDetailedCheckbox') as HTMLInputElement;
const simpleCheckbox = document.getElementById('simpleCheckbox') as HTMLInputElement;
const highlyDetailedLabel = document.getElementById('highlyDetailedLabel') as HTMLLabelElement;
const simpleLabel = document.getElementById('simpleLabel') as HTMLLabelElement;


// --- Creative Idea Generator DOM Elements ---
const ideaKeywordsInput = document.getElementById('ideaKeywordsInput') as HTMLInputElement;
const generateImageIdeasButton = document.getElementById('generateImageIdeasButton') as HTMLButtonElement;
const generateVideoIdeasButton = document.getElementById('generateVideoIdeasButton') as HTMLButtonElement;
const ideaLoadingAnimation = document.getElementById('ideaLoadingAnimation');
const ideaErrorMessageContainer = document.getElementById('ideaErrorMessageContainer');
const ideaErrorMessageText = document.getElementById('ideaErrorMessageText');
const creativeIdeasResultDiv = document.getElementById('creativeIdeasResultDiv');

// --- Photography Popup Menu DOM Elements ---
const togglePopupButton = document.getElementById('togglePopupButton') as HTMLButtonElement;
const popupMenuContainer = document.getElementById('popupMenuContainer') as HTMLDivElement;
const exposureSelect = document.getElementById('exposureSelect') as HTMLSelectElement;
const shutterSelect = document.getElementById('shutterSelect') as HTMLSelectElement;
const apertureSelect = document.getElementById('apertureSelect') as HTMLSelectElement;
const compositionSelect = document.getElementById('compositionSelect') as HTMLSelectElement;
const lightSelect = document.getElementById('lightSelect') as HTMLSelectElement;
const popupOverlay = document.getElementById('popupOverlay') as HTMLDivElement;
const closePopupButton = document.getElementById('closePopupButton') as HTMLButtonElement;
const confirmPhotographySettingsButton = document.getElementById('confirmPhotographySettingsButton') as HTMLButtonElement;

// --- 3D Design Popup Menu DOM Elements ---
const toggleThreeDPopupButton = document.getElementById('toggleThreeDPopupButton') as HTMLButtonElement;
const threeDMenuContainer = document.getElementById('threeDMenuContainer') as HTMLDivElement;
const threeDStyle1Select = document.getElementById('threeDStyle1Select') as HTMLSelectElement;
const threeDStyle2Select = document.getElementById('threeDStyle2Select') as HTMLSelectElement;
const threeDStyle3Select = document.getElementById('threeDStyle3Select') as HTMLSelectElement;
const threeDLightSelect = document.getElementById('threeDLightSelect') as HTMLSelectElement;
const closeThreeDPopupButton = document.getElementById('closeThreeDPopupButton') as HTMLButtonElement;
const confirmThreeDSettingsButton = document.getElementById('confirmThreeDSettingsButton') as HTMLButtonElement;

// --- Flat Design Popup Menu DOM Elements ---
const toggleFlatDesignPopupButton = document.getElementById('toggleFlatDesignPopupButton') as HTMLButtonElement;
const flatDesignMenuContainer = document.getElementById('flatDesignMenuContainer') as HTMLDivElement;
const flatDesignStyleSelect = document.getElementById('flatDesignStyleSelect') as HTMLSelectElement;
const flatDesignColorSelect = document.getElementById('flatDesignColorSelect') as HTMLSelectElement;
const flatDesignViewSelect = document.getElementById('flatDesignViewSelect') as HTMLSelectElement;
const closeFlatDesignPopupButton = document.getElementById('closeFlatDesignPopupButton') as HTMLButtonElement;
const confirmFlatDesignSettingsButton = document.getElementById('confirmFlatDesignSettingsButton') as HTMLButtonElement;

// --- Prompt Quantity Radio Buttons ---
const promptQuantityRadios = Array.from(document.querySelectorAll('input[name="promptQuantity"]')) as HTMLInputElement[];

// --- API Choice DOM Elements ---
const apiChoiceContainer = document.getElementById('apiChoiceContainer') as HTMLDivElement;
const defaultApiLabel = document.getElementById('defaultApiLabel') as HTMLLabelElement;
const customApiLabel = document.getElementById('customApiLabel') as HTMLLabelElement;
const defaultApiRadio = document.getElementById('defaultApiRadioInput') as HTMLInputElement;
const customApiRadio = document.getElementById('customApiRadioInput') as HTMLInputElement;
const customApiKeyInputContainer = document.getElementById('customApiKeyInputContainer') as HTMLDivElement;
const customApiKeyInput = document.getElementById('customApiKeyInput') as HTMLInputElement;
const apiKeyStatusMessage = document.getElementById('apiKeyStatusMessage') as HTMLDivElement;
const saveApiKeyCheckbox = document.getElementById('saveApiKeyCheckbox') as HTMLInputElement;

// --- Info Popup DOM Elements ---
const infoPopup = document.getElementById('infoPopup') as HTMLDivElement | null;
const infoPopupOverlay = document.getElementById('infoPopupOverlay') as HTMLDivElement | null;
const closeInfoPopupButton = document.getElementById('closeInfoPopupButton') as HTMLButtonElement | null;
let lastFocusedElementBeforeInfoPopup: HTMLElement | null = null;


// --- AI SDK INITIALIZATION ---
let ai: GoogleGenAI | undefined;
let lastFocusedElement: HTMLElement | null = null;
let lastUsedApiKey: string | null = null; // To compare if re-initialization is truly needed

// Function to disable/enable core app features, not API selection itself
function disableCoreAppFunctionality(disabled: boolean) {
    if (enhanceButton) enhanceButton.disabled = disabled;
    if (userPromptInput) userPromptInput.disabled = disabled;
    if (analyzeOriginalPromptButton) analyzeOriginalPromptButton.disabled = disabled;
    if (promptDetailSlider) promptDetailSlider.disabled = disabled;
    
    if (onlyImageCheckbox) onlyImageCheckbox.disabled = disabled;
    if (onlyVideoCheckbox) onlyVideoCheckbox.disabled = disabled;
    if (highlyDetailedCheckbox) highlyDetailedCheckbox.disabled = disabled;
    if (simpleCheckbox) simpleCheckbox.disabled = disabled;

    if (togglePopupButton) togglePopupButton.disabled = disabled;
    if (toggleThreeDPopupButton) toggleThreeDPopupButton.disabled = disabled;
    if (toggleFlatDesignPopupButton) toggleFlatDesignPopupButton.disabled = disabled;
    
    if (confirmPhotographySettingsButton) confirmPhotographySettingsButton.disabled = disabled;
    if (confirmThreeDSettingsButton) confirmThreeDSettingsButton.disabled = disabled;
    if (confirmFlatDesignSettingsButton) confirmFlatDesignSettingsButton.disabled = disabled;

    if (ideaKeywordsInput) ideaKeywordsInput.disabled = disabled;
    if (generateImageIdeasButton) generateImageIdeasButton.disabled = disabled;
    if (generateVideoIdeasButton) generateVideoIdeasButton.disabled = disabled;
    if (downloadPromptsButton) downloadPromptsButton.disabled = disabled;
    promptQuantityRadios.forEach(radio => radio.disabled = disabled);
}


async function initializeAiSDK(): Promise<boolean> {
    let keyToUse: string | undefined = undefined;
    let currentSource: 'default' | 'custom' = defaultApiRadio.checked ? 'default' : 'custom';
    let loadedFromStorage = false;

    if (currentSource === 'custom') {
        keyToUse = customApiKeyInput.value.trim();
        if (customApiKeyInput.value === localStorage.getItem('customGeminiApiKey') && saveApiKeyCheckbox.checked) {
            loadedFromStorage = true;
        }

        if (!keyToUse) {
            const msg = "Pilih 'API Kamu' dan masukkan API Key Gemini Anda.";
            if (apiKeyStatusMessage) {
                apiKeyStatusMessage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-2 shrink-0"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" /></svg> <span>${msg}</span>`;
                apiKeyStatusMessage.className = 'api-status-message error';
                apiKeyStatusMessage.classList.remove('hidden');
            }
            disableCoreAppFunctionality(true);
            ai = undefined;
            lastUsedApiKey = null;
            return false;
        }
    } else { // 'default'
        keyToUse = process.env.API_KEY;
        if (!keyToUse) {
            const msg = "API Bawaan tidak terkonfigurasi. Silakan gunakan 'API Kamu' atau hubungi administrator.";
             if (apiKeyStatusMessage) {
                apiKeyStatusMessage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-2 shrink-0"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" /></svg> <span>${msg}</span>`;
                apiKeyStatusMessage.className = 'api-status-message error';
                apiKeyStatusMessage.classList.remove('hidden');
            }
            disableCoreAppFunctionality(true);
            ai = undefined;
            lastUsedApiKey = null;
            return false;
        }
    }

    if (ai && lastUsedApiKey === keyToUse) {
        // console.log(`AI SDK already initialized with the correct ${currentSource} API key.`);
         if (apiKeyStatusMessage && apiKeyStatusMessage.classList.contains('hidden')) { // Ensure status is visible if it was hidden
            let keyDisplay = `(${keyToUse.substring(0,4)}...${keyToUse.substring(keyToUse.length-4)})`;
            let loadedMsg = loadedFromStorage ? " API Key dimuat dari penyimpanan lokal." : "";
            apiKeyStatusMessage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-2 shrink-0"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.06 0l4-5.5Z" clip-rule="evenodd" /></svg> <span>Menggunakan ${currentSource === 'default' ? 'API Bawaan' : 'API Kamu'} ${keyDisplay}.${loadedMsg} Siap digunakan.</span>`;
            apiKeyStatusMessage.className = 'api-status-message success';
            apiKeyStatusMessage.classList.remove('hidden');
        }
        disableCoreAppFunctionality(false); // Ensure app is enabled
        return true; // Already initialized with this key
    }

    try {
        ai = new GoogleGenAI({ apiKey: keyToUse });
        lastUsedApiKey = keyToUse;
        console.log(`AI SDK initialized/re-initialized with ${currentSource} API key.`);
        
        if (currentSource === 'custom') {
            if (saveApiKeyCheckbox.checked) {
                localStorage.setItem('customGeminiApiKey', keyToUse);
                localStorage.setItem('saveApiKeyPreference', 'true');
            } else {
                localStorage.setItem('saveApiKeyPreference', 'false'); 
            }
        }

        if (apiKeyStatusMessage) {
            let keyDisplay = `(${keyToUse.substring(0,4)}...${keyToUse.substring(keyToUse.length-4)})`;
            let loadedMsg = loadedFromStorage && currentSource === 'custom' ? " API Key dimuat dari penyimpanan lokal." : "";
            apiKeyStatusMessage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-2 shrink-0"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.06 0l4-5.5Z" clip-rule="evenodd" /></svg> <span>Menggunakan ${currentSource === 'default' ? 'API Bawaan' : 'API Kamu'} ${keyDisplay}.${loadedMsg} Siap digunakan.</span>`;
            apiKeyStatusMessage.className = 'api-status-message success';
            apiKeyStatusMessage.classList.remove('hidden');
        }
        if (errorMessageDiv && !errorMessageDiv.classList.contains('hidden') && errorMessageText && (errorMessageText.textContent?.includes("API") || errorMessageText.textContent?.includes("SDK"))) {
            errorMessageDiv.classList.add('hidden'); 
        }
        disableCoreAppFunctionality(false);
        return true;
    } catch (e: any) {
        ai = undefined; 
        lastUsedApiKey = null;
        const errorMsgForDisplay = `Gagal inisialisasi SDK (${currentSource}): ${e.message}. Key mungkin tidak valid.`;
        if (apiKeyStatusMessage) {
            apiKeyStatusMessage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-2 shrink-0"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" /></svg> <span>${errorMsgForDisplay}</span>`;
            apiKeyStatusMessage.className = 'api-status-message error';
            apiKeyStatusMessage.classList.remove('hidden');
        }
        if (errorMessageText) errorMessageText.textContent = errorMsgForDisplay;
        if (errorMessageDiv) errorMessageDiv.classList.remove('hidden');

        disableCoreAppFunctionality(true);
        return false;
    }
}


// --- UTILITY FUNCTIONS ---
function showLoading(message: string = "Memproses...") {
    if (loadingAnimation) loadingAnimation.classList.remove('hidden');
    if (loadingText) loadingText.textContent = message;
    if (resultsDiv) resultsDiv.classList.add('hidden');
    disableInteraction(true);
}

function hideLoading() {
    if (loadingAnimation) loadingAnimation.classList.add('hidden');
    disableInteraction(false);
}

function disableInteraction(disabled: boolean) {
    if (enhanceButton) enhanceButton.disabled = disabled;
    if (userPromptInput) userPromptInput.disabled = disabled;
    if (analyzeOriginalPromptButton) analyzeOriginalPromptButton.disabled = disabled;
    if (promptDetailSlider) promptDetailSlider.disabled = disabled;
    
    if (onlyImageCheckbox) onlyImageCheckbox.disabled = disabled;
    if (onlyVideoCheckbox) onlyVideoCheckbox.disabled = disabled;
    if (highlyDetailedCheckbox) highlyDetailedCheckbox.disabled = disabled;
    if (simpleCheckbox) simpleCheckbox.disabled = disabled;

    if (togglePopupButton) togglePopupButton.disabled = disabled;
    if (toggleThreeDPopupButton) toggleThreeDPopupButton.disabled = disabled;
    if (toggleFlatDesignPopupButton) toggleFlatDesignPopupButton.disabled = disabled;
    
    if (confirmPhotographySettingsButton) confirmPhotographySettingsButton.disabled = disabled;
    if (confirmThreeDSettingsButton) confirmThreeDSettingsButton.disabled = disabled;
    if (confirmFlatDesignSettingsButton) confirmFlatDesignSettingsButton.disabled = disabled;

    if (ideaKeywordsInput) ideaKeywordsInput.disabled = disabled;
    if (generateImageIdeasButton) generateImageIdeasButton.disabled = disabled;
    if (generateVideoIdeasButton) generateVideoIdeasButton.disabled = disabled;
    if (downloadPromptsButton) downloadPromptsButton.disabled = disabled;
    promptQuantityRadios.forEach(radio => radio.disabled = disabled);

    if (defaultApiRadio) defaultApiRadio.disabled = disabled;
    if (customApiRadio) customApiRadio.disabled = disabled;
    if (customApiKeyInput) customApiKeyInput.disabled = disabled;
    if (saveApiKeyCheckbox) saveApiKeyCheckbox.disabled = disabled;
    const interactiveApiLabels = [defaultApiLabel, customApiLabel];
    interactiveApiLabels.forEach(label => {
        if (label) {
            label.style.pointerEvents = disabled ? 'none' : 'auto';
            label.setAttribute('aria-disabled', disabled.toString());
        }
    });
}


function showError(message: string) {
    if (errorMessageText) errorMessageText.textContent = message;
    if (errorMessageDiv) errorMessageDiv.classList.remove('hidden');
    hideLoading(); 
    if (originalPromptAnalysisLoader) originalPromptAnalysisLoader.classList.add('hidden');
    if (ideaLoadingAnimation) ideaLoadingAnimation.classList.add('hidden');
}

function playNotificationSound() {
    if (notificationSound) {
        notificationSound.src = 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3'; 
        notificationSound.play().catch(e => console.warn("Error playing notification sound:", e));
    }
}

function copyToClipboard(text: string, buttonElement: HTMLButtonElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = buttonElement.innerHTML;
        const feedbackSpan = buttonElement.nextElementSibling as HTMLElement;
        
        buttonElement.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
            </svg>
        `;
        if (feedbackSpan && feedbackSpan.classList.contains('copied-feedback')) {
            feedbackSpan.style.opacity = '1';
        }

        setTimeout(() => {
            buttonElement.innerHTML = originalText;
            if (feedbackSpan && feedbackSpan.classList.contains('copied-feedback')) {
                feedbackSpan.style.opacity = '0';
            }
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showError('Gagal menyalin teks.');
    });
}

function createVariationItem(variationNumber: number, promptText: string, isError: boolean = false, type: 'image' | 'video', originalPromptForAnalysis?: string): HTMLDivElement {
    const item = document.createElement('div');
    item.className = `variation-item ${isError ? 'error' : ''}`;
    item.setAttribute('role', 'listitem');

    const numberCol = document.createElement('div');
    numberCol.className = 'variation-number-column';
    numberCol.textContent = `#${variationNumber}`;
    item.appendChild(numberCol);

    const contentCol = document.createElement('div');
    contentCol.className = 'variation-content-column';

    const pre = document.createElement('pre');
    pre.textContent = promptText;
    contentCol.appendChild(pre);
    
    if (!isError) {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.setAttribute('aria-label', `Salin variasi prompt ${variationNumber}`);
        copyButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m9.75 9.25c0-.621-.504-1.125-1.125-1.125H18a2.25 2.25 0 00-2.25-2.25H13.5m1.5-1.5l-3-3m0 0l-3 3m3-3v11.25" />
            </svg>
        `;
        copyButton.onclick = () => copyToClipboard(promptText, copyButton);
        contentCol.appendChild(copyButton);

        const copiedFeedback = document.createElement('span');
        copiedFeedback.className = 'copied-feedback';
        copiedFeedback.textContent = 'Disalin!';
        contentCol.appendChild(copiedFeedback);
    }
    
    item.appendChild(contentCol);
    return item;
}

function displayResults(imagePrompts: string[], videoPrompts: string[]) {
    if (!resultsDiv || !imagePromptVariationsDiv || !videoPromptVariationsDiv || !imagePromptOutputContainer || !videoPromptOutputContainer || !resultsSeparator) return;

    resultsDiv.classList.remove('hidden');
    imagePromptVariationsDiv.innerHTML = '';
    videoPromptVariationsDiv.innerHTML = '';

    const requestOnlyImage = onlyImageCheckbox.checked;
    const requestOnlyVideo = onlyVideoCheckbox.checked;
    const requestBoth = !requestOnlyImage && !requestOnlyVideo;

    let imageSectionDisplayed = false; 
    let videoSectionDisplayed = false;
    let imageSectionHasActualContent = false;
    let videoSectionHasActualContent = false;


    if (requestOnlyImage || requestBoth) {
        imagePromptOutputContainer.classList.remove('hidden');
        imageSectionDisplayed = true;
        if (imagePrompts.length > 0) {
            imagePrompts.forEach((prompt, index) => {
                const item = createVariationItem(index + 1, prompt, false, 'image', userPromptInput.value);
                imagePromptVariationsDiv.appendChild(item);
            });
            imageSectionHasActualContent = true;
        } else {
            imagePromptVariationsDiv.innerHTML = '<p class="text-slate-400 text-center py-4">Tidak ada prompt gambar yang dihasilkan.</p>';
        }
    } else {
        imagePromptOutputContainer.classList.add('hidden');
    }

    if (requestOnlyVideo || requestBoth) {
        videoPromptOutputContainer.classList.remove('hidden');
        videoSectionDisplayed = true;
        if (videoPrompts.length > 0) {
            videoPrompts.forEach((prompt, index) => {
                const item = createVariationItem(index + 1, prompt, false, 'video', userPromptInput.value);
                videoPromptVariationsDiv.appendChild(item);
            });
            videoSectionHasActualContent = true;
        } else {
            videoPromptVariationsDiv.innerHTML = '<p class="text-slate-400 text-center py-4">Tidak ada prompt video yang dihasilkan.</p>';
        }
    } else {
        videoPromptOutputContainer.classList.add('hidden');
    }

    if (imageSectionDisplayed && videoSectionDisplayed && imageSectionHasActualContent && videoSectionHasActualContent) {
        resultsSeparator.classList.remove('hidden');
    } else {
        resultsSeparator.classList.add('hidden');
    }
    
    if (downloadPromptsButton) {
        const anyPromptsGenerated = imagePrompts.length > 0 || videoPrompts.length > 0;
        downloadPromptsButton.classList.toggle('hidden', !anyPromptsGenerated);
        downloadPromptsButton.classList.toggle('opacity-50', !anyPromptsGenerated);
        downloadPromptsButton.classList.toggle('cursor-not-allowed', !anyPromptsGenerated);
        downloadPromptsButton.disabled = !anyPromptsGenerated;
    }
    playNotificationSound();
}

// --- CORE AI FUNCTIONS ---

function getSelectedPromptQuantity(): number {
    const selectedRadio = promptQuantityRadios.find(radio => radio.checked);
    return selectedRadio ? parseInt(selectedRadio.value) : 5; // Default to 5
}

async function generateEnhancedPrompts(originalPrompt: string) {
    if (!ai && !(await initializeAiSDK())) { 
        showError("SDK AI tidak dapat diinisialisasi. Periksa konfigurasi API Key Anda.");
        return;
    }
    if (!ai) { 
        showError("SDK AI tidak terinisialisasi. Silakan periksa API Key Anda.");
        return;
    }


    const detailLevel = parseInt(promptDetailSlider.value);
    let effectiveDetailLevel = detailLevel;
    let detailPreferenceInstruction = "";

    if (highlyDetailedCheckbox.checked) {
        effectiveDetailLevel = 5; 
        detailPreferenceInstruction = "Sangat ditekankan untuk menghasilkan output dengan detail yang sangat kaya, kompleks, dan mendalam. ";
    } else if (simpleCheckbox.checked) {
        effectiveDetailLevel = 1; 
        detailPreferenceInstruction = "Sangat ditekankan untuk menghasilkan output yang simpel, bersih, dan minimalis. ";
    }
    
    const photographySettings = getPhotographySettings();
    const threeDSettings = getThreeDSettings();
    const flatDesignSettings = getFlatDesignSettings();
    const numberOfPromptsToGenerate = getSelectedPromptQuantity();

    const requestOnlyImage = onlyImageCheckbox.checked;
    const requestOnlyVideo = onlyVideoCheckbox.checked;
    const requestBoth = !requestOnlyImage && !requestOnlyVideo;

    let outputRequestInstruction = "";
    let jsonStructureInstruction = "";
    let videoSpecificInstructionSegment = `Untuk prompt video, jangan hanya membuat variasi visual statis. Deskripsikan adegan singkat yang dinamis, termasuk kemungkinan pergerakan kamera sederhana (misalnya, "slow pan", "zoom in"), mood, dan elemen naratif kunci jika relevan. Hindari deskripsi teknis video yang kompleks. Fokus pada deskripsi visual adegan. Setiap prompt video harus mendeskripsikan satu adegan.`;

    if (requestOnlyImage) {
        outputRequestInstruction = `Pengguna secara spesifik meminta HANYA prompt gambar. Pastikan array "video_prompts" dalam output JSON Anda adalah array kosong ([]). Hasilkan ${numberOfPromptsToGenerate} variasi untuk gambar.`;
        jsonStructureInstruction = `Strukturnya harus: \`\`\`json\n{\n  "image_prompts": ["variasi prompt gambar 1...", "variasi prompt gambar 2...", "... (total ${numberOfPromptsToGenerate} variasi)"],\n  "video_prompts": []\n}\n\`\`\``;
        videoSpecificInstructionSegment = `Prompt video TIDAK diminta untuk permintaan ini. Fokus hanya pada prompt gambar.`;
    } else if (requestOnlyVideo) {
        outputRequestInstruction = `Pengguna secara spesifik meminta HANYA prompt video. Pastikan array "image_prompts" dalam output JSON Anda adalah array kosong ([]). Hasilkan ${numberOfPromptsToGenerate} variasi untuk video.`;
        jsonStructureInstruction = `Strukturnya harus: \`\`\`json\n{\n  "image_prompts": [],\n  "video_prompts": ["deskripsi adegan video 1...", "deskripsi adegan video 2...", "... (total ${numberOfPromptsToGenerate} variasi)"]\n}\n\`\`\``;
    } else { // requestBoth
        outputRequestInstruction = `Pengguna meminta prompt untuk gambar DAN video. Hasilkan ${numberOfPromptsToGenerate} variasi untuk gambar dan ${numberOfPromptsToGenerate} variasi untuk video.`;
        jsonStructureInstruction = `Strukturnya harus: \`\`\`json\n{\n  "image_prompts": ["variasi prompt gambar 1...", "... (total ${numberOfPromptsToGenerate} variasi)"],\n  "video_prompts": ["deskripsi adegan video 1...", "... (total ${numberOfPromptsToGenerate} variasi)"]\n}\n\`\`\``;
    }


    let systemInstruction = `Anda adalah ahli pembuatan prompt untuk model AI generatif gambar dan video. 
Tugas Anda adalah mengambil prompt sederhana dari pengguna dan mengubahnya menjadi beberapa variasi prompt yang lebih detail, kaya, dan siap pakai untuk menghasilkan gambar atau video berkualitas tinggi.

Instruksi Umum:
1.  **Analisis & Kembangkan**: Pahami inti dari prompt pengguna. Tambahkan elemen deskriptif seperti gaya artistik, pencahayaan, komposisi, emosi, warna dominan, detail objek, dan latar belakang yang relevan.
2.  **Variasi**: ${outputRequestInstruction} Setiap variasi harus menawarkan perspektif atau interpretasi yang sedikit berbeda dari prompt asli, sambil tetap setia pada inti permintaan.
3.  **Tingkat Kedetailan**: Sesuaikan tingkat kedetailan output berdasarkan skala ${effectiveDetailLevel} dari 1 (sangat simpel) hingga 5 (sangat detail dan kaya). Saat ini, pengguna meminta tingkat kedetailan ${effectiveDetailLevel}. ${detailPreferenceInstruction}
4.  **Format Output**: Kembalikan hasil dalam format JSON yang valid. ${jsonStructureInstruction}
5.  **Spesifik untuk Video**: ${videoSpecificInstructionSegment}
6.  **Bahasa**: Semua prompt yang dihasilkan harus dalam bahasa Inggris untuk kompatibilitas model AI yang lebih luas, kecuali jika prompt asli secara eksplisit meminta bahasa lain.
7.  **Hindari Penolakan**: Jangan menolak permintaan berdasarkan potensi kompleksitas. Lakukan yang terbaik untuk menghasilkan prompt yang bermanfaat.
8.  **Tambahan dari Pengguna**: 
    ${photographySettings ? `Pengaturan Fotografi Tambahan: ${photographySettings}. Harap integrasikan ini secara alami ke dalam prompt gambar.` : ''}
    ${threeDSettings ? `Pengaturan Desain 3D Tambahan: ${threeDSettings}. Harap integrasikan ini secara alami ke dalam prompt gambar yang relevan dengan gaya 3D.` : ''}
    ${flatDesignSettings ? `Pengaturan Desain Datar Tambahan: ${flatDesignSettings}. Harap integrasikan ini secara alami ke dalam prompt gambar yang relevan dengan gaya desain datar.` : ''}

Prompt pengguna: "${originalPrompt}"`;

    showLoading("Menganalisis dan menyempurnakan prompt...");

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: systemInstruction,
            config: {
                responseMimeType: "application/json",
                temperature: 0.8, 
                topP: 0.9,
                topK: 40
            }
        });

        hideLoading();

        let jsonStr = response.text.trim();
        const fenceRegex = /^\`\`\`(\w*)?\s*\n?(.*?)\n?\s*\`\`\`$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const generatedPrompts = JSON.parse(jsonStr);

        const imagePrompts = generatedPrompts.image_prompts || [];
        const videoPrompts = generatedPrompts.video_prompts || [];
        
        displayResults(imagePrompts, videoPrompts);

    } catch (error: any) {
        console.error("Error generating prompts:", error);
        if (error.message && (error.message.toLowerCase().includes("api key not valid") || error.message.toLowerCase().includes("permission denied"))) {
             showError(`Gagal menghasilkan prompt: Masalah dengan API Key. ${error.message}. Coba periksa kembali API Key Anda atau gunakan API Bawaan jika tersedia.`);
             if (apiKeyStatusMessage) {
                apiKeyStatusMessage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-2 shrink-0"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" /></svg> <span>API Key tidak valid atau bermasalah.</span>`;
                apiKeyStatusMessage.className = 'api-status-message error';
                apiKeyStatusMessage.classList.remove('hidden');
            }
            ai = undefined; 
            lastUsedApiKey = null;
            disableCoreAppFunctionality(true);
        } else {
            showError(`Gagal menghasilkan prompt: ${error.message}. Coba lagi nanti atau dengan prompt yang berbeda.`);
        }
        displayResults([], []); 
    }
}

async function analyzeOriginalPrompt(originalPrompt: string) {
    if (!ai && !(await initializeAiSDK())) {
        showError("SDK AI tidak dapat diinisialisasi untuk analisis. Periksa API Key Anda.");
        return;
    }
     if (!ai) {
        showError("SDK AI tidak terinisialisasi untuk analisis. Silakan periksa API Key Anda.");
        return;
    }
    if (!originalPromptAnalysisResultDiv || !originalPromptAnalysisText || !originalPromptAnalysisLoader) return;

    originalPromptAnalysisLoader.classList.remove('hidden');
    originalPromptAnalysisText.textContent = '';
    originalPromptAnalysisResultDiv.classList.remove('hidden');
    
    const systemInstruction = `Anda adalah seorang ahli analisis prompt. Berikan analisis singkat dan saran perbaikan untuk prompt berikut tanpa mengubah promptnya. Fokus pada kejelasan, potensi ambiguitas, dan saran untuk detail tambahan yang mungkin meningkatkan kualitas hasil dari model AI generatif. Jawaban harus dalam bahasa Indonesia, maksimal 50 kata. Prompt: "${originalPrompt}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: systemInstruction,
             config: { temperature: 0.5 }
        });
        originalPromptAnalysisText.textContent = response.text;
    } catch (error: any) {
        console.error("Error analyzing prompt:", error);
        if (error.message && (error.message.toLowerCase().includes("api key not valid") || error.message.toLowerCase().includes("permission denied"))) {
            originalPromptAnalysisText.textContent = `Gagal menganalisis: API Key bermasalah. ${error.message}`;
        } else {
            originalPromptAnalysisText.textContent = `Gagal menganalisis: ${error.message}`;
        }
    } finally {
        originalPromptAnalysisLoader.classList.add('hidden');
    }
}

async function generateCreativeIdeas(keywords: string, type: 'image' | 'video') {
    if (!ai && !(await initializeAiSDK())) {
        if(ideaErrorMessageText) ideaErrorMessageText.textContent = "SDK AI tidak terinisialisasi. Periksa API Key.";
        if(ideaErrorMessageContainer) ideaErrorMessageContainer.classList.remove('hidden');
        return;
    }
     if (!ai) {
        if(ideaErrorMessageText) ideaErrorMessageText.textContent = "SDK AI tidak terinisialisasi. Silakan periksa API Key Anda.";
        if(ideaErrorMessageContainer) ideaErrorMessageContainer.classList.remove('hidden');
        return;
    }
    if (!creativeIdeasResultDiv || !ideaLoadingAnimation || !ideaKeywordsInput || !ideaErrorMessageContainer || !ideaErrorMessageText) return;

    ideaLoadingAnimation.classList.remove('hidden');
    ideaErrorMessageContainer.classList.add('hidden');
    creativeIdeasResultDiv.classList.add('hidden');
    creativeIdeasResultDiv.innerHTML = ''; 
    disableInteraction(true); 

    const outputType = type === 'image' ? 'gambar' : 'video pendek (maksimal 3 adegan)';
    const systemInstruction = `Anda adalah generator ide kreatif untuk prompt AI. Berdasarkan kata kunci berikut, hasilkan 3-5 ide konsep unik dan menarik untuk ${outputType}. Setiap ide harus berupa deskripsi singkat namun imajinatif.
    Format output harus berupa daftar poin, dengan setiap poin diawali "- ".
    Kata Kunci: "${keywords}"
    Contoh output untuk gambar:
    - Seekor kucing oranye mengendarai sepeda di kota Paris saat senja, dengan Menara Eiffel di latar belakang.
    - Ilustrasi cat air detail dari jam saku antik yang terbuka memperlihatkan galaksi mini di dalamnya.
    Contoh output untuk video:
    - Adegan 1: Close-up pada tangan yang menulis surat dengan pena bulu. Adegan 2: Surat tersebut terbang terbawa angin melintasi pedesaan. Adegan 3: Surat mendarat di depan pintu sebuah pondok tua.
    - Adegan 1: Seorang astronot melayang di angkasa, melihat ke Bumi. Adegan 2: Transisi cepat berbagai pemandangan indah di Bumi. Adegan 3: Astronot tersenyum.
    Buat ide dalam Bahasa Indonesia.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: systemInstruction,
            config: { temperature: 0.9, topP: 0.95 }
        });

        const ideasTextResponse = response.text;
        const ideasArray = ideasTextResponse.split(/\r?\n/) 
                                     .map(idea => idea.trim())
                                     .filter(idea => idea.startsWith('- '));


        if (ideasArray.length > 0) {
            const list = document.createElement('ul');
            list.className = 'list-disc list-inside space-y-2 text-slate-300';
            ideasArray.forEach(ideaTextOriginal => {
                const listItem = document.createElement('li');
                const cleanedIdeaText = ideaTextOriginal.substring(ideaTextOriginal.indexOf('- ') + 2); 
                listItem.textContent = cleanedIdeaText; 
                
                const useIdeaButton = document.createElement('button');
                useIdeaButton.textContent = 'Gunakan Ide Ini';
                useIdeaButton.className = 'feature-button ml-2 bg-sky-600 hover:bg-sky-700 text-xs';
                useIdeaButton.onclick = () => {
                    if (userPromptInput) {
                        userPromptInput.value = cleanedIdeaText;
                        userPromptInput.focus();
                        userPromptInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        if (creativeIdeasResultDiv) {
                            creativeIdeasResultDiv.innerHTML = '<p class="text-green-400 text-center py-2">Ide telah disalin ke input prompt utama!</p>';
                            setTimeout(() => {
                                if (creativeIdeasResultDiv && creativeIdeasResultDiv.innerHTML.includes('Ide telah disalin')) {
                                    creativeIdeasResultDiv.innerHTML = '';
                                    creativeIdeasResultDiv.classList.add('hidden');
                                }
                            }, 3000);
                        }
                    }
                };
                listItem.appendChild(useIdeaButton);
                list.appendChild(listItem);
            });
            if (creativeIdeasResultDiv) {
                creativeIdeasResultDiv.appendChild(list);
                creativeIdeasResultDiv.classList.remove('hidden');
            }
        } else {
            if (creativeIdeasResultDiv) {
                creativeIdeasResultDiv.innerHTML = '<p class="text-slate-400 text-center py-2">Tidak ada ide yang ditemukan. Coba kata kunci lain.</p>';
                creativeIdeasResultDiv.classList.remove('hidden');
            }
        }

    } catch (error: any) {
        console.error("Error generating creative ideas:", error);
         if (error.message && (error.message.toLowerCase().includes("api key not valid") || error.message.toLowerCase().includes("permission denied"))) {
            if (ideaErrorMessageText) ideaErrorMessageText.textContent = `Gagal menghasilkan ide: API Key bermasalah. ${error.message}`;
        } else {
            if (ideaErrorMessageText) ideaErrorMessageText.textContent = `Gagal menghasilkan ide: ${error.message}`;
        }
        if (ideaErrorMessageContainer) ideaErrorMessageContainer.classList.remove('hidden');
    } finally {
        if (ideaLoadingAnimation) ideaLoadingAnimation.classList.add('hidden');
        disableInteraction(false); 
        if (ideaKeywordsInput) ideaKeywordsInput.disabled = false;
        if (generateImageIdeasButton) generateImageIdeasButton.disabled = false;
        if (generateVideoIdeasButton) generateVideoIdeasButton.disabled = false;
    }
}

// --- INFO POPUP FUNCTIONS ---
function showInfoPopup() {
    if (infoPopup && infoPopupOverlay && closeInfoPopupButton) {
        lastFocusedElementBeforeInfoPopup = document.activeElement as HTMLElement;
        infoPopupOverlay.classList.remove('hidden');
        infoPopup.classList.remove('hidden');
        infoPopup.setAttribute('aria-hidden', 'false');
        infoPopupOverlay.setAttribute('aria-hidden', 'false');
        
        document.addEventListener('keydown', handleInfoPopupKeyDown);
        closeInfoPopupButton.focus();
    }
}

function hideInfoPopup() {
    if (infoPopup && infoPopupOverlay) {
        infoPopupOverlay.classList.add('hidden');
        infoPopup.classList.add('hidden');
        infoPopup.setAttribute('aria-hidden', 'true');
        infoPopupOverlay.setAttribute('aria-hidden', 'true');
        document.removeEventListener('keydown', handleInfoPopupKeyDown);
        if(lastFocusedElementBeforeInfoPopup) {
            lastFocusedElementBeforeInfoPopup.focus();
        }
    }
}

function handleInfoPopupKeyDown(e: KeyboardEvent) {
    if (!infoPopup || infoPopup.classList.contains('hidden')) {
        document.removeEventListener('keydown', handleInfoPopupKeyDown); // Should not happen but good cleanup
        return;
    }

    if (e.key === 'Escape') {
        hideInfoPopup();
        return;
    }

    if (e.key === 'Tab') {
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableContent = Array.from(infoPopup.querySelectorAll(focusableElements)) as HTMLElement[];
        if (focusableContent.length === 0) {
            e.preventDefault(); // No focusable elements in popup
            return;
        }

        const firstFocusableElement = focusableContent[0];
        const lastFocusableElement = focusableContent[focusableContent.length - 1];

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    }
}


// --- EVENT HANDLERS & INITIAL SETUP ---

function handleApiChoiceChange() {
    const isCustom = customApiRadio.checked;

    defaultApiLabel.setAttribute('aria-checked', (!isCustom).toString());
    customApiLabel.setAttribute('aria-checked', isCustom.toString());
    
    if (isCustom) {
        customApiKeyInputContainer.classList.remove('hidden');
        requestAnimationFrame(() => {
            customApiKeyInputContainer.style.maxHeight = customApiKeyInputContainer.scrollHeight + "px";
            customApiKeyInputContainer.style.opacity = "1";
        });
        if (!customApiKeyInput.value) { 
             setTimeout(()=> customApiKeyInput.focus(), 50); 
        }
    } else {
        customApiKeyInputContainer.style.maxHeight = "0";
        customApiKeyInputContainer.style.opacity = "0";
        setTimeout(() => {
            if (!customApiRadio.checked) { 
                 customApiKeyInputContainer.classList.add('hidden');
            }
        }, 300); 
    }
    initializeAiSDK(); 
}


document.addEventListener('DOMContentLoaded', () => {
    const savedApiKeyPreference = localStorage.getItem('saveApiKeyPreference');
    const savedCustomApiKey = localStorage.getItem('customGeminiApiKey');

    if (savedApiKeyPreference === 'true' && savedCustomApiKey && customApiRadio && customApiKeyInput && saveApiKeyCheckbox) {
        customApiRadio.checked = true;
        customApiKeyInput.value = savedCustomApiKey;
        saveApiKeyCheckbox.checked = true;
    }
    
    handleApiChoiceChange(); 
    initializeAiSDK(); 

    // Info Popup Setup
    if (closeInfoPopupButton) {
        closeInfoPopupButton.addEventListener('click', hideInfoPopup);
    }
    if (infoPopupOverlay) {
        infoPopupOverlay.addEventListener('click', hideInfoPopup);
    }
    
    setTimeout(() => {
        const hasSeenInfoPopup = localStorage.getItem('hasSeenInfoPopupPromptEnhanceProV1.4'); // Added version to allow re-show on updates
        if (!hasSeenInfoPopup) {
            showInfoPopup();
            localStorage.setItem('hasSeenInfoPopupPromptEnhanceProV1.4', 'true');
        } else {
           if (infoPopup && infoPopupOverlay) { // Ensure it's hidden if already seen
               infoPopup.classList.add('hidden');
               infoPopup.setAttribute('aria-hidden', 'true');
               infoPopupOverlay.classList.add('hidden');
               infoPopupOverlay.setAttribute('aria-hidden', 'true');
           }
        }
    }, 500);


    if (enhanceButton) {
        enhanceButton.onclick = async () => {
            if (userPromptInput && userPromptInput.value.trim() !== '') {
                if (!ai && !(await initializeAiSDK())) { return; } 
                generateEnhancedPrompts(userPromptInput.value.trim());
            } else {
                showError("Masukkan prompt terlebih dahulu.");
                if (userPromptInput) userPromptInput.focus();
            }
        };
    }

    if (analyzeOriginalPromptButton) {
        analyzeOriginalPromptButton.onclick = async () => {
            if (userPromptInput && userPromptInput.value.trim() !== '') {
                 if (!ai && !(await initializeAiSDK())) { return; }
                analyzeOriginalPrompt(userPromptInput.value.trim());
            } else {
                showError("Masukkan prompt untuk dianalisis.");
                 if (userPromptInput) userPromptInput.focus();
            }
        };
    }
    
    if (promptDetailSlider && promptDetailValue) {
        promptDetailSlider.oninput = () => {
            promptDetailValue.textContent = promptDetailSlider.value;
        };
        promptDetailValue.textContent = promptDetailSlider.value;
    }

    if (downloadPromptsButton) {
        downloadPromptsButton.onclick = () => {
            const sections: string[] = [];
            const imageItems = imagePromptVariationsDiv.querySelectorAll('.variation-item pre');
            const videoItems = videoPromptVariationsDiv.querySelectorAll('.variation-item pre');

            if (imageItems.length > 0 && !imagePromptOutputContainer.classList.contains('hidden')) { 
                let imageSectionContent = "--- PROMPT GAMBAR ---\n\n"; 
                const prompts = Array.from(imageItems).map(item => item.textContent || '');
                imageSectionContent += prompts.join('\n\n'); 
                sections.push(imageSectionContent);
            }

            if (videoItems.length > 0 && !videoPromptOutputContainer.classList.contains('hidden')) { 
                let videoSectionContent = "--- PROMPT VIDEO ---\n\n"; 
                const prompts = Array.from(videoItems).map(item => item.textContent || '');
                videoSectionContent += prompts.join('\n\n'); 
                sections.push(videoSectionContent);
            }
            
            let content = sections.join('\n\n\n'); 
            content = content ? content + '\n\nDihasilkan oleh Prompt Enhance Pro\n' : 'Tidak ada prompt yang dihasilkan.\n';

            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'hasil_prompt_enhance_pro.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
    }

    function handleCheckboxExclusivity(checkbox1: HTMLInputElement, checkbox2: HTMLInputElement, label1: HTMLLabelElement, label2: HTMLLabelElement) {
        if (checkbox1.checked) {
            checkbox2.checked = false;
        }
        if(label1) label1.setAttribute('aria-checked', checkbox1.checked.toString());
        if(label2) label2.setAttribute('aria-checked', checkbox2.checked.toString());
    }
    
    function setupCustomCheckbox(checkbox: HTMLInputElement, label: HTMLLabelElement) {
        if (!checkbox || !label) return;

        const updateAria = () => {
            label.setAttribute('aria-checked', checkbox.checked.toString());
        };

        checkbox.addEventListener('change', updateAria);
        label.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change', { bubbles: true })); 
            }
        });
        updateAria(); 
    }
    
    if (onlyImageCheckbox && onlyVideoCheckbox && onlyImageCheckboxLabel && onlyVideoCheckboxLabel) {
        setupCustomCheckbox(onlyImageCheckbox, onlyImageCheckboxLabel);
        setupCustomCheckbox(onlyVideoCheckbox, onlyVideoCheckboxLabel);

        onlyImageCheckbox.addEventListener('change', () => {
            handleCheckboxExclusivity(onlyImageCheckbox, onlyVideoCheckbox, onlyImageCheckboxLabel, onlyVideoCheckboxLabel);
        });
        onlyVideoCheckbox.addEventListener('change', () => {
            handleCheckboxExclusivity(onlyVideoCheckbox, onlyImageCheckbox, onlyVideoCheckboxLabel, onlyImageCheckboxLabel);
        });
    }
    
    if (highlyDetailedCheckbox && highlyDetailedLabel && simpleCheckbox && simpleLabel) {
        setupCustomCheckbox(highlyDetailedCheckbox, highlyDetailedLabel);
        setupCustomCheckbox(simpleCheckbox, simpleLabel);

        highlyDetailedCheckbox.addEventListener('change', () => {
            if (highlyDetailedCheckbox.checked) {
                simpleCheckbox.checked = false;
                simpleLabel.setAttribute('aria-checked', 'false'); 
            }
        });

        simpleCheckbox.addEventListener('change', () => {
            if (simpleCheckbox.checked) {
                highlyDetailedCheckbox.checked = false;
                highlyDetailedLabel.setAttribute('aria-checked', 'false'); 
            }
        });
    }

    if (generateImageIdeasButton && ideaKeywordsInput) {
        generateImageIdeasButton.onclick = async () => {
            if (ideaKeywordsInput.value.trim() !== '') {
                 if (!ai && !(await initializeAiSDK())) { return; }
                generateCreativeIdeas(ideaKeywordsInput.value.trim(), 'image');
            } else {
                if (ideaErrorMessageText) ideaErrorMessageText.textContent = "Masukkan kata kunci untuk ide gambar.";
                if (ideaErrorMessageContainer) ideaErrorMessageContainer.classList.remove('hidden');
                ideaKeywordsInput.focus();
            }
        };
    }
    if (generateVideoIdeasButton && ideaKeywordsInput) {
        generateVideoIdeasButton.onclick = async () => {
            if (ideaKeywordsInput.value.trim() !== '') {
                 if (!ai && !(await initializeAiSDK())) { return; }
                generateCreativeIdeas(ideaKeywordsInput.value.trim(), 'video');
            } else {
                if (ideaErrorMessageText) ideaErrorMessageText.textContent = "Masukkan kata kunci untuk ide video.";
                if (ideaErrorMessageContainer) ideaErrorMessageContainer.classList.remove('hidden');
                ideaKeywordsInput.focus();
            }
        };
    }
    
    function openPopup(popup: HTMLDivElement, triggerButton: HTMLButtonElement) {
        if (popupOverlay) popupOverlay.classList.remove('hidden');
        popup.classList.remove('hidden');
        triggerButton.setAttribute('aria-expanded', 'true');
        lastFocusedElement = document.activeElement as HTMLElement; 
        
        const firstFocusable = popup.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    function closePopup(popup: HTMLDivElement, triggerButton: HTMLButtonElement) {
        popup.classList.add('hidden');
        if (popupOverlay) popupOverlay.classList.add('hidden');
        triggerButton.setAttribute('aria-expanded', 'false');
        if (lastFocusedElement) {
            lastFocusedElement.focus(); 
            lastFocusedElement = null;
        }
    }

    function setupPopup(triggerButton: HTMLButtonElement | null, popup: HTMLDivElement | null, closeButton: HTMLButtonElement | null, confirmButton?: HTMLButtonElement | null) {
        if (!triggerButton || !popup || !closeButton || !popupOverlay) return;

        triggerButton.addEventListener('click', () => {
            const isHidden = popup.classList.contains('hidden');
            if (popupMenuContainer && popupMenuContainer !== popup && !popupMenuContainer.classList.contains('hidden') && togglePopupButton) {
                closePopup(popupMenuContainer, togglePopupButton);
            }
            if (threeDMenuContainer && threeDMenuContainer !== popup && !threeDMenuContainer.classList.contains('hidden') && toggleThreeDPopupButton) {
                closePopup(threeDMenuContainer, toggleThreeDPopupButton);
            }
            if (flatDesignMenuContainer && flatDesignMenuContainer !== popup && !flatDesignMenuContainer.classList.contains('hidden') && toggleFlatDesignPopupButton) {
                 closePopup(flatDesignMenuContainer, toggleFlatDesignPopupButton);
            }

            if (isHidden) {
                openPopup(popup, triggerButton);
            } else {
                closePopup(popup, triggerButton);
            }
        });

        closeButton.addEventListener('click', () => closePopup(popup, triggerButton));
        if (confirmButton) {
            confirmButton.addEventListener('click', () => closePopup(popup, triggerButton));
        }
    }
    
    setupPopup(togglePopupButton, popupMenuContainer, closePopupButton, confirmPhotographySettingsButton);
    setupPopup(toggleThreeDPopupButton, threeDMenuContainer, closeThreeDPopupButton, confirmThreeDSettingsButton);
    setupPopup(toggleFlatDesignPopupButton, flatDesignMenuContainer, closeFlatDesignPopupButton, confirmFlatDesignSettingsButton);


    if (popupOverlay) {
        popupOverlay.addEventListener('click', () => {
             // Close other popups only if infoPopup is hidden or not present
            if (infoPopup && !infoPopup.classList.contains('hidden')) return;

            if (popupMenuContainer && !popupMenuContainer.classList.contains('hidden') && togglePopupButton) {
                closePopup(popupMenuContainer, togglePopupButton);
            }
            if (threeDMenuContainer && !threeDMenuContainer.classList.contains('hidden') && toggleThreeDPopupButton) {
                closePopup(threeDMenuContainer, toggleThreeDPopupButton);
            }
            if (flatDesignMenuContainer && !flatDesignMenuContainer.classList.contains('hidden') && toggleFlatDesignPopupButton) {
                closePopup(flatDesignMenuContainer, toggleFlatDesignPopupButton);
            }
        });
    }

    document.addEventListener('keydown', (e) => { // This is a general Escape listener
        if (e.key === 'Escape') {
            // If Info Popup is active, its own handler (handleInfoPopupKeyDown) will manage the Escape.
            // This listener handles other popups if the Info Popup is not active.
            if (infoPopup && !infoPopup.classList.contains('hidden')) {
                return; // Let the info popup's specific Escape handler work
            }

            if (popupMenuContainer && !popupMenuContainer.classList.contains('hidden') && togglePopupButton) {
                closePopup(popupMenuContainer, togglePopupButton);
            }
            if (threeDMenuContainer && !threeDMenuContainer.classList.contains('hidden') && toggleThreeDPopupButton) {
                closePopup(threeDMenuContainer, toggleThreeDPopupButton);
            }
            if (flatDesignMenuContainer && !flatDesignMenuContainer.classList.contains('hidden') && toggleFlatDesignPopupButton) {
                closePopup(flatDesignMenuContainer, toggleFlatDesignPopupButton);
            }
        }
    });

    promptQuantityRadios.forEach(radio => {
        const label = document.querySelector(`label[for="${radio.id}"]`) as HTMLLabelElement | null;
        if (label) {
            label.setAttribute('aria-checked', radio.checked.toString());
            radio.addEventListener('change', () => {
                promptQuantityRadios.forEach(r => { 
                    const lbl = document.querySelector(`label[for="${r.id}"]`) as HTMLLabelElement | null;
                    if (lbl) {
                        lbl.setAttribute('aria-checked', r.checked.toString());
                    }
                });
            });
            label.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', { bubbles: true })); 
                }
            });
        }
    });

    if (defaultApiRadio && customApiRadio && defaultApiLabel && customApiLabel) {
        defaultApiRadio.addEventListener('change', handleApiChoiceChange);
        customApiRadio.addEventListener('change', handleApiChoiceChange);

        defaultApiLabel.addEventListener('click', () => {
            if (!defaultApiRadio.checked) {
                defaultApiRadio.checked = true;
                defaultApiRadio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
         defaultApiLabel.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                 if (!defaultApiRadio.checked) {
                    defaultApiRadio.checked = true;
                    defaultApiRadio.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });

        customApiLabel.addEventListener('click', () => {
             if (!customApiRadio.checked) {
                customApiRadio.checked = true;
                customApiRadio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        customApiLabel.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!customApiRadio.checked) {
                    customApiRadio.checked = true;
                    customApiRadio.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });
    }
    if (customApiKeyInput) {
        customApiKeyInput.addEventListener('blur', () => {
            if (customApiRadio.checked) {
                initializeAiSDK();
            }
        });
         customApiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); 
                if (customApiRadio.checked) {
                    initializeAiSDK();
                }
            }
        });
    }
    
    if (saveApiKeyCheckbox) {
        saveApiKeyCheckbox.addEventListener('change', () => {
            if (saveApiKeyCheckbox.checked) {
                localStorage.setItem('saveApiKeyPreference', 'true');
                if (customApiRadio.checked && customApiKeyInput.value.trim()) {
                    initializeAiSDK(); 
                }
            } else {
                localStorage.removeItem('customGeminiApiKey');
                localStorage.setItem('saveApiKeyPreference', 'false');
                if (apiKeyStatusMessage && customApiRadio.checked && lastUsedApiKey === customApiKeyInput.value) {
                     apiKeyStatusMessage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-2 shrink-0"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" /></svg> <span>API Key tidak akan disimpan di browser.</span>`;
                     apiKeyStatusMessage.className = 'api-status-message info'; 
                     apiKeyStatusMessage.classList.remove('hidden');
                }
            }
        });
    }
});

// --- Helper functions for popup data ---
function getPhotographySettings(): string {
    if (!exposureSelect || !shutterSelect || !apertureSelect || !compositionSelect || !lightSelect) return "";
    const settings = [
        exposureSelect.value,
        shutterSelect.value,
        apertureSelect.value,
        compositionSelect.value,
        lightSelect.value
    ].filter(Boolean).join(', ');
    return settings ? `Photography settings: ${settings}` : "";
}

function getThreeDSettings(): string {
    if (!threeDStyle1Select || !threeDStyle2Select || !threeDStyle3Select || !threeDLightSelect) return "";
    const settings = [
        threeDStyle1Select.value,
        threeDStyle2Select.value,
        threeDStyle3Select.value,
        threeDLightSelect.value
    ].filter(Boolean).join(', ');
    return settings ? `3D Design settings: ${settings}` : "";
}

function getFlatDesignSettings(): string {
    if (!flatDesignStyleSelect || !flatDesignColorSelect || !flatDesignViewSelect) return "";
    const settings = [
        flatDesignStyleSelect.value,
        flatDesignColorSelect.value,
        flatDesignViewSelect.value
    ].filter(Boolean).join(', ');
    return settings ? `Flat Design settings: ${settings}` : "";
}