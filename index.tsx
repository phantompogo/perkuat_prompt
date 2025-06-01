
import { GoogleGenAI } from "@google/genai";

// --- Global DOM Element References ---
// These are safe at the top level because the script is a module and loaded at the end of the body,
// so elements will exist when the script runs. Functions inside DOMContentLoaded will use these.
const userPromptInput = document.getElementById('userPrompt') as HTMLInputElement;
const imageQualitySelect = document.getElementById('imageQualitySelect') as HTMLSelectElement;
const imageDetailSelect = document.getElementById('imageDetailSelect') as HTMLSelectElement;
const imageLightingSelect = document.getElementById('imageLightingSelect') as HTMLSelectElement;
const imageCompositionSelect = document.getElementById('imageCompositionSelect') as HTMLSelectElement;
const imageStyleSelect = document.getElementById('imageStyleSelect') as HTMLSelectElement;
const imageNegativeStyleSelect = document.getElementById('imageNegativeStyleSelect') as HTMLSelectElement;
const videoShotTypeSelect = document.getElementById('videoShotTypeSelect') as HTMLSelectElement;
const videoCameraMovementSelect = document.getElementById('videoCameraMovementSelect') as HTMLSelectElement;
const enhanceButton = document.getElementById('enhanceButton') as HTMLButtonElement;
const loadingAnimation = document.getElementById('loadingAnimation');
const loadingText = document.getElementById('loadingText');
const resultsDiv = document.getElementById('results');
const imagePromptOutputContainer = document.getElementById('imagePromptOutputContainer');
const videoPromptOutputContainer = document.getElementById('videoPromptOutputContainer');
const errorMessageDiv = document.getElementById('errorMessage');
const errorMessageText = document.getElementById('errorMessageText');
const analyzeOriginalPromptButton = document.getElementById('analyzeOriginalPromptButton') as HTMLButtonElement;
const originalPromptAnalysisResultDiv = document.getElementById('originalPromptAnalysisResult');
const originalPromptAnalysisText = document.getElementById('originalPromptAnalysisText');
const originalPromptAnalysisLoader = document.getElementById('originalPromptAnalysisLoader');
const downloadAllPromptsButton = document.getElementById('downloadAllPromptsButton') as HTMLButtonElement;

// --- AI SDK INITIALIZATION ---
let ai: GoogleGenAI | undefined;

function initializeAiSDK() {
    if (!ai) {
        const apiKey = process.env.API_KEY; // Strictly use process.env.API_KEY
        if (!apiKey) {
            console.error("API_KEY environment variable is not set. The application will not function correctly.");
            if (errorMessageText) errorMessageText.textContent = "Kesalahan Konfigurasi: API Key tidak ditemukan. Aplikasi tidak dapat berfungsi.";
            if (errorMessageDiv) errorMessageDiv.classList.remove('hidden');
            // Disable buttons if API key is missing
            if (enhanceButton) enhanceButton.disabled = true;
            if (analyzeOriginalPromptButton) analyzeOriginalPromptButton.disabled = true;
            return false;
        }
        try {
            ai = new GoogleGenAI({ apiKey });
        } catch (e: any) {
            console.error("Failed to initialize GoogleGenAI SDK:", e);
            if (errorMessageText) errorMessageText.textContent = `Kesalahan Inisialisasi SDK: ${e.message}. API Key mungkin tidak valid.`;
            if (errorMessageDiv) errorMessageDiv.classList.remove('hidden');
            if (enhanceButton) enhanceButton.disabled = true;
            if (analyzeOriginalPromptButton) analyzeOriginalPromptButton.disabled = true;
            return false;
        }
    }
    return true;
}

// --- Gemini API Call Function ---
async function generateGeminiResponse(instruction: string) {
    if (!ai) {
        if (!initializeAiSDK() || !ai) { // Attempt to initialize if not already
            console.error("AI SDK not initialized properly for generateGeminiResponse call.");
            throw new Error("AI SDK tidak terinisialisasi. API Key mungkin hilang atau salah.");
        }
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: instruction,
            config: { // Added generation configuration
                temperature: 0.9, // For more creative and diverse responses
                topP: 0.95,       // Nucleus sampling for quality and coherence
            }
        });

        const text = response.text;

        if (text === undefined || text === null || text.trim() === "") {
            console.warn("Gemini API returned empty or no text. Prompt:", instruction, "Response:", response);
            if (response?.candidates?.[0]?.finishReason === "SAFETY") {
                return `Respons diblokir oleh filter keamanan. Silakan ubah prompt Anda.`;
            }
            return "Tidak ada konten teks yang dihasilkan. Prompt mungkin perlu disesuaikan atau respons API kosong.";
        }
        return text;
    } catch (error: any) {
        console.error("Error calling Gemini API via SDK:", error);
        throw new Error(`Panggilan API gagal: ${error.message || 'Terjadi kesalahan tidak diketahui'}`);
    }
}

// --- Event Listeners and Logic ---
document.addEventListener('DOMContentLoaded', () => {
    if (!initializeAiSDK()) {
        // If SDK init failed (e.g. no API key), ensure buttons are disabled
        // and a general message is shown if not already set by initializeAiSDK.
        if (enhanceButton) enhanceButton.disabled = true;
        if (analyzeOriginalPromptButton) analyzeOriginalPromptButton.disabled = true;
        if (errorMessageDiv && errorMessageDiv.classList.contains('hidden')) {
             if (errorMessageText) errorMessageText.textContent = "Inisialisasi aplikasi gagal. Periksa konsol untuk detail."
             if (errorMessageDiv) errorMessageDiv.classList.remove('hidden');
        }
        return; // Stop further script execution if AI SDK can't be initialized
    }

    analyzeOriginalPromptButton.addEventListener('click', async () => {
        const simplePrompt = userPromptInput.value.trim();
        if (!simplePrompt) {
            if(originalPromptAnalysisResultDiv) originalPromptAnalysisResultDiv.classList.remove('hidden');
            if(originalPromptAnalysisText) originalPromptAnalysisText.textContent = "Masukkan prompt terlebih dahulu untuk dianalisis.";
            if(originalPromptAnalysisLoader) originalPromptAnalysisLoader.classList.add('hidden');
            return;
        }

        if(originalPromptAnalysisResultDiv) originalPromptAnalysisResultDiv.classList.remove('hidden');
        if(originalPromptAnalysisText) originalPromptAnalysisText.textContent = '';
        if(originalPromptAnalysisLoader) originalPromptAnalysisLoader.classList.remove('hidden');
        analyzeOriginalPromptButton.disabled = true;
        analyzeOriginalPromptButton.classList.add('opacity-50');

        const instruction = `Anda adalah asisten ahli prompt. Analisis prompt pengguna berikut: '${simplePrompt}'.
Berikan masukan konstruktif tentang kejelasan, kekhususan, dan potensi untuk menghasilkan hasil yang baik dengan generator gambar atau video AI.
Sarankan 1-2 cara spesifik pengguna dapat meningkatkan atau menguraikan prompt ini jika mereka mau.
Jaga analisis Anda tetap ringkas dan dapat ditindaklanjuti, dalam 2-4 kalimat. Balas dalam Bahasa Indonesia.`;

        try {
            const analysis = await generateGeminiResponse(instruction);
            if(originalPromptAnalysisText) originalPromptAnalysisText.textContent = analysis;
        } catch (error: any) {
            console.error("Error menganalisis prompt:", error);
            if(originalPromptAnalysisText) originalPromptAnalysisText.textContent = "Gagal menganalisis prompt: " + error.message;
        } finally {
            if(originalPromptAnalysisLoader) originalPromptAnalysisLoader.classList.add('hidden');
            analyzeOriginalPromptButton.disabled = false;
            analyzeOriginalPromptButton.classList.remove('opacity-50');
        }
    });

    enhanceButton.addEventListener('click', async () => {
        const simplePrompt = userPromptInput.value.trim();
        const selectedImageDetails = [
            imageQualitySelect.value, imageDetailSelect.value, imageLightingSelect.value,
            imageCompositionSelect.value, imageStyleSelect.value, imageNegativeStyleSelect.value
        ].filter(value => value !== "");
        const selectedVideoDetails = [
            videoShotTypeSelect.value, videoCameraMovementSelect.value
        ].filter(value => value !== "");

        if (!simplePrompt) {
            displayError("Harap masukkan prompt terlebih dahulu.");
            return;
        }

        if(loadingAnimation) loadingAnimation.classList.remove('hidden');
        if(loadingText) loadingText.textContent = "Sedang membuat variasi prompt gambar...";
        if(resultsDiv) resultsDiv.classList.add('hidden');
        if(downloadAllPromptsButton) downloadAllPromptsButton.classList.add('hidden');
        if(errorMessageDiv) errorMessageDiv.classList.add('hidden');
        enhanceButton.disabled = true;
        enhanceButton.classList.add('opacity-50', 'cursor-not-allowed');
        if(imagePromptOutputContainer) imagePromptOutputContainer.innerHTML = ''; // Clear previous results
        if(videoPromptOutputContainer) videoPromptOutputContainer.innerHTML = ''; // Clear previous results

        try {
            let imagePromptInstruction = `You are an AI assistant that refines simple user prompts into highly detailed, engaging, and imaginative prompts for image generation.
Focus on the core elements of the user's input: '${simplePrompt}'.
Enhance it significantly by:
1.  Adding 3-4 key descriptive adjectives or short, evocative phrases that vividly clarify the subject, its actions, and its immediate environment. Aim for rich detail.
2.  Suggesting a specific and compelling artistic mood or style that complements the original idea and makes it more interesting (unless a specific style is already provided by the user).
3.  Describing dominant colors, lighting conditions, and textures to create a more immersive visual (unless specific lighting is already provided by the user).
4.  Encourage creative interpretations and unique visual compositions (unless a specific composition is already provided by the user).`;

            if (selectedImageDetails.length > 0) {
                const positiveDetails: string[] = [];
                const negativeDetails: string[] = [];
                selectedImageDetails.forEach(detail => {
                    if (detail === "No Blur, Not Blurry" || detail === "no shadow") {
                        if (detail === "No Blur, Not Blurry") negativeDetails.push(detail);
                        else if (detail === "no shadow") negativeDetails.push("no shadow, avoid unwanted shadows");
                    } else {
                        positiveDetails.push(detail);
                    }
                });
                if (positiveDetails.length > 0) {
                    imagePromptInstruction += `\n5. Additionally, ensure the following user-selected positive details are thoughtfully integrated or strongly implied for the image: ${positiveDetails.join(', ')}. These user-selected details should take precedence if they conflict with other generated suggestions for similar aspects (e.g. if user selects a style, use that style).`;
                }
                if (negativeDetails.length > 0) {
                    imagePromptInstruction += `\n6. Also, try to AVOID or MINIMIZE the following negative aspects: ${negativeDetails.join(', ')}.`;
                }
            }
            imagePromptInstruction += `\nKeep each prompt concise yet rich in detail, and directly related to the user's original request. Avoid introducing entirely new subjects or complex scenarios not implied by the original idea.
Provide 5 distinct variations of the enhanced prompt. Each variation should ONLY contain the enhanced prompt itself, starting on a new line with a number and a period. Do not include any other conversational text, examples of format, or repeat the user's original prompt within the numbered variations. Reply in English for each prompt variation.`;

            const imageEnhancedPromptsText = await generateGeminiResponse(imagePromptInstruction);
            const parsedImagePrompts = parseVariations(imageEnhancedPromptsText);

            if (!parsedImagePrompts || parsedImagePrompts.length === 0) {
                if (typeof imageEnhancedPromptsText === 'string' &&
                    (imageEnhancedPromptsText.includes("Panggilan API gagal") ||
                     imageEnhancedPromptsText.includes("Tidak ada konten teks yang dihasilkan") ||
                     imageEnhancedPromptsText.includes("Respons diblokir oleh filter keamanan"))) {
                    displayError(`Gagal membuat prompt gambar: ${imageEnhancedPromptsText}`);
                } else {
                    displayError("Gagal membuat atau mem-parsing variasi prompt gambar. Respons API mungkin kosong atau tidak valid.");
                }
                if(loadingAnimation) loadingAnimation.classList.add('hidden');
                enhanceButton.disabled = false;
                enhanceButton.classList.remove('opacity-50', 'cursor-not-allowed');
                if(downloadAllPromptsButton) downloadAllPromptsButton.classList.add('hidden');
                return;
            }
            if(imagePromptOutputContainer) displayVariations(imagePromptOutputContainer, imageEnhancedPromptsText, 'image');

            if(loadingText) loadingText.textContent = "Sedang membuat variasi prompt video dari setiap prompt gambar...";
            const videoPromptsArray: string[] = [];
            for (const imagePrompt of parsedImagePrompts) { // parsedImagePrompts are un-numbered
                if (!imagePrompt) continue;
                let dynamicVideoPromptInstruction = `You are an AI assistant that transforms a detailed image prompt into a corresponding, brief and more detailed video scene description.
The goal is to bring the static image (as described by the image prompt) to life with vivid movement, rich atmosphere, and clear visual storytelling, but STRICTLY WITHOUT adding specific sound effects.
Based *only* on the following image prompt: '${imagePrompt}'

Create a single, concise video scene description that:
1.  Describes a brief, key action or a subtle yet engaging animation that could occur within the scene depicted by the image prompt. Be specific about the movement and its quality (e.g., "a gentle sway," "a rapid unfurling," "a slow, deliberate turn").
2.  Clearly defines the camera work. If user-selected video details are provided, they dictate the shot type and camera movement. If not, suggest a simple but effective camera movement (e.g., "slow pan revealing...", "a tracking shot following...", "a dramatic push-in to...") that enhances the image's focus and adds to the scene's dynamism.`;

                if (selectedVideoDetails.length > 0) {
                    dynamicVideoPromptInstruction += `\n   User-selected video details to incorporate: ${selectedVideoDetails.join(', ')}. These should primarily define the shot type and camera movement.`;
                }
                dynamicVideoPromptInstruction += `\n3. Describes the dominant atmospheric element with more sensory detail (e.g., "wisps of mist coiling around the ancient stones," "the air shimmering with intense heat," "a soft, ethereal glow pervading the forest"). STRICTLY AVOID suggesting specific sound effects like roars, music, or speech. Focus only on visual and atmospheric descriptions.`;
                dynamicVideoPromptInstruction += `\nFocus on a direct and logical extension of the image prompt into a moment in time with enhanced visual dynamism and detail. Do not introduce new characters or radically different settings not implied by the image prompt.
Provide ONLY the video scene description itself. Do not add any conversational text, numbering, or repeat the original image prompt. Reply in English.`;

                try {
                    const videoScene = await generateGeminiResponse(dynamicVideoPromptInstruction);
                    videoPromptsArray.push(videoScene.trim());
                } catch (videoError: any) {
                    console.error(`Error generating video prompt for image prompt "${imagePrompt}":`, videoError);
                    videoPromptsArray.push(`[Gagal membuat prompt video untuk gambar ini: ${videoError.message}]`);
                }
            }
            const videoEnhancedPromptsText = videoPromptsArray.map((vp, i) => `${i + 1}. ${vp}`).join('\n');
            if (videoPromptOutputContainer) displayVariations(videoPromptOutputContainer, videoEnhancedPromptsText, 'video');
            
            if (resultsDiv) resultsDiv.classList.remove('hidden');
            if (downloadAllPromptsButton && (parsedImagePrompts.length > 0 || videoPromptsArray.some(vp => !vp.startsWith("[Gagal")))) {
                 downloadAllPromptsButton.classList.remove('hidden');
            } else {
                 if (downloadAllPromptsButton) downloadAllPromptsButton.classList.add('hidden');
            }


        } catch (error: any) {
            console.error("Error utama dalam proses enhanceButton:", error);
            displayError("Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi. Detail: " + error.message);
             if(downloadAllPromptsButton) downloadAllPromptsButton.classList.add('hidden');
        } finally {
            if(loadingAnimation) loadingAnimation.classList.add('hidden');
            enhanceButton.disabled = false;
            enhanceButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });

    if (downloadAllPromptsButton) {
        downloadAllPromptsButton.addEventListener('click', downloadAllPrompts);
    }
}); // End of DOMContentLoaded

// --- Helper Functions (moved outside DOMContentLoaded for clarity, they use global consts) ---

async function describeVisualStyle(imagePrompt: string, resultElementId: string, loaderElementId: string, buttonElement: HTMLButtonElement) {
    const resultEl = document.getElementById(resultElementId);
    const loaderEl = document.getElementById(loaderElementId);

    if(resultEl) {
        resultEl.classList.add('hidden');
        resultEl.textContent = '';
    }
    if(loaderEl) loaderEl.classList.remove('hidden');
    buttonElement.disabled = true;
    buttonElement.classList.add('opacity-50');

    const instruction = `Berdasarkan prompt gambar berikut: '${imagePrompt}', berikan deskripsi ringkas (2-3 kalimat) tentang kemungkinan gaya visual, suasana hati, dan elemen artistik utama yang tersirat. Misalnya, sebutkan apakah itu menyarankan fotorealisme, seni fantasi, palet warna tertentu, kondisi pencahayaan, atau pengaruh artistik tertentu. Balas dalam Bahasa Indonesia.`;

    try {
        const description = await generateGeminiResponse(instruction);
        if (typeof description === 'string' && (description.includes("Panggilan API gagal") || description.includes("Tidak ada konten teks yang dihasilkan") || description.includes("Respons diblokir oleh filter keamanan"))) {
            throw new Error(description);
        }
        if(resultEl) {
            resultEl.textContent = description;
            resultEl.classList.remove('hidden');
        }
    } catch (error: any) {
        console.error("Error mendeskripsikan gaya visual:", error);
        if(resultEl) {
            resultEl.textContent = "Gagal mendeskripsikan gaya visual: " + error.message;
            resultEl.classList.remove('hidden');
        }
    } finally {
        if(loaderEl) loaderEl.classList.add('hidden');
        buttonElement.disabled = false;
        buttonElement.classList.remove('opacity-50');
    }
}

async function developMiniNarrative(videoPrompt: string, resultElementId: string, loaderElementId: string, buttonElement: HTMLButtonElement) {
    const resultEl = document.getElementById(resultElementId);
    const loaderEl = document.getElementById(loaderElementId);

    if(resultEl) {
        resultEl.classList.add('hidden');
        resultEl.textContent = '';
    }
    if(loaderEl) loaderEl.classList.remove('hidden');
    buttonElement.disabled = true;
    buttonElement.classList.add('opacity-50');

    const instruction = `Berdasarkan deskripsi adegan video berikut: '${videoPrompt}', kembangkan mini-narasi yang sangat singkat (1-2 kalimat). Ini bisa berupa kemungkinan peristiwa sebelumnya, konsekuensi langsung, atau perluasan singkat dari implikasi adegan saat ini. Jaga agar tetap ringkas dan kreatif. Balas dalam Bahasa Indonesia.`;

    try {
        const narrative = await generateGeminiResponse(instruction);
        if (typeof narrative === 'string' && (narrative.includes("Panggilan API gagal") || narrative.includes("Tidak ada konten teks yang dihasilkan") || narrative.includes("Respons diblokir oleh filter keamanan"))) {
            throw new Error(narrative);
        }
        if(resultEl) {
            resultEl.textContent = narrative;
            resultEl.classList.remove('hidden');
        }
    } catch (error: any) {
        console.error("Error mengembangkan narasi:", error);
        if(resultEl) {
            resultEl.textContent = "Gagal mengembangkan narasi: " + error.message;
            resultEl.classList.remove('hidden');
        }
    } finally {
        if(loaderEl) loaderEl.classList.add('hidden');
        buttonElement.disabled = false;
        buttonElement.classList.remove('opacity-50');
    }
}

function parseVariations(variationsText: string | null | undefined): string[] {
    if (!variationsText || typeof variationsText !== 'string') return [];
    if (variationsText.includes("Panggilan API gagal") ||
        variationsText.includes("Tidak ada konten teks yang dihasilkan") ||
        variationsText.includes("Respons diblokir oleh filter keamanan")) {
        console.warn("Parsing dibatalkan karena variationsText adalah pesan error:", variationsText);
        return [];
    }

    const rawVariations = variationsText.split(/\n\s*(?=\d+\.\s)/);
    let finalVariations: string[] = [];

    if (rawVariations.length > 0 && rawVariations[0].match(/^\s*\d+\.\s/)) {
        finalVariations = rawVariations.map(v => v.trim()).filter(v => v);
    } else if (rawVariations.length > 0) {
        const firstVariationMatch = rawVariations[0].match(/(\d+\.\s.*)/s);
        if (firstVariationMatch && firstVariationMatch[1]) {
            finalVariations.push(firstVariationMatch[1].trim());
        }
        if (rawVariations.length > 1) {
            finalVariations.push(...rawVariations.slice(1).map(v => v.trim()).filter(v => v));
        }
    }

    if (finalVariations.length === 0 && variationsText.includes('\n')) {
         finalVariations = variationsText.split('\n').map(v => v.trim()).filter(v => v.replace(/^\d+\.\s*/, '').trim() !== "");
    } else if (finalVariations.length === 0 && variationsText.trim() !== "") {
         finalVariations = [variationsText.trim()];
    }
    // Return un-numbered prompts
    return finalVariations.map(v => v.replace(/^\d+\.\s*/, '').trim()).filter(v => v);
}

function displayVariations(container: HTMLElement, variationsText: string, type: 'image' | 'video') {
    container.classList.add('output-box-container'); 
    if (!container.querySelector('h3')) { 
        const heading = document.createElement('h3');
        heading.className = 'text-xl font-semibold text-sky-400 mb-3';
        heading.textContent = type === 'image' ? 'Variasi Prompt Gambar:' : 'Variasi Prompt Video:';
        container.prepend(heading); 
    }
    
    const existingItems = container.querySelectorAll('.variation-item, .text-slate-400');
    existingItems.forEach(item => item.remove());

    if (!variationsText || typeof variationsText !== 'string' ||
        variationsText.toLowerCase().includes("panggilan api gagal") ||
        variationsText.toLowerCase().includes("tidak ada konten teks yang dihasilkan") ||
        variationsText.toLowerCase().includes("respons diblokir oleh filter keamanan")) {
        let errorMessageContent = `Tidak ada variasi ${type} yang dapat ditampilkan.`;
        if (variationsText) {
            errorMessageContent = `Gagal memuat variasi ${type}: ${variationsText}`;
        }
        const errorP = document.createElement('p');
        errorP.className = 'text-slate-400';
        errorP.textContent = errorMessageContent;
        container.appendChild(errorP);
        if (variationsText) console.log("Raw variations text for " + type + ":", variationsText);
        return;
    }

    const lines = variationsText.split('\n').filter(line => line.trim() !== "");

    if (lines.length === 0) {
         const noVariationP = document.createElement('p');
         noVariationP.className = 'text-slate-400';
         noVariationP.textContent = `Tidak ada variasi ${type} yang valid ditemukan dalam respons.`;
         container.appendChild(noVariationP);
         return;
    }

    lines.slice(0, 5).forEach((line, index) => {
        let displayLine = line;
        // Ensure displayLine starts with a number, especially if API didn't provide it for images,
        // or as a safeguard. For videos, 'line' should already be numbered.
        if (!/^\d+\.\s/.test(line)) {
            displayLine = `${index + 1}. ${line}`;
        }

        // Derive promptTextForFeature (un-numbered) from the original 'line'
        let promptTextForFeature = "";
        const featureMatch = line.match(/(?:\d+\.\s)?(.*)/s); // Use original 'line'
        if (featureMatch && featureMatch[1]) {
            promptTextForFeature = featureMatch[1].trim();
        } else {
            promptTextForFeature = line.trim(); // Fallback
        }

        // Handle cases where the prompt generation itself failed for this item (e.g., video prompt from image)
        if (!promptTextForFeature.trim() || promptTextForFeature.toLowerCase().startsWith("[gagal membuat prompt video")) {
             const itemDiv = document.createElement('div');
             itemDiv.className = 'variation-item border-l-4 border-red-500';
             const pre = document.createElement('pre');
             // 'displayLine' will show the numbered failure message, e.g., "1. [Gagal...]"
             pre.textContent = displayLine || `${index + 1}. Gagal membuat variasi ${type}. (Teks kosong)`;
             itemDiv.appendChild(pre);
             container.appendChild(itemDiv);
             return; // Skip adding buttons for this failed item
        }

        const variationId = `${type}-variation-${index}`;
        const feedbackId = `${type}-feedback-${index}`;
        const featureResultId = `${type}-feature-result-${index}`;
        const featureLoaderId = `${type}-feature-loader-${index}`;
        const featureButtonId = `${type}-feature-button-${index}`;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'variation-item';

        const pre = document.createElement('pre');
        pre.id = variationId;
        pre.textContent = displayLine; // Display the (now guaranteed) numbered line

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-button text-slate-300';
        copyBtn.setAttribute('aria-label', `Salin Variasi ${type} ${index + 1}`);
        copyBtn.title = `Salin Variasi ${type} ${index + 1}`;
        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        copyBtn.onclick = () => copyToClipboard(variationId, feedbackId); // Copies 'displayLine'

        const feedbackSpan = document.createElement('span');
        feedbackSpan.id = feedbackId;
        feedbackSpan.className = 'copied-feedback';
        feedbackSpan.textContent = 'Disalin!';
        feedbackSpan.setAttribute('aria-live', 'polite');

        itemDiv.appendChild(pre);
        itemDiv.appendChild(copyBtn);
        itemDiv.appendChild(feedbackSpan);

        const featureButton = document.createElement('button') as HTMLButtonElement;
        featureButton.id = featureButtonId;
        featureButton.className = 'feature-button'; 

        const featureResultDiv = document.createElement('div');
        const featureLoader = document.createElement('div');

        featureResultDiv.id = featureResultId;
        featureResultDiv.className = 'hidden feature-result';
        featureResultDiv.setAttribute('aria-live', 'polite');
        featureLoader.id = featureLoaderId;
        featureLoader.className = 'hidden loader_small mx-auto my-1';
        featureLoader.setAttribute('aria-label', 'Loading feature result');

        // Use 'promptTextForFeature' (un-numbered) for the feature functions
        if (type === 'image') {
            featureButton.innerHTML = '✨ Deskripsikan Gaya Visual';
            featureButton.onclick = () => describeVisualStyle(promptTextForFeature, featureResultId, featureLoaderId, featureButton);
        } else {
            featureButton.innerHTML = '✨ Kembangkan Mini-Narasi';
            featureButton.onclick = () => developMiniNarrative(promptTextForFeature, featureResultId, featureLoaderId, featureButton);
        }
        
        itemDiv.appendChild(featureButton);
        itemDiv.appendChild(featureLoader);
        itemDiv.appendChild(featureResultDiv);

        container.appendChild(itemDiv);
    });
     if (lines.length === 0 && !variationsText.toLowerCase().includes("tidak dapat menghasilkan")) {
        const parseFailP = document.createElement('p');
        parseFailP.className = 'text-slate-400';
        parseFailP.textContent = `Gagal mem-parsing variasi ${type}.`;
        container.appendChild(parseFailP);
    }
}

function displayError(message: string) {
    if(errorMessageText) errorMessageText.textContent = message;
    if(errorMessageDiv) errorMessageDiv.classList.remove('hidden');
    if(resultsDiv) resultsDiv.classList.add('hidden');
    if(downloadAllPromptsButton) downloadAllPromptsButton.classList.add('hidden');
}

function copyToClipboard(elementId: string, feedbackElementId: string) {
    const textToCopyEl = document.getElementById(elementId);
    if (!textToCopyEl) return;

    const textToCopy = textToCopyEl.textContent;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const feedbackEl = document.getElementById(feedbackElementId) as HTMLElement | null;
        if (feedbackEl) {
            feedbackEl.textContent = 'Disalin!';
            feedbackEl.style.backgroundColor = '#38bdf8'; // Tailwind sky-400 (consistent with CSS rule)
            feedbackEl.style.opacity = '1';
            setTimeout(() => {
                feedbackEl.style.opacity = '0';
            }, 1500);
        }
    }).catch(err => {
        console.error('Async: Gagal menyalin teks: ', err);
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed"; 
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            const feedbackEl = document.getElementById(feedbackElementId) as HTMLElement | null;
            if (feedbackEl) {
                feedbackEl.textContent = 'Disalin!';
                feedbackEl.style.backgroundColor = '#38bdf8'; 
                feedbackEl.style.opacity = '1';
                setTimeout(() => { if(feedbackEl) feedbackEl.style.opacity = '0'; }, 1500);
            }
        } catch (fallbackErr) {
            console.error('Fallback: Gagal menyalin', fallbackErr);
            const feedbackEl = document.getElementById(feedbackElementId) as HTMLElement | null;
            if (feedbackEl) {
                feedbackEl.textContent = 'Gagal!';
                feedbackEl.style.backgroundColor = 'red'; 
                feedbackEl.style.opacity = '1';
                 setTimeout(() => {
                    if(feedbackEl) feedbackEl.style.opacity = '0';
                    setTimeout(() => { 
                        if(feedbackEl) {
                            feedbackEl.textContent = 'Disalin!';
                            feedbackEl.style.backgroundColor = '#38bdf8'; 
                        }
                    }, 500);
                }, 2000);
            }
        }
        document.body.removeChild(textArea);
    });
}

