/**
 * Pomoćne funkcije
 */

export const slugify = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Zameni razmake crticama
        .replace(/[^\w-]+/g, '')       // Ukloni sve non-word karaktere osim crtica
        .replace(/--+/g, '-')          // Zameni višestruke crtice jednom
        .replace(/^-+/, '')            // Ukloni crtice sa početka
        .replace(/-+$/, '');           // Ukloni crtice sa kraja
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-Latn-RS', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};
