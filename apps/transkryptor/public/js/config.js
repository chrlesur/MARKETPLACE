const CONFIG = {
    version: '3.1.0',
    chunkDuration: 60, // 60 secondes par morceau
    chunkOverlap: 0.03, // 30 ms de chevauchement
    batchSize: 10, // 10 morceaux par lot
    anthropicVersion: '2023-06-01',
    storage: {
        openaiKey: 'transkryptor_openai_key',
        anthropicKey: 'transkryptor_anthropic_key'
    }
};

// Mise à jour de la version dans l'interface
function updateVersion() {
    const config = getConfig();
    document.title = `TransKryptor v${config.version}`;
    const h1Element = document.querySelector('h1');
    if (h1Element) {
        h1Element.textContent = `Transkryptor v${config.version} - (c) Christophe Lesur - Cloud Temple - 2025`;
    }
}

// Exécuter au chargement
document.addEventListener('DOMContentLoaded', updateVersion);

// Fonction pour obtenir la configuration
export function getConfig() {
    // Calculer l'URL de l'API au moment de l'appel
    const API_URL = window.location.origin;
    
    // Déterminer si nous sommes dans la marketplace ou en mode standalone
    const isInMarketplace = window.location.pathname.includes('/transkryptor');
    
    // Construire les URLs des endpoints en fonction du contexte
    const apiPrefix = isInMarketplace ? '/transkryptor/api' : '';
    
    return {
        ...CONFIG,
        apiEndpoints: {
            testKeys: `${API_URL}${apiPrefix}/test-keys`,
            analyze: `${API_URL}${apiPrefix}/analyze`
        }
    };
}

export { updateVersion };