function downloadAllPrompts() {
    if (!imagePromptOutputContainer || !videoPromptOutputContainer) {
        console.error("Prompt containers not found for download.");
        displayError("Gagal mengunduh: Kontainer prompt tidak ditemukan.");
        return;
    }

    let allPromptsText = "IMAGE PROMPTS:\n==========================\n\n";
    const imageVariationItems = imagePromptOutputContainer.querySelectorAll('.variation-item pre');
    if (imageVariationItems.length === 0 && imagePromptOutputContainer.querySelector('.text-slate-400')) {
        const messageEl = imagePromptOutputContainer.querySelector('.text-slate-400');
        allPromptsText += (messageEl?.textContent || "Tidak ada variasi gambar.") + "\n\n";
    } else {
        imageVariationItems.forEach((pre) => { // Removed index as pre.textContent is already numbered
            allPromptsText += `${pre.textContent?.trim()}\n\n`;
        });
    }


    allPromptsText += "\n\nVIDEO PROMPTS:\n==========================\n\n";
    const videoVariationItems = videoPromptOutputContainer.querySelectorAll('.variation-item pre');
     if (videoVariationItems.length === 0 && videoPromptOutputContainer.querySelector('.text-slate-400')) {
        const messageEl = videoPromptOutputContainer.querySelector('.text-slate-400');
        allPromptsText += (messageEl?.textContent || "Tidak ada variasi video.") + "\n\n";
    } else {
        videoVariationItems.forEach((pre) => { // Removed index
            allPromptsText += `${pre.textContent?.trim()}\n\n`;
        });
    }

    const cleanImagePromptsHeader = "IMAGE PROMPTS:\n==========================\n\n";
    const cleanVideoPromptsHeader = "\n\nVIDEO PROMPTS:\n==========================\n\n";

    let onlyHeadersOrNoContent = true;
    if (imageVariationItems.length > 0 || videoVariationItems.length > 0) {
        onlyHeadersOrNoContent = false;
    }

    if (onlyHeadersOrNoContent && 
        allPromptsText.includes("Tidak ada variasi") && 
        !allPromptsText.replace(cleanImagePromptsHeader, "").replace(cleanVideoPromptsHeader, "").replace(/Tidak ada variasi.*?(\n\n|$)/g, "").trim()
       ) {
        displayError("Tidak ada prompt yang berhasil dibuat untuk diunduh.");
        return;
    }

    const blob = new Blob([allPromptsText.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enhanced_prompts.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
