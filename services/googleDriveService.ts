import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { AppData } from '../types';

// Initialize Firebase App if not already initialized
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Drive access
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let currentUser: User | null = null;

export const googleDriveService = {
  // Initialize Auth
  initAuth: (
    onAuthSuccess?: (user: User, token: string) => void,
    onAuthFailure?: () => void
  ) => {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        currentUser = user;
        if (cachedAccessToken) {
          if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        } else if (!isSigningIn) {
          // Token might have expired or needs fresh sign-in
          cachedAccessToken = null;
          if (onAuthFailure) onAuthFailure();
        }
      } else {
        currentUser = null;
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    });
  },

  // Sign In
  signIn: async (): Promise<{ user: User; accessToken: string } | null> => {
    try {
      isSigningIn = true;
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Failed to get access token from Google Auth');
      }
      cachedAccessToken = credential.accessToken;
      currentUser = result.user;
      return { user: result.user, accessToken: cachedAccessToken };
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      isSigningIn = false;
    }
  },

  // Get current state
  getAccessToken: () => cachedAccessToken,
  getCurrentUser: () => currentUser,
  isAuthenticated: () => !!cachedAccessToken,

  // Sign Out
  logout: async () => {
    await auth.signOut();
    cachedAccessToken = null;
    currentUser = null;
  },

  // Get or Create dedicated folder 'ASPPS Kabupaten Lebak'
  getOrCreateFolder: async (folderName: string = 'ASPPS Kabupaten Lebak'): Promise<string> => {
    const token = cachedAccessToken;
    if (!token) throw new Error('Not authenticated with Google');

    const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    const listRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!listRes.ok) {
      throw new Error('Failed to query folder in Google Drive');
    }

    const listData = await listRes.json();
    if (listData.files && listData.files.length > 0) {
      return listData.files[0].id;
    }

    // Create folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });

    if (!createRes.ok) {
      throw new Error('Failed to create folder in Google Drive');
    }

    const folder = await createRes.json();
    return folder.id;
  },

  // Upload file (metadata + content in 2-step process)
  uploadFile: async (fileName: string, mimeType: string, contentBlob: Blob, parents?: string[]): Promise<any> => {
    const token = cachedAccessToken;
    if (!token) throw new Error('Not authenticated with Google');

    // Step 1: Create metadata
    const metadataResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: fileName,
        mimeType: mimeType,
        parents: parents
      })
    });

    if (!metadataResponse.ok) {
      const err = await metadataResponse.text();
      console.error('Metadata creation failed:', err);
      throw new Error('Failed to create file metadata in Google Drive');
    }

    const metadata = await metadataResponse.json();
    const fileId = metadata.id;

    // Step 2: Upload media content
    const uploadResponse = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': mimeType
      },
      body: contentBlob
    });

    if (!uploadResponse.ok) {
      const err = await uploadResponse.text();
      console.error('Content upload failed:', err);
      throw new Error('Failed to upload file content to Google Drive');
    }

    return await uploadResponse.json();
  },

  // List backup files in the dedicated folder
  listBackups: async (folderId: string): Promise<any[]> => {
    const token = cachedAccessToken;
    if (!token) throw new Error('Not authenticated with Google');

    const query = encodeURIComponent(`'${folderId}' in parents and name contains 'backup_aspps' and trashed = false`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime%20desc&fields=files(id,name,createdTime,size)&pageSize=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error('Failed to list backups from Google Drive');
    }

    const data = await res.json();
    return data.files || [];
  },

  // Download backup content by file ID
  downloadBackup: async (fileId: string): Promise<AppData> => {
    const token = cachedAccessToken;
    if (!token) throw new Error('Not authenticated with Google');

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error('Failed to download backup file');
    }

    return await res.json();
  },

  // Delete a backup or file
  deleteFile: async (fileId: string): Promise<void> => {
    const token = cachedAccessToken;
    if (!token) throw new Error('Not authenticated with Google');

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error('Failed to delete file from Google Drive');
    }
  }
};
