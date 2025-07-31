import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import ElectronStore from 'electron-store';
import sql from 'mssql';

// Declare the Vite env variables
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

if (started) {
  app.quit();
}

console.log("Env route : ", process.env.API_URL);

const API_URL="http://localhost:5000"
const API_URLS="https://fiscal-gem-mern.onrender.com"

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenant: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  lastLogin: string | null;
}

interface StoreSchema {
  auth: AuthStore;
}

interface InvoiceItem {
  lineNo: number;
  partNumber: string;
  description: string;
  quantity: number;
  priceEach: number;
  totalLineAmount: number;
}

interface Invoice {
  invoiceID: string;
  date: Date;
  customer: string;
  total: number;
  items: InvoiceItem[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Initialize electron-store with proper typing
const schema = {
  auth: {
    type: 'object',
    properties: {
      isAuthenticated: { type: 'boolean' },
      user: {
        type: ['object', 'null'],
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string' },
          tenant: { type: 'string' }
        }
      },
      token: { type: ['string', 'null'] },
      lastLogin: { type: ['string', 'null'] }
    }
  }
};

const store = new ElectronStore<StoreSchema>({
  defaults: {
    auth: {
      isAuthenticated: false,
      user: null,
      token: null,
      lastLogin: null
    }
  },
  schema
});

let mainWindow: BrowserWindow | null = null;
let authWindow: BrowserWindow | null = null;

const createAuthWindow = () => {
  authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    authWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/login`);
  } else {
    authWindow.loadFile(
      path.join(__dirname, '../dist/renderer/index.html'),
      { hash: '/login' }
    );
  }

  if (process.env.NODE_ENV === 'development') {
    authWindow.webContents.openDevTools();
  }

  authWindow.on('closed', () => {
    authWindow = null;
  });
};

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      sandbox: true
    },
  });

  // Alternative CSP setting
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const csp = [
      `default-src 'self' ${API_URL}`,
      `connect-src 'self' ${API_URL}`,
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    ].join('; ');

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': csp
      }
    });
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '../dist/renderer/index.html')
    );
  }

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', () => {
  // Check authentication state from store
  const authState = store.get('auth');
  
  if (authState.isAuthenticated) {
    createMainWindow();
  } else {
    createAuthWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const authState = store.get('auth');
    if (authState.isAuthenticated) {
      createMainWindow();
    } else {
      createAuthWindow();
    }
  }
});

// IPC handlers for authentication
ipcMain.handle('login', async (event, credentials) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    
    // Update store with auth data
    store.set('auth', {
      isAuthenticated: true,
      user: data.user,
      token: data.token,
      lastLogin: new Date().toISOString()
    });
    
    // Close auth window and open main window
    if (authWindow) {
      authWindow.close();
    }
    createMainWindow();
    
    return { success: true, user: data.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('logout', async () => {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    // Clear auth data from store
    store.set('auth', {
      isAuthenticated: false,
      user: null,
      token: null,
      lastLogin: null
    });
    
    // Close main window and open auth window
    if (mainWindow) {
      mainWindow.close();
    }
    createAuthWindow();
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-auth', async () => {
  try {
    const authState = store.get('auth');
    const { isAuthenticated, token } = authState;
    
    if (!isAuthenticated || !token) {
      return { isAuthenticated: false, user: null };
    }
    
    // Verify token with backend
    const response = await fetch(`${process.env.API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      store.set('auth', {
        isAuthenticated: false,
        user: null,
        token: null,
        lastLogin: null
      });
      return { isAuthenticated: false, user: null };
    }
    
    const data = await response.json();
    
    // Update user data in store
    store.set('auth.user', data.user);
    
    return { isAuthenticated: true, user: data.user };
  } catch (error) {
    store.set('auth', {
      isAuthenticated: false,
      user: null,
      token: null,
      lastLogin: null
    });
    return { isAuthenticated: false, user: null };
  }
});

ipcMain.handle('get-auth-state', async () => {
  const authState = store.get('auth');
  return authState;
});

ipcMain.handle('fetchInvoices', async (): Promise<ApiResponse<Invoice[]>> => {
  const config = {
    user: 'sa',
    password: 'System"1',
    server: 'localhost\\SQLEXPRESS', 
    database: 'paldbCOMPULINKFISCALTEST',
    options: { encrypt: false, trustServerCertificate: true }
  };

  let pool;
  try {
    pool = await sql.connect(config);
    const query = `
      SELECT 
        doc.strInvDocID,
        doc.dteJournalDate,
        doc.strCustName,
        doc.decTotal,
        dt.intLineNo,
        dt.strPartNumber,
        dt.strPartDesc,
        dt.decQty,
        dt.decPriceEaExc,
        dt.decLineTotExc
      FROM dbo.tblInvoiceDoc AS doc
      INNER JOIN dbo.tblInvoiceDocDT AS dt 
        ON doc.strInvDocID = dt.strInvDocID
      ORDER BY doc.dteJournalDate DESC
    `;
    
    const result = await pool.request().query(query);
    
    const groupedInvoices = result.recordset.reduce((acc: any, item: any) => {
      const { strInvDocID } = item;
      if (!acc[strInvDocID]) {
        acc[strInvDocID] = {
          invoiceID: strInvDocID,
          date: item.dteJournalDate,
          customer: item.strCustName,
          total: item.decTotal,
          items: []
        };
      }
      acc[strInvDocID].items.push({
        lineNo: item.intLineNo,
        partNumber: item.strPartNumber,
        description: item.strPartDesc,
        quantity: item.decQty,
        priceEach: item.decPriceEaExc,
        totalLineAmount: item.decLineTotExc
      });
      return acc;
    }, {} as Record<string, Invoice>);

    return { 
      success: true,
      data: Object.values(groupedInvoices) 
    };
  } catch (error) {
    console.error('Database query failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch invoices'
    };
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});