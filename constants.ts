
import { Operator } from './types';

// Lista inizialmente vuota, popolata tramite Sync
export const DEFAULT_OPERATORS: Operator[] = [];

export const EMAIL_RECIPIENT = 'security@alfadectives.it';
export const WHATSAPP_RECIPIENT = '+393481260040';

// Google API Configuration
export const DRIVE_API_KEY = 'AIzaSyCwqdJqvI-K_8rsJAH9VWN9riT1rMp1naE';
export const GDrive_FILE_ID = '14URXNyPEIwzJLzXpw_kvSccCzjhkZAadgRpMGSoSq-w';

/**
 * Endpoint ufficiale Google Drive API v3 per l'esportazione di Google Docs in formato testo.
 * L'utilizzo dell'API Key ufficiale elimina la necessità di proxy CORS.
 */
export const getDriveExportUrl = (fileId: string) => 
  `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain&key=${DRIVE_API_KEY}`;
