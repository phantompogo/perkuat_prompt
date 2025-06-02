
import { GoogleGenAI } from "@google/genai";

// --- Global DOM Element References ---
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
const resultsSeparator = document.getElementById('resultsSeparator') as HTMLElement;
const notificationSound = document.getElementById('notificationSound') as HTMLAudioElement;


// --- AI SDK INITIALIZATION ---
let ai: GoogleGenAI | undefined;

function initializeAiSDK() {
    if (!ai) {
        const apiKey = process.env.API_KEY; // Strictly use process.env.API_KEY
        if (!apiKey) {
            console.error("API_KEY environment variable is not set. The application will not function correctly.");
            if (errorMessageText) errorMessageText.textContent = "Kesalahan Konfigurasi: API Key tidak ditemukan. Aplikasi tidak dapat berfungsi.";
            if (errorMessageDiv) errorMessageDiv.classList.remove('hidden');
            if (enhanceButton) enhanceButton.disabled = true;
            if (analyzeOriginalPromptButton) analyzeOriginalPromptButton.disabled = true;
            if (downloadPromptsButton) downloadPromptsButton.disabled = true;
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
            if (downloadPromptsButton) downloadPromptsButton.disabled = true;
            return false;
        }
    }
    return true;
}

// --- Gemini API Call Function ---
async function generateGeminiResponse(instruction: string) {
    if (!ai) {
        if (!initializeAiSDK() || !ai) { 
            console.error("AI SDK not initialized properly for generateGeminiResponse call.");
            throw new Error("AI SDK tidak terinisialisasi. API Key mungkin hilang atau salah.");
        }
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: instruction,
            config: { 
                temperature: 0.9, 
                topP: 0.95,       
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
        if (enhanceButton) enhanceButton.disabled = true;
        if (analyzeOriginalPromptButton) analyzeOriginalPromptButton.disabled = true;
        if (downloadPromptsButton) downloadPromptsButton.disabled = true;
        if (errorMessageDiv && errorMessageDiv.classList.contains('hidden')) {
             if (errorMessageText) errorMessageText.textContent = "Inisialisasi aplikasi gagal. Periksa konsol untuk detail."
             if (errorMessageDiv) errorMessageDiv.classList.remove('hidden');
        }
        return; 
    }

    if (promptDetailSlider && promptDetailValue) {
        promptDetailValue.textContent = promptDetailSlider.value; // Initial value
        promptDetailSlider.addEventListener('input', () => {
            promptDetailValue.textContent = promptDetailSlider.value;
        });
    }

    if (downloadPromptsButton) {
        downloadPromptsButton.addEventListener('click', handleDownloadPrompts);
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
        
        const detailLevel = promptDetailSlider ? parseInt(promptDetailSlider.value) : 3;

        if (!simplePrompt) {
            displayError("Harap masukkan prompt terlebih dahulu.");
            return;
        }

        const isOnlyImageChecked = onlyImageCheckbox.checked;
        const isOnlyVideoChecked = onlyVideoCheckbox.checked;

        let shouldGenerateImage = true;
        let shouldDisplayImage = true;
        let shouldGenerateVideo = true;
        let shouldDisplayVideo = true;

        if (isOnlyImageChecked && !isOnlyVideoChecked) {
            shouldGenerateVideo = false;
            shouldDisplayVideo = false;
        } else if (isOnlyVideoChecked && !isOnlyImageChecked) {
            shouldDisplayImage = false; // Image still generated as base for video
        }
        // If neither or both are checked, all flags remain true (default behavior)

        // --- Initial UI Setup ---
        if(loadingAnimation) loadingAnimation.classList.remove('hidden');
        if(errorMessageDiv) errorMessageDiv.classList.add('hidden');
        enhanceButton.disabled = true;
        enhanceButton.classList.add('opacity-50', 'cursor-not-allowed');
        if(downloadPromptsButton) {
            downloadPromptsButton.disabled = true;
            downloadPromptsButton.classList.add('opacity-50', 'cursor-not-allowed', 'hidden');
        }
        if(imagePromptVariationsDiv) imagePromptVariationsDiv.innerHTML = '';
        if(videoPromptVariationsDiv) videoPromptVariationsDiv.innerHTML = '';
        if(resultsDiv) resultsDiv.classList.add('hidden');
        
        if(imagePromptOutputContainer) imagePromptOutputContainer.classList.toggle('hidden', !shouldDisplayImage);
        if(videoPromptOutputContainer) videoPromptOutputContainer.classList.toggle('hidden', !shouldDisplayVideo);
        if(resultsSeparator) resultsSeparator.classList.toggle('hidden', !shouldDisplayVideo || !shouldGenerateVideo);


        let parsedImagePrompts: string[] = [];
        let videoPromptsArray: string[] = [];

        // --- Image Prompt Generation ---
        if (shouldGenerateImage) {
            if(loadingText) {
                if (shouldGenerateVideo && !shouldDisplayImage) { // Only video is the target display
                    loadingText.textContent = "Membuat prompt gambar (dasar untuk video)...";
                } else {
                    loadingText.textContent = "Sedang membuat variasi prompt gambar...";
                }
            }
            try {
                const detailLevelInstruction = getDetailInstruction(detailLevel);
                let imagePromptInstruction = `You are an AI assistant that refines simple user prompts into prompts for image generation, with a varying degree of detail as specified.
The user's original prompt is: '${simplePrompt}'.
The desired level of detail for the enhanced prompts is: "${detailLevelInstruction}".
Based on this detail level, enhance the simple prompt.
For higher detail levels (4-5), this means:
- Adding more descriptive adjectives and evocative phrases.
- Suggesting more specific artistic moods, styles, colors, lighting, and textures.
- Encouraging more creative and unique visual compositions.
For medium detail levels (3), provide a good balance of description and artistic suggestion.
For lower detail levels (1-2), this means:
- Keeping enhancements concise and focused on core elements.
- Using fewer adjectives.
- Suggesting simpler or broader artistic elements, or omitting them if the detail level is very low.
Always focus on the core elements of the user's input.`;

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
                        imagePromptInstruction += `\nAdditionally, ensure the following user-selected positive details are thoughtfully integrated or strongly implied, consistent with the requested overall detail level: ${positiveDetails.join(', ')}. These user-selected details should take precedence if they conflict with other generated suggestions for similar aspects (e.g. if user selects a style, use that style).`;
                    }
                    if (negativeDetails.length > 0) {
                        imagePromptInstruction += `\nAlso, try to AVOID or MINIMIZE the following negative aspects: ${negativeDetails.join(', ')}.`;
                    }
                }
                imagePromptInstruction += `\nGenerate 5 distinct variations of the enhanced prompt. Each variation should ONLY contain the enhanced prompt itself, starting on a new line with a number and a period. Do not include any other conversational text, examples of format, or repeat the user's original prompt within the numbered variations. Reply in English for each prompt variation.`;

                const imageEnhancedPromptsText = await generateGeminiResponse(imagePromptInstruction);
                parsedImagePrompts = parseVariations(imageEnhancedPromptsText);

                if (shouldDisplayImage && imagePromptVariationsDiv) {
                     displayVariations(imagePromptVariationsDiv, imageEnhancedPromptsText, 'image');
                }
                 if ((!parsedImagePrompts || parsedImagePrompts.length === 0) && (typeof imageEnhancedPromptsText === 'string' && (imageEnhancedPromptsText.includes("Panggilan API gagal") || imageEnhancedPromptsText.includes("Tidak ada konten teks yang dihasilkan") || imageEnhancedPromptsText.includes("Respons diblokir oleh filter keamanan")))) {
                    // If image generation failed and it was the ONLY thing requested, or video depended on it.
                    if (!shouldGenerateVideo) { // Only image was requested
                        displayError(`Gagal membuat prompt gambar: ${imageEnhancedPromptsText}`);
                        finalizeUiState(false, false); // No valid prompts
                        return;
                    }
                     // if video was also requested, this error will be implicitly handled as parsedImagePrompts will be empty.
                } else if ((!parsedImagePrompts || parsedImagePrompts.length === 0) && shouldDisplayImage) {
                     if (imagePromptVariationsDiv) imagePromptVariationsDiv.innerHTML = `<p class="text-slate-400 p-3">Gagal membuat atau mem-parsing variasi prompt gambar.</p>`;
                }


            } catch (error: any) {
                console.error("Error in Image Prompt Generation Block:", error);
                parsedImagePrompts = []; // Ensure it's empty on error
                if (shouldDisplayImage) {
                     displayError("Gagal membuat prompt gambar: " + error.message);
                }
                if (!shouldGenerateVideo) { // If only image was requested, stop here
                    finalizeUiState(false, false);
                    return;
                }
            }
        } else {
            parsedImagePrompts = [];
        }

        // --- Video Prompt Generation ---
        if (shouldGenerateVideo) {
            if (parsedImagePrompts.length > 0) {
                if(loadingText) loadingText.textContent = "Sedang membuat variasi prompt video...";
                for (const imagePrompt of parsedImagePrompts) {
                    if (!imagePrompt) continue;
                    let dynamicVideoPromptInstruction = `You are an AI assistant that transforms a detailed image prompt into a corresponding video scene description.
The source image prompt has been generated with a specific level of detail (level ${detailLevel} out of 5, where 5 is most detailed). Your video scene description should be consistent with this level of richness.
Based *only* on the following image prompt: '${imagePrompt}'
Create a single video scene description that:
1.  Describes a key action or subtle animation relevant to the image prompt. The complexity and vividness of this action should align with the detail of the image prompt.
2.  Clearly defines camera work. If user-selected video details are provided, they dictate this. Otherwise, suggest camera work appropriate to the scene's implied detail.
    ${selectedVideoDetails.length > 0 ? `User-selected video details to incorporate: ${selectedVideoDetails.join(', ')}.` : ''}
3.  Describes the dominant atmospheric element with sensory detail that matches the image prompt's richness. STRICTLY AVOID suggesting specific sound effects.
Focus on a direct and logical extension of the image prompt into a moment in time. The overall detail and complexity of your video description should mirror that of the provided image prompt.
Provide ONLY the video scene description itself. Do not add any conversational text, numbering, or repeat the original image prompt. Reply in English.`;
                    try {
                        const videoScene = await generateGeminiResponse(dynamicVideoPromptInstruction);
                        videoPromptsArray.push(videoScene.trim());
                    } catch (videoError: any) {
                        console.error(`Error generating video prompt for image prompt "${imagePrompt}":`, videoError);
                        videoPromptsArray.push(`[Gagal membuat prompt video untuk gambar ini: ${videoError.message}]`);
                    }
                }
                if (shouldDisplayVideo && videoPromptVariationsDiv) {
                    const videoEnhancedPromptsText = videoPromptsArray.map((vp, i) => `${i + 1}. ${vp}`).join('\n');
                    displayVariations(videoPromptVariationsDiv, videoEnhancedPromptsText, 'video');
                }
            } else { // Image prompts failed or were not generated
                videoPromptsArray = [];
                if (shouldDisplayVideo && videoPromptVariationsDiv) {
                    videoPromptVariationsDiv.innerHTML = `<p class="text-slate-400 p-3">Tidak dapat membuat prompt video tanpa prompt gambar dasar yang berhasil.</p>`;
                }
            }
        } else {
             videoPromptsArray = [];
        }

        finalizeUiState(
            shouldDisplayImage && parsedImagePrompts.some(p => p && !p.startsWith("[Gagal")), 
            shouldDisplayVideo && videoPromptsArray.some(p => p && !p.startsWith("[Gagal"))
        );
    });
}); 

function finalizeUiState(hasImageContent: boolean, hasVideoContent: boolean) {
    if(loadingAnimation) loadingAnimation.classList.add('hidden');
    enhanceButton.disabled = false;
    enhanceButton.classList.remove('opacity-50', 'cursor-not-allowed');

    const anyDisplayedContent = hasImageContent || hasVideoContent;

    if (downloadPromptsButton) {
        downloadPromptsButton.disabled = !anyDisplayedContent;
        if (anyDisplayedContent) {
            downloadPromptsButton.classList.remove('opacity-50', 'cursor-not-allowed', 'hidden');
        } else {
            downloadPromptsButton.classList.add('opacity-50', 'cursor-not-allowed', 'hidden');
        }
    }

    if (anyDisplayedContent && resultsDiv) {
        resultsDiv.classList.remove('hidden');
        if (notificationSound) {
            try {
                notificationSound.play();
            } catch (error) {
                console.warn("Gagal memutar suara notifikasi:", error);
            }
        }
    } else if (resultsDiv) {
        resultsDiv.classList.add('hidden');
    }
}


// --- Helper Functions ---

function getDetailInstruction(level: number): string {
    switch (level) {
        case 1: return "Level 1 (Sangat Ringkas): Hasilkan prompt yang sangat singkat, fokus pada elemen inti absolut dengan sedikit kata sifat. Utamakan keringkasan dan keterusterangan.";
        case 2: return "Level 2 (Ringkas): Hasilkan prompt yang sedikit lebih deskriptif, tambahkan beberapa kata sifat kunci untuk memperjelas subjek dan latar.";
        case 3: return "Level 3 (Seimbang): Hasilkan prompt yang seimbang dengan detail deskriptif yang baik, menyarankan suasana hati dan beberapa elemen artistik. Ini adalah level standar.";
        case 4: return "Level 4 (Detail): Hasilkan prompt yang sangat deskriptif, gunakan kosakata yang kaya untuk melukiskan gambaran yang jelas, termasuk saran artistik yang lebih bernuansa.";
        case 5: return "Level 5 (Sangat Detail & Imajinatif): Hasilkan prompt yang sangat detail dan imajinatif, gunakan bahasa yang menggugah, struktur kalimat yang kompleks jika sesuai, dan jelajahi interpretasi visual yang unik. Targetkan kekayaan maksimal.";
        default: return "Level 3 (Seimbang): Hasilkan prompt yang seimbang dengan detail deskriptif yang baik.";
    }
}

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

    return finalVariations.map(v => v.replace(/^\d+\.\s*/, '').trim()).filter(v => v);
}

