import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[OZI ErrorBoundary] Erreur capturée au niveau supérieur:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleResetCache = () => {
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith('ozi_'));
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch (err) {
        console.warn('Erreur lors du nettoyage de stockage local:', err);
      }
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          id="ozi-error-boundary-screen"
          className="min-h-screen bg-[#07080c] text-slate-100 flex flex-col items-center justify-center p-6 select-none font-['Plus_Jakarta_Sans',sans-serif]"
        >
          <div className="w-full max-w-sm bg-[#0e101a] border border-white/10 rounded-3xl p-6 text-center shadow-2xl space-y-5">
            {/* Icône OZI d'alerte bienveillante */}
            <div className="w-16 h-16 rounded-2xl bg-[#ff5a50]/15 border border-[#ff5a50]/30 text-[#ff5a50] flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>

            {/* Titre & Message */}
            <div>
              <h2 className="text-lg font-black text-white tracking-wide font-almodobar">
                {this.props.fallbackTitle || 'OZI — Petite pause technique'}
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Une interruption d'affichage a été interceptée. Vos lectures et progression sont en sécurité.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-2.5 pt-2">
              <button
                id="btn-error-reload"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-[#ff5a50] hover:bg-[#ff4236] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#ff5a50]/25 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recharger l'application</span>
              </button>

              <button
                id="btn-error-reset-cache"
                onClick={this.handleResetCache}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.98] text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Réinitialiser les données locales</span>
              </button>
            </div>

            {/* Détails techniques (repliables pour débogage si besoin) */}
            {this.state.error && (
              <details className="text-left pt-2">
                <summary className="text-[10px] text-slate-400 hover:text-slate-300 cursor-pointer text-center">
                  Afficher les détails de l'erreur
                </summary>
                <div className="mt-2 p-3 bg-black/40 rounded-xl border border-white/5 max-h-32 overflow-y-auto">
                  <p className="text-[10px] text-rose-400 font-mono break-all font-semibold">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                </div>
              </details>
            )}

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Système OZI Webtoon • Auto-protection</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
