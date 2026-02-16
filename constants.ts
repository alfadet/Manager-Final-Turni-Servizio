
import { Operator } from './types';

// Lista inizialmente vuota per obbligare l'uso della "LISTA OPERATORI" del manager
export const DEFAULT_OPERATORS: Operator[] = [];

export const EMAIL_RECIPIENT = 'security@alfadectives.it';
export const WHATSAPP_RECIPIENT = '+393481260040';

// Google Drive Sync Configuration (Google Doc Sorgente)
export const GDrive_FILE_ID = '14URXNyPEIwzJLzXpw_kvSccCzjhkZAadgRpMGSoSq-w';

/**
 * Endpoint per l'esportazione testuale di un Google Doc.
 */
export const getDriveUrl = (id: string) => `https://docs.google.com/document/d/${id}/export?format=txt`;

/**
 * Utilizziamo corsproxy.io per superare le restrizioni CORS.
 * È più semplice e veloce di allorigins perché restituisce il contenuto raw.
 */
export const getProxyUrl = (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`;