function displayVariations(container: HTMLElement, variationsText: string, type: 'image' | 'video') {
    container.innerHTML = ''; 
    if (!variationsText || typeof variationsText !== 'string' ||
        variationsText.toLowerCase().includes("panggilan api gagal") ||
        variationsText.toLowerCase().includes("tidak ada konten teks yang dihasilkan") ||
        variationsText.toLowerCase().includes("respons diblokir oleh filter keamanan")) {
        let errorMessageContent = `Tidak ada variasi ${type} yang dapat ditampilkan.`;
        if (variationsText) {
            errorMessageContent = `Gagal memuat variasi ${type}: ${variationsText}`;
        }
        container.innerHTML = `<p class="text-slate-400 p-3">${errorMessageContent}</p>`; 
        if (variationsText) console.log("Raw variations text for " + type + ":", variationsText);
        return;
    }

    const lines = variationsText.split('\n').filter(line => line.trim() !== "");

    if (lines.length === 0) {
         container.innerHTML = `<p class="text-slate-400 p-3">Tidak ada variasi ${type} yang valid ditemukan dalam respons.</p>`; 
         return;
    }

    lines.slice(0, 5).forEach((line, index) => {
        let cleanedVariation = line;
        const match = cleanedVariation.match(/(?:\d+\.\s)?(.*)/s);
        if (match && match[1]) {
            cleanedVariation = match[1].trim();
        } else {
             cleanedVariation = cleanedVariation.replace(/^\d+\.\s*/, '').trim();
        }

        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'variation-item'; 

        if (!cleanedVariation.trim() || cleanedVariation.toLowerCase().startsWith("[gagal membuat prompt video")) {
            itemWrapper.classList.add('error'); 
            const pre = document.createElement('pre');
            pre.textContent = cleanedVariation || `Gagal membuat variasi ${type} #${index + 1}.`;
            itemWrapper.appendChild(pre);
            container.appendChild(itemWrapper);
            return;
        }

        const variationId = `${type}-variation-${index}`;
        const feedbackId = `${type}-feedback-${index}`;
        const featureResultId = `${type}-feature-result-${index}`;
        const featureLoaderId = `${type}-feature-loader-${index}`;
        const featureButtonId = `${type}-feature-button-${index}`;

        const numberColumn = document.createElement('div');
        numberColumn.className = 'variation-number-column'; 
        numberColumn.textContent = `${index + 1}.`;
        itemWrapper.appendChild(numberColumn);

        const contentColumn = document.createElement('div');
        contentColumn.className = 'variation-content-column'; 
        itemWrapper.appendChild(contentColumn);

        const pre = document.createElement('pre');
        pre.id = variationId;
        pre.textContent = cleanedVariation;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-button text-slate-300'; 
        copyBtn.setAttribute('aria-label', `Salin Variasi ${type} ${index + 1}`);
        copyBtn.title = `Salin Variasi ${type} ${index + 1}`;
        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        copyBtn.onclick = () => copyToClipboard(variationId, feedbackId);

        const feedbackSpan = document.createElement('span');
        feedbackSpan.id = feedbackId;
        feedbackSpan.className = 'copied-feedback'; 
        feedbackSpan.textContent = 'Disalin!';
        feedbackSpan.setAttribute('aria-live', 'polite');

        contentColumn.appendChild(pre);
        contentColumn.appendChild(copyBtn);
        contentColumn.appendChild(feedbackSpan);

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

        if (type === 'image') {
            featureButton.innerHTML = '✨ Deskripsikan Gaya Visual';
            featureButton.onclick = () => describeVisualStyle(cleanedVariation, featureResultId, featureLoaderId, featureButton);
        } else {
            featureButton.innerHTML = '✨ Kembangkan Mini-Narasi';
            featureButton.onclick = () => developMiniNarrative(cleanedVariation, featureResultId, featureLoaderId, featureButton);
        }
        
        contentColumn.appendChild(featureButton);
        contentColumn.appendChild(featureLoader);
        contentColumn.appendChild(featureResultDiv);

        container.appendChild(itemWrapper);
    });
     if (lines.length === 0 && !variationsText.toLowerCase().includes("tidak dapat menghasilkan")) {
        container.innerHTML = `<p class="text-slate-400 p-3">Gagal mem-parsing variasi ${type}.</p>`; 
    }
}

