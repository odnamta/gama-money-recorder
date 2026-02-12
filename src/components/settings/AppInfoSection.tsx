'use client'

import { ExternalLink, HelpCircle, Shield } from 'lucide-react'

// App version - update with each release
const APP_VERSION = '1.0.0'
const BUILD_DATE = '2026-02-01'

/**
 * App information section
 */
export function AppInfoSection() {
  return (
    <div className="bg-white rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-lg">Informasi Aplikasi</h3>
      
      {/* Version Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Versi</span>
          <span className="text-sm font-mono font-medium">v{APP_VERSION}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Build</span>
          <span className="text-sm font-mono">{BUILD_DATE}</span>
        </div>
      </div>
      
      {/* Links */}
      <div className="space-y-2 pt-2 border-t">
        <a
          href="https://github.com/odnamta/gama-money-recorder"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Bantuan & Dokumentasi</span>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </a>
        
        <a
          href="https://gama-group.co/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Kebijakan Privasi</span>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </a>
      </div>
      
      {/* Copyright */}
      <div className="pt-2 border-t">
        <p className="text-xs text-center text-muted-foreground">
          © 2026 GAMA Group. All rights reserved.
        </p>
      </div>
    </div>
  )
}