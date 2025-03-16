import { log } from './utils.js';
import { getConfig } from '../config.js';
import { updateChunkStatus } from './progressUtils.js';

// Fonctions de transcription
export async function transcribeChunk(chunkBlob, apiKey, chunkIndex, batchIndex, timeout) {
    const formData = new FormData();
    formData.append("file", chunkBlob, `chunk_${chunkIndex}.wav`);
    formData.append("model", "whisper-1");
    formData.append("openaiKey", apiKey); // Envoyer la clé API au serveur

    try {
        log(`Traitement du morceau ${chunkIndex + 1} commencé`);
        
        // Déterminer si nous sommes dans la marketplace ou en mode standalone
        const isInMarketplace = window.location.pathname.includes('/transkryptor');
        
        // Construire l'URL de l'endpoint en fonction du contexte
        const apiPrefix = isInMarketplace ? '/transkryptor/api' : '';
        const API_URL = window.location.origin;
        const transcriptionEndpoint = `${API_URL}${apiPrefix}/transcribe`;
        
        const response = await axios.post(transcriptionEndpoint, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            timeout: timeout,
        });
        
        log(`Traitement du morceau ${chunkIndex + 1} terminé`);
        return response.data.text;
    } catch (error) {
        log(`Erreur lors de la transcription du morceau ${chunkIndex + 1}: ${error.message}`);
        throw error;
    }
}

export async function transcribeChunkWithRetry(chunkBlob, apiKey, chunkIndex, batchIndex, retries = 10) {
    const config = getConfig();
    updateChunkStatus(batchIndex, chunkIndex % config.batchSize, 'processing');
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const result = await transcribeChunk(chunkBlob, apiKey, chunkIndex, batchIndex, 20000 + attempt * 20000);
            updateChunkStatus(batchIndex, chunkIndex % config.batchSize, 'completed');
            return result;
        } catch (error) {
            if (attempt === retries - 1) {
                log(`Échec de la transcription du morceau ${chunkIndex + 1} après ${retries} tentatives: ${error.message}`);
                updateChunkStatus(batchIndex, chunkIndex % config.batchSize, 'error');
                return "";
            }
            log(`Tentative ${attempt + 1} échouée pour le morceau ${chunkIndex + 1}. Nouvelle tentative...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }
}
