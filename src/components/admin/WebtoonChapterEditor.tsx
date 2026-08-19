import React, { useState, useRef } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  Upload,
  Image as ImageIcon,
  MoveUp,
  MoveDown,
  Trash2,
  Plus,
  Layers,
  Sparkles,
  CheckCircle2,
  FileArchive,
  ArrowRight,
  Info,
  Sliders,
  Music,
  Volume2,
  Play,
  Pause,
} from 'lucide-react';
import { Chapter, ChapterPage } from '../../types';

interface WebtoonChapterEditorProps {
  workId: string;
  chapterToEdit?: Chapter | null;
  onClose: () => void;
  onSaved: () => void;
}

export const WebtoonChapterEditor: React.FC<WebtoonChapterEditorProps> = ({
  workId,
  chapterToEdit,
  onClose,
  onSaved,
}) => {
  const { works, chapters, addChapter, updateChapter, showToast } = useOzi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentWork = works.find((w) => w.id === workId) || works[0];
  const existingWorkChapters = chapters.filter((c) => c.workId === (currentWork?.id || workId));

  const [chapterNumber, setChapterNumber] = useState<number>(
    chapterToEdit ? chapterToEdit.chapterNumber : existingWorkChapters.length + 1
  );
  const [chapterTitle, setChapterTitle] = useState<string>(
    chapterToEdit ? chapterToEdit.title : `Épisode ${existingWorkChapters.length + 1}`
  );
  const [isFree, setIsFree] = useState<boolean>(chapterToEdit ? !chapterToEdit.isLocked : true);
  const [coinPrice, setCoinPrice] = useState<number>(chapterToEdit?.coinPrice || 5);
  const [audioUrl, setAudioUrl] = useState<string>(chapterToEdit?.audioUrl || '');
  const [audioTitle, setAudioTitle] = useState<string>(chapterToEdit?.audioTitle || '');
  const [audioArtist, setAudioArtist] = useState<string>(chapterToEdit?.audioArtist || '');

  // Liste ordonnée des tranches d'images verticales (Image 1 -> 2000px, Image 2 -> 2000px...)
  const [slices, setSlices] = useState<ChapterPage[]>(
    chapterToEdit?.pages && chapterToEdit.pages.length > 0
      ? chapterToEdit.pages
      : [
          {
            id: `p-${Date.now()}-1`,
            pageNumber: 1,
            imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=85',
            altText: 'Tranche 1 (0px - 2000px)',
          },
          {
            id: `p-${Date.now()}-2`,
            pageNumber: 2,
            imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=85',
            altText: 'Tranche 2 (2000px - 4000px)',
          },
        ]
  );

  const [urlsInput, setUrlsInput] = useState<string>('');
  const [previewSeamless, setPreviewSeamless] = useState<boolean>(false);

  // Upload direct de fichiers locaux découpés (images multiples ordonnées)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convertir les fichiers en URLs d'aperçu / base64 dans l'ordre naturel des noms de fichiers
    const fileArray = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const newSlices: ChapterPage[] = fileArray.map((file, idx) => {
      const blobUrl = URL.createObjectURL(file);
      return {
        id: `slice-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        pageNumber: slices.length + idx + 1,
        imageUrl: blobUrl,
        altText: file.name,
      };
    });

    setSlices((prev) => [...prev, ...newSlices]);
    showToast(`${newSlices.length} tranches d'images importées avec succès dans l'ordre !`, 'success');
  };

  // Ajout par lot d'URLs d'images découpées (CDN / Cloudinary / Supabase / Imgur)
  const handleAddBatchUrls = () => {
    if (!urlsInput.trim()) return;
    const lines = urlsInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const newPages: ChapterPage[] = lines.map((url, i) => ({
      id: `slice-${Date.now()}-${i}`,
      pageNumber: slices.length + i + 1,
      imageUrl: url,
      altText: `Tranche ${slices.length + i + 1}`,
    }));

    setSlices((prev) => [...prev, ...newPages]);
    setUrlsInput('');
    showToast(`${newPages.length} images ajoutées à la suite verticale.`, 'success');
  };

  // Déplacement haut / bas pour ajuster l'ordre
  const handleMoveSlice = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= slices.length) return;

    const copy = [...slices];
    const item = copy[index];
    copy[index] = copy[nextIdx];
    copy[nextIdx] = item;

    // Réordonner les numéros de page
    copy.forEach((p, idx) => {
      p.pageNumber = idx + 1;
    });

    setSlices(copy);
  };

  const handleRemoveSlice = (index: number) => {
    const copy = slices.filter((_, i) => i !== index);
    copy.forEach((p, idx) => {
      p.pageNumber = idx + 1;
    });
    setSlices(copy);
  };

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const togglePreviewAudio = () => {
    if (!audioUrl) return;
    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio(audioUrl);
      audioPreviewRef.current.loop = true;
    }
    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.src = audioUrl;
      audioPreviewRef.current.play().catch(() => {
        showToast('Impossible de lire l’aperçu audio.', 'error');
      });
      setIsPlayingPreview(true);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (slices.length === 0) {
      showToast('Veuillez ajouter au moins une image découpée.', 'error');
      return;
    }

    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }

    const payload = {
      workId: currentWork?.id || workId,
      chapterNumber,
      title: chapterTitle,
      pages: slices,
      isLocked: !isFree,
      coinPrice: isFree ? 0 : coinPrice,
      audioUrl: audioUrl.trim() || undefined,
      audioTitle: audioTitle.trim() || undefined,
      audioArtist: audioArtist.trim() || undefined,
      releaseDate: new Date().toISOString().slice(0, 10),
    };

    if (chapterToEdit) {
      updateChapter(chapterToEdit.id, payload);
      showToast(`Épisode ${chapterNumber} mis à jour avec ${slices.length} tranches verticales.`, 'success');
    } else {
      addChapter(payload);
      showToast(`Épisode ${chapterNumber} publié avec succès !`, 'success');
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0e101a] border border-white/10 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl my-6 space-y-4 max-h-[92vh] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Header de la modale */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff5a50]/20 border border-[#ff5a50]/40 flex items-center justify-center text-[#ff5a50]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {chapterToEdit ? `Modifier : ${chapterToEdit.title}` : 'Publier un Épisode Webtoon Vertical'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Série : <span className="text-white font-bold">{currentWork?.title}</span> • Empilement sans couture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Formulaire Principal */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          
          {/* Métadonnées de l'épisode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#141624] p-3.5 rounded-2xl border border-white/5">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Numéro d'épisode</label>
              <input
                type="number"
                min={1}
                required
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseInt(e.target.value, 10))}
                className="w-full bg-[#1b1e32] border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#ff5a50]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">Titre de l'épisode</label>
              <input
                type="text"
                required
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Ex: Épisode 1 : Le Réveil du Monarque"
                className="w-full bg-[#1b1e32] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ff5a50]"
              />
            </div>

            <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="freeCheck"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="w-4 h-4 accent-[#ff5a50] rounded cursor-pointer"
                />
                <label htmlFor="freeCheck" className="text-white font-bold cursor-pointer">
                  Épisode Gratuit (Accès libre à tous les lecteurs)
                </label>
              </div>

              {!isFree && (
                <div className="flex items-center gap-2 animate-in fade-in">
                  <span className="text-slate-400">Prix Fast-Pass :</span>
                  <input
                    type="number"
                    min={1}
                    value={coinPrice}
                    onChange={(e) => setCoinPrice(parseInt(e.target.value, 10))}
                    className="w-16 bg-[#1b1e32] border border-amber-500/40 rounded-xl px-2 py-1 text-amber-400 font-black text-center"
                  />
                  <span className="text-amber-400 font-bold">Coins</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION : MUSIQUE & OST DU CHAPITRE (LECTURE EN BOUCLE) */}
          <div className="p-3.5 bg-[#141624] border border-cyan-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Music className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Bande-Son & OST Immersive (Lecture en boucle)</h4>
                  <p className="text-[10px] text-slate-400">
                    La musique démarre dès l'ouverture du chapitre et s'ajuste au volume du lecteur.
                  </p>
                </div>
              </div>

              {audioUrl && (
                <button
                  type="button"
                  onClick={togglePreviewAudio}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    isPlayingPreview
                      ? 'bg-cyan-500 text-slate-950 font-black shadow'
                      : 'bg-white/10 text-cyan-300 hover:text-white'
                  }`}
                >
                  {isPlayingPreview ? (
                    <>
                      <Pause className="w-3 h-3" /> Arrêter l’aperçu
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" /> Tester l’audio
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="sm:col-span-3">
                <label className="block text-slate-300 font-bold mb-1">
                  URL du fichier Audio (MP3, AAC, OGG, CDN...)
                </label>
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://mon-serveur.com/ost-chapitre1.mp3"
                  className="w-full bg-[#1b1e32] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold mb-1">Titre de la musique (Optionnel)</label>
                <input
                  type="text"
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  placeholder="Ex: Awakening Theme / Donjon Sombre"
                  className="w-full bg-[#1b1e32] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Compositeur (Optionnel)</label>
                <input
                  type="text"
                  value={audioArtist}
                  onChange={(e) => setAudioArtist(e.target.value)}
                  placeholder="Ex: OZI Sound Lab"
                  className="w-full bg-[#1b1e32] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Presets rapides de musiques libres de droits pour tests */}
            <div className="pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto text-[10px] pb-1">
              <span className="text-slate-400 shrink-0 font-bold">Suggestions libres :</span>
              <button
                type="button"
                onClick={() => {
                  setAudioUrl('https://cdn.freesound.org/previews/563/563814_11861866-lq.mp3');
                  setAudioTitle('Thème Donjon Épique');
                  setAudioArtist('Orchestral OZI');
                  showToast('Piste "Thème Donjon Épique" sélectionnée !', 'info');
                }}
                className="px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:text-white whitespace-nowrap cursor-pointer"
              >
                ⚔️ Donjon Épique
              </button>
              <button
                type="button"
                onClick={() => {
                  setAudioUrl('https://cdn.freesound.org/previews/557/557815_12048995-lq.mp3');
                  setAudioTitle('Ambiance Mystique & Ombre');
                  setAudioArtist('OZI Ambient');
                  showToast('Piste "Ambiance Mystique" sélectionnée !', 'info');
                }}
                className="px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:text-white whitespace-nowrap cursor-pointer"
              >
                🌌 Mystique & Magie
              </button>
              <button
                type="button"
                onClick={() => {
                  setAudioUrl('https://cdn.freesound.org/previews/612/612089_11861866-lq.mp3');
                  setAudioTitle('Cyberpunk Synthwave Run');
                  setAudioArtist('Neon Wave');
                  showToast('Piste "Cyberpunk Synthwave" sélectionnée !', 'info');
                }}
                className="px-2 py-0.5 rounded-lg bg-pink-950/60 border border-pink-500/30 text-pink-300 hover:text-white whitespace-nowrap cursor-pointer"
              >
                ⚡ Cyberpunk Action
              </button>
            </div>
          </div>

          {/* EXPLICATION DU CONCEPT WEBTOON SLICING */}
          <div className="p-3 bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/30 rounded-2xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-white">Découpage 20 000 px vertical :</strong> Uploadez vos tranches d'images (ex: 2000px chacune). Le lecteur OZI les assemble automatiquement <strong>bord à bord sans aucune coupure</strong>, créant une lecture continue fluide au défilement.
            </div>
          </div>

          {/* ZONE 1 : UPLOAD MULTIPLE DE FICHIERS DÉCOUPÉS */}
          <div className="p-4 bg-[#141624] border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl space-y-3 transition-colors text-center">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow cursor-pointer tap-active inline-flex items-center gap-1.5"
              >
                <FileArchive className="w-4 h-4" />
                <span>Sélectionner les images découpées (01.jpg, 02.jpg...)</span>
              </button>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Sélectionnez d'un coup toutes les images (PNG, JPG, WEBP) de votre épisode dans l'ordre.
              </p>
            </div>
          </div>

          {/* ZONE 2 : OU AJOUT PAR LOT D'URLS WEB */}
          <div className="p-3.5 bg-[#141624] border border-white/5 rounded-2xl space-y-2">
            <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span>Ou coller une liste d'URLs d'images (1 par ligne)</span>
              <span className="text-slate-500 font-normal">CDN / Imgur / Hébergeur</span>
            </label>
            <textarea
              rows={2}
              value={urlsInput}
              onChange={(e) => setUrlsInput(e.target.value)}
              placeholder="https://mon-serveur.com/chapitre1/01.webp&#10;https://mon-serveur.com/chapitre1/02.webp&#10;https://mon-serveur.com/chapitre1/03.webp"
              className="w-full bg-[#1b1e32] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff5a50] font-mono text-[11px]"
            />
            <button
              type="button"
              onClick={handleAddBatchUrls}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs cursor-pointer tap-active"
            >
              + Ajouter les URLs à la suite
            </button>
          </div>

          {/* LISTE DES TRANCHES ORDONNÉES & APERÇU SANS COUTURE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-black text-white text-xs flex items-center gap-2">
                <span>Tranches assemblées :</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ff5a50]/20 text-[#ff5a50] border border-[#ff5a50]/30 font-mono font-bold">
                  {slices.length} images ({slices.length * 2000} px est.)
                </span>
              </label>

              <button
                type="button"
                onClick={() => setPreviewSeamless(!previewSeamless)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  previewSeamless
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>{previewSeamless ? 'Masquer Aperçu' : 'Aperçu Sans Couture'}</span>
              </button>
            </div>

            {/* Mode Aperçu Sans Couture Direct */}
            {previewSeamless ? (
              <div className="bg-black border border-white/20 rounded-2xl overflow-hidden max-h-80 overflow-y-auto scrollbar-thin p-1">
                <div className="w-full max-w-sm mx-auto flex flex-col items-center">
                  {slices.map((slice, idx) => (
                    <img
                      key={slice.id}
                      src={slice.imageUrl}
                      alt={`Tranche ${idx + 1}`}
                      className="w-full h-auto block select-none object-cover"
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Mode Gestion de l'ordre des planches */
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {slices.map((slice, idx) => (
                  <div
                    key={slice.id}
                    className="bg-[#141624] border border-white/5 rounded-2xl p-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-6 h-6 rounded-lg bg-black/60 text-white font-mono text-[10px] font-black flex items-center justify-center shrink-0 border border-white/10">
                        #{idx + 1}
                      </span>
                      <img
                        src={slice.imageUrl}
                        alt=""
                        className="w-10 h-12 object-cover rounded-lg bg-slate-900 shrink-0 border border-white/10"
                      />
                      <div className="truncate min-w-0">
                        <div className="text-white font-bold truncate">{slice.altText || `Tranche ${idx + 1}`}</div>
                        <div className="text-[10px] text-slate-400 truncate font-mono">{slice.imageUrl}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSlice(idx, 'up')}
                        className="p-1.5 bg-[#1f2238] hover:bg-[#2a2e4c] disabled:opacity-20 rounded-lg text-slate-300 cursor-pointer tap-active"
                        title="Monter"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === slices.length - 1}
                        onClick={() => handleMoveSlice(idx, 'down')}
                        className="p-1.5 bg-[#1f2238] hover:bg-[#2a2e4c] disabled:opacity-20 rounded-lg text-slate-300 cursor-pointer tap-active"
                        title="Descendre"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlice(idx)}
                        className="p-1.5 bg-red-950/50 hover:bg-red-900/80 text-red-300 rounded-lg cursor-pointer tap-active"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boutons d'action finaux */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#ff5a50] hover:bg-[#ff463b] text-white text-xs font-black rounded-xl shadow-lg shadow-[#ff5a50]/20 cursor-pointer tap-active flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{chapterToEdit ? 'Enregistrer les modifications' : 'Publier l’Épisode'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
