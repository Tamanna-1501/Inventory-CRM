'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { loadPreferences } from '@/features/preferences/services/preferencesService';

const DEFAULT_PREFERENCES = {
  currencyCode: 'INR', currencySymbol: '\u20B9', currencyPosition: 'prefix', decimalDigits: 2, defaultLanguage: 'en',
};
const LOCAL_KEYS = ['currencyCode', 'currencySymbol', 'currencyPosition', 'decimalDigits', 'defaultLanguage'];
const TEXT = {
  hi: {
    Dashboard: '\u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921', Products: '\u0909\u0924\u094d\u092a\u093e\u0926', Trading: '\u0935\u094d\u092f\u093e\u092a\u093e\u0930', Expense: '\u0916\u0930\u094d\u091a', People: '\u0932\u094b\u0917',
    'User Management': '\u0909\u092a\u092f\u094b\u0917\u0915\u0930\u094d\u0924\u093e \u092a\u094d\u0930\u092c\u0902\u0927\u0928', Transfer: '\u0938\u094d\u0925\u093e\u0928\u093e\u0902\u0924\u0930\u0923', Reports: '\u0930\u093f\u092a\u094b\u0930\u094d\u091f', Warehouse: '\u0917\u094b\u0926\u093e\u092e',
    'Internal mail': '\u0906\u0902\u0924\u0930\u093f\u0915 \u092e\u0947\u0932', 'Administrative Tools': '\u092a\u094d\u0930\u0936\u093e\u0938\u0928\u093f\u0915 \u0909\u092a\u0915\u0930\u0923', 'Role Permission': '\u092d\u0942\u092e\u093f\u0915\u093e \u0905\u0928\u0941\u092e\u0924\u093f',
    'Audit Log': '\u0911\u0921\u093f\u091f \u0932\u0949\u0917', Settings: '\u0938\u0947\u091f\u093f\u0902\u0917\u094d\u0938', 'System Setting': '\u0938\u093f\u0938\u094d\u091f\u092e \u0938\u0947\u091f\u093f\u0902\u0917', 'Theme Setting': '\u0925\u0940\u092e \u0938\u0947\u091f\u093f\u0902\u0917',
    'Currency Setting': '\u092e\u0941\u0926\u094d\u0930\u093e \u0938\u0947\u091f\u093f\u0902\u0917', 'POS Setting': 'POS \u0938\u0947\u091f\u093f\u0902\u0917', Language: '\u092d\u093e\u0937\u093e', 'Time & Date': '\u0938\u092e\u092f \u0914\u0930 \u0924\u093e\u0930\u0940\u0916',
    'Create Role': '\u092d\u0942\u092e\u093f\u0915\u093e \u092c\u0928\u093e\u090f\u0902', 'Backup Database': '\u0921\u0947\u091f\u093e\u092c\u0947\u0938 \u092c\u0948\u0915\u0905\u092a', 'Add Product': '\u0909\u0924\u094d\u092a\u093e\u0926 \u091c\u094b\u0921\u093c\u0947\u0902',
    'Product List': '\u0909\u0924\u094d\u092a\u093e\u0926 \u0938\u0942\u091a\u0940', 'Sales List': '\u092c\u093f\u0915\u094d\u0930\u0940 \u0938\u0942\u091a\u0940', 'Transfer List': '\u0938\u094d\u0925\u093e\u0928\u093e\u0902\u0924\u0930\u0923 \u0938\u0942\u091a\u0940',
    'System settings': '\u0938\u093f\u0938\u094d\u091f\u092e \u0938\u0947\u091f\u093f\u0902\u0917', 'Theme settings': '\u0925\u0940\u092e \u0938\u0947\u091f\u093f\u0902\u0917', 'Currency settings': '\u092e\u0941\u0926\u094d\u0930\u093e \u0938\u0947\u091f\u093f\u0902\u0917',
    'Language settings': '\u092d\u093e\u0937\u093e \u0938\u0947\u091f\u093f\u0902\u0917', Appearance: '\u0930\u0942\u092a', Currency: '\u092e\u0941\u0926\u094d\u0930\u093e', 'Company details': '\u0915\u0902\u092a\u0928\u0940 \u0915\u093e \u0935\u093f\u0935\u0930\u0923',
    'Company name': '\u0915\u0902\u092a\u0928\u0940 \u0915\u093e \u0928\u093e\u092e', 'Company email': '\u0915\u0902\u092a\u0928\u0940 \u0908\u092e\u0947\u0932', 'Phone number': '\u092b\u094b\u0928 \u0928\u0902\u092c\u0930',
    'Currency name': '\u092e\u0941\u0926\u094d\u0930\u093e \u0915\u093e \u0928\u093e\u092e', 'Currency code': '\u092e\u0941\u0926\u094d\u0930\u093e \u0915\u094b\u0921', 'Currency symbol': '\u092e\u0941\u0926\u094d\u0930\u093e \u091a\u093f\u0939\u094d\u0928', 'Symbol position': '\u091a\u093f\u0939\u094d\u0928 \u0915\u0940 \u0938\u094d\u0925\u093f\u0924\u093f', 'Decimal digits': '\u0926\u0936\u092e\u0932\u0935 \u0905\u0902\u0915',
    'Save currency': '\u092e\u0941\u0926\u094d\u0930\u093e \u0938\u0939\u0947\u091c\u0947\u0902', 'Default language': '\u0921\u093f\u092b\u093c\u0949\u0932\u094d\u091f \u092d\u093e\u0937\u093e', 'Save language': '\u092d\u093e\u0937\u093e \u0938\u0939\u0947\u091c\u0947\u0902',
    Search: '\u0916\u094b\u091c\u0947\u0902', Save: '\u0938\u0939\u0947\u091c\u0947\u0902', Cancel: '\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902', Delete: '\u0939\u091f\u093e\u090f\u0902', 'Sign out': '\u0938\u093e\u0907\u0928 \u0906\u0909\u091f',
  },
  es: {
    Dashboard: 'Panel', Products: 'Productos', Trading: 'Comercio', Expense: 'Gastos', People: 'Personas', 'User Management': 'Gesti\u00f3n de usuarios', Transfer: 'Transferencias', Reports: 'Informes', Warehouse: 'Almac\u00e9n',
    'Internal mail': 'Correo interno', 'Administrative Tools': 'Herramientas administrativas', 'Role Permission': 'Permisos de roles', 'Audit Log': 'Registro de auditor\u00eda', Settings: 'Configuraci\u00f3n',
    'System Setting': 'Configuraci\u00f3n del sistema', 'Theme Setting': 'Configuraci\u00f3n del tema', 'Currency Setting': 'Configuraci\u00f3n de moneda', 'POS Setting': 'Configuraci\u00f3n de TPV', Language: 'Idioma', 'Time & Date': 'Fecha y hora',
    'Create Role': 'Crear rol', 'Backup Database': 'Copia de seguridad', 'Add Product': 'A\u00f1adir producto', 'Product List': 'Lista de productos', 'Sales List': 'Lista de ventas', 'Transfer List': 'Lista de transferencias',
    'System settings': 'Configuraci\u00f3n del sistema', 'Theme settings': 'Configuraci\u00f3n del tema', 'Currency settings': 'Configuraci\u00f3n de moneda', 'Language settings': 'Configuraci\u00f3n de idioma', Appearance: 'Apariencia', Currency: 'Moneda',
    'Company details': 'Datos de la empresa', 'Company name': 'Nombre de la empresa', 'Company email': 'Correo de la empresa', 'Phone number': 'Tel\u00e9fono', 'Currency name': 'Nombre de moneda', 'Currency code': 'C\u00f3digo de moneda', 'Currency symbol': 'S\u00edmbolo de moneda',
    'Symbol position': 'Posici\u00f3n del s\u00edmbolo', 'Decimal digits': 'Decimales', 'Save currency': 'Guardar moneda', 'Default language': 'Idioma predeterminado', 'Save language': 'Guardar idioma', Search: 'Buscar', Save: 'Guardar', Cancel: 'Cancelar', Delete: 'Eliminar', 'Sign out': 'Cerrar sesi\u00f3n',
  },
  fr: {
    Dashboard: 'Tableau de bord', Products: 'Produits', Trading: 'Commerce', Expense: 'D\u00e9penses', People: 'Contacts', 'User Management': 'Gestion des utilisateurs', Transfer: 'Transferts', Reports: 'Rapports', Warehouse: 'Entrep\u00f4t',
    'Internal mail': 'Messagerie interne', 'Administrative Tools': 'Outils administratifs', 'Role Permission': 'Permissions des r\u00f4les', 'Audit Log': 'Journal d’audit', Settings: 'Param\u00e8tres',
    'System Setting': 'Param\u00e8tres syst\u00e8me', 'Theme Setting': 'Param\u00e8tres du th\u00e8me', 'Currency Setting': 'Param\u00e8tres de devise', 'POS Setting': 'Param\u00e8tres du PDV', Language: 'Langue', 'Time & Date': 'Date et heure',
    'Create Role': 'Cr\u00e9er un r\u00f4le', 'Backup Database': 'Sauvegarde', 'Add Product': 'Ajouter un produit', 'Product List': 'Liste des produits', 'Sales List': 'Liste des ventes', 'Transfer List': 'Liste des transferts',
    'System settings': 'Param\u00e8tres syst\u00e8me', 'Theme settings': 'Param\u00e8tres du th\u00e8me', 'Currency settings': 'Param\u00e8tres de devise', 'Language settings': 'Param\u00e8tres de langue', Appearance: 'Apparence', Currency: 'Devise',
    'Company details': 'D\u00e9tails de l’entreprise', 'Company name': 'Nom de l’entreprise', 'Company email': 'E-mail de l’entreprise', 'Phone number': 'T\u00e9l\u00e9phone', 'Currency name': 'Nom de la devise', 'Currency code': 'Code de devise', 'Currency symbol': 'Symbole de devise',
    'Symbol position': 'Position du symbole', 'Decimal digits': 'D\u00e9cimales', 'Save currency': 'Enregistrer la devise', 'Default language': 'Langue par d\u00e9faut', 'Save language': 'Enregistrer la langue', Search: 'Rechercher', Save: 'Enregistrer', Cancel: 'Annuler', Delete: 'Supprimer', 'Sign out': 'D\u00e9connexion',
  },
  ar: {
    Dashboard: '\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645', Products: '\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a', Trading: '\u0627\u0644\u062a\u062c\u0627\u0631\u0629', Expense: '\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062a', People: '\u0627\u0644\u0623\u0634\u062e\u0627\u0635',
    'User Management': '\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646', Transfer: '\u0627\u0644\u062a\u062d\u0648\u064a\u0644\u0627\u062a', Reports: '\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631', Warehouse: '\u0627\u0644\u0645\u0633\u062a\u0648\u062f\u0639',
    'Internal mail': '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u062f\u0627\u062e\u0644\u064a', 'Administrative Tools': '\u0623\u062f\u0648\u0627\u062a \u0627\u0644\u0625\u062f\u0627\u0631\u0629', 'Role Permission': '\u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0627\u0644\u0623\u062f\u0648\u0627\u0631',
    'Audit Log': '\u0633\u062c\u0644 \u0627\u0644\u062a\u062f\u0642\u064a\u0642', Settings: '\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a', 'System Setting': '\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0646\u0638\u0627\u0645', 'Theme Setting': '\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u0638\u0647\u0631',
    'Currency Setting': '\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0629', 'POS Setting': '\u0625\u0639\u062f\u0627\u062f\u0627\u062a POS', Language: '\u0627\u0644\u0644\u063a\u0629', 'Time & Date': '\u0627\u0644\u0648\u0642\u062a \u0648\u0627\u0644\u062a\u0627\u0631\u064a\u062e',
    'Create Role': '\u0625\u0646\u0634\u0627\u0621 \u062f\u0648\u0631', 'Backup Database': '\u0646\u0633\u062e\u0629 \u0627\u062d\u062a\u064a\u0627\u0637\u064a\u0629', 'Add Product': '\u0625\u0636\u0627\u0641\u0629 \u0645\u0646\u062a\u062c', 'Product List': '\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a', 'Sales List': '\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a',
    'System settings': '\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0646\u0638\u0627\u0645', 'Theme settings': '\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u0638\u0647\u0631', 'Currency settings': '\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0629', 'Language settings': '\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0644\u063a\u0629', Appearance: '\u0627\u0644\u0645\u0638\u0647\u0631', Currency: '\u0627\u0644\u0639\u0645\u0644\u0629',
    'Company details': '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0634\u0631\u0643\u0629', 'Company name': '\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629', 'Company email': '\u0628\u0631\u064a\u062f \u0627\u0644\u0634\u0631\u0643\u0629', 'Phone number': '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641', 'Currency name': '\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u0644\u0629', 'Currency code': '\u0631\u0645\u0632 \u0627\u0644\u0639\u0645\u0644\u0629',
    'Currency symbol': '\u0631\u0645\u0632 \u0627\u0644\u0639\u0645\u0644\u0629', 'Symbol position': '\u0645\u0648\u0636\u0639 \u0627\u0644\u0631\u0645\u0632', 'Decimal digits': '\u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0639\u0634\u0631\u064a\u0629', 'Save currency': '\u062d\u0641\u0638 \u0627\u0644\u0639\u0645\u0644\u0629', 'Default language': '\u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629', 'Save language': '\u062d\u0641\u0638 \u0627\u0644\u0644\u063a\u0629', Search: '\u0628\u062d\u062b', Save: '\u062d\u0641\u0638', Cancel: '\u0625\u0644\u063a\u0627\u0621', Delete: '\u062d\u0630\u0641', 'Sign out': '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c',
  },
};
const LOCALES = { en: 'en-IN', hi: 'hi-IN', ar: 'ar-AE', es: 'es-ES', fr: 'fr-FR' };
const PreferencesContext = createContext({ preferences: DEFAULT_PREFERENCES, formatCurrency: (value) => `\u20B9 ${Number(value || 0).toFixed(2)}`, t: (text) => text, updatePreferences: () => {} });

export function PreferencesProvider({ children }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const companyId = user?.companyId;

  const persistLocal = useCallback((next) => {
    if (!companyId || typeof window === 'undefined') return;
    const stored = Object.fromEntries(LOCAL_KEYS.filter((name) => next[name] !== undefined).map((name) => [name, next[name]]));
    localStorage.setItem(`inventual_preferences_${companyId}`, JSON.stringify(stored));
  }, [companyId]);

  const updatePreferences = useCallback((next) => {
    setPreferences((current) => {
      const updated = { ...current, ...next };
      persistLocal(updated);
      return updated;
    });
  }, [persistLocal]);

  useEffect(() => {
    if (!companyId) {
      setPreferences(DEFAULT_PREFERENCES);
      return undefined;
    }
    let active = true;
    let local = {};
    try { local = JSON.parse(localStorage.getItem(`inventual_preferences_${companyId}`) || '{}'); } catch { local = {}; }
    setPreferences({ ...DEFAULT_PREFERENCES, ...local });
    loadPreferences(Boolean(user?.isAdmin)).then((loaded) => {
      if (!active) return;
      const merged = { ...DEFAULT_PREFERENCES, ...local, ...loaded };
      setPreferences(merged);
      persistLocal(merged);
    }).catch(() => {});
    return () => { active = false; };
  }, [companyId, user?.isAdmin, persistLocal]);

  const formatCurrency = useCallback((value) => {
    const number = Number(value ?? 0);
    const digits = Number.isInteger(Number(preferences.decimalDigits)) ? Math.min(4, Math.max(0, Number(preferences.decimalDigits))) : 2;
    let amount;
    try {
      amount = new Intl.NumberFormat(LOCALES[preferences.defaultLanguage] || 'en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number.isFinite(number) ? number : 0);
    } catch {
      amount = (Number.isFinite(number) ? number : 0).toFixed(digits);
    }
    const symbol = String(preferences.currencySymbol || preferences.currencyCode || '\u20B9').trim();
    return preferences.currencyPosition === 'suffix' ? `${amount} ${symbol}` : `${symbol} ${amount}`;
  }, [preferences]);

  const t = useCallback((text) => TEXT[preferences.defaultLanguage]?.[text] || text, [preferences.defaultLanguage]);

  useEffect(() => {
    const language = preferences.defaultLanguage || 'en';
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [preferences.defaultLanguage]);

  const value = useMemo(() => ({ preferences, formatCurrency, t, updatePreferences }), [preferences, formatCurrency, t, updatePreferences]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export const usePreferences = () => useContext(PreferencesContext);