function displayError(message: string) {
    if(errorMessageText) errorMessageText.textContent = message;
    if(errorMessageDiv) errorMessageDiv.classList.remove('hidden');
    if(resultsDiv) resultsDiv.classList.add('hidden');
    if(downloadPromptsButton) { 
        downloadPromptsButton.disabled = true;
        downloadPromptsButton.classList.add('opacity-50', 'cursor-not-allowed', 'hidden');
    }
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
            feedbackEl.style.backgroundColor = '#38bdf8'; 
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

function handleDownloadPrompts() {
    const isOnlyImageChecked = onlyImageCheckbox.checked;
    const isOnlyVideoChecked = onlyVideoCheckbox.checked;

    let includeImageInDownload = true;
    let includeVideoInDownload = true;

    if (isOnlyImageChecked && !isOnlyVideoChecked) {
        includeVideoInDownload = false;
    } else if (isOnlyVideoChecked && !isOnlyImageChecked) {
        includeImageInDownload = false;
    }
    // If neither or both are checked, defaults are true, so both included.


    const imagePrompts: string[] = [];
    if (includeImageInDownload) {
        document.querySelectorAll('#imagePromptVariationsDiv .variation-content-column pre').forEach(pre => {
            const itemWrapper = pre.closest('.variation-item');
            if (pre.textContent && itemWrapper && !itemWrapper.classList.contains('error')) {
                const numberEl = itemWrapper.querySelector('.variation-number-column');
                const number = numberEl ? numberEl.textContent : '';
                imagePrompts.push(`${number} ${pre.textContent.trim()}`);
            }
        });
    }

    const videoPrompts: string[] = [];
     if (includeVideoInDownload) {
        document.querySelectorAll('#videoPromptVariationsDiv .variation-content-column pre').forEach(pre => {
            const itemWrapper = pre.closest('.variation-item');
            if (pre.textContent && itemWrapper && !itemWrapper.classList.contains('error')) {
                const numberEl = itemWrapper.querySelector('.variation-number-column');
                const number = numberEl ? numberEl.textContent : '';
                videoPrompts.push(`${number} ${pre.textContent.trim()}`);
            }
        });
    }

    if (imagePrompts.length === 0 && videoPrompts.length === 0) {
        console.warn("Tidak ada prompt untuk diunduh (berdasarkan pilihan).");
        return;
    }

    let content = "";
    if (includeImageInDownload) {
        content += "Hasil Prompt Gambar:\n";
        content += "--------------------------\n";
        content += imagePrompts.length > 0 ? imagePrompts.join('\n\n') : "Tidak ada prompt gambar yang ditampilkan/diminta.\n";
        if (includeVideoInDownload) content += "\n\n\n"; // Add more spacing if video follows
    }
    
    if (includeVideoInDownload) {
        content += "Hasil Prompt Adegan Video:\n";
        content += "------------------------------\n";
        content += videoPrompts.length > 0 ? videoPrompts.join('\n\n') : "Tidak ada prompt video yang ditampilkan/diminta.\n";
    }


    const blob = new Blob([content.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.T-]/g, '').substring(0,14); 
    a.download = `Prompt_Enhance_Pro_Hasil_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}