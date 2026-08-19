import React, { useState } from 'react';
import { useOzi } from '../../context/OziContext';
import {
  X,
  Coins,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Smartphone,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  History,
  Lock,
  Phone,
  Check,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoinPack, PaymentMethodType } from '../../types';
import { OziLogo } from '../common/OziLogo';

export const CoinShopModal: React.FC = () => {
  const {
    isCoinShopOpen,
    closeCoinShop,
    coinPacks,
    currentUser,
    rechargeCoins,
    targetLockedChapter,
    unlockChapterWithCoins,
    openReader,
    showToast,
  } = useOzi();

  const [selectedPack, setSelectedPack] = useState<CoinPack>(coinPacks[1] || coinPacks[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('wave');
  const [currency, setCurrency] = useState<'fcfa' | 'eur'>('fcfa');
  const [activeTab, setActiveTab] = useState<'shop' | 'history'>('shop');

  // Form states
  const [countryCode, setCountryCode] = useState<string>('+221');
  const [phoneNumber, setPhoneNumber] = useState<string>('77 123 45 67');
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState<string>('08/28');
  const [cardCvc, setCardCvc] = useState<string>('742');
  const [cardHolder, setCardHolder] = useState<string>(currentUser?.username || 'Lecteur OZI');

  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [lastRechargedAmount, setLastRechargedAmount] = useState<number>(0);

  if (!isCoinShopOpen) return null;

  const currentCoins = currentUser?.coinsBalance || 0;

  const handleStartPayment = async () => {
    setIsProcessing(true);
    setIsSuccess(false);

    const providerNames: Record<PaymentMethodType, string> = {
      wave: 'Wave Mobile Money',
      orange_money: 'Orange Money API',
      mtn_money: 'MTN / Moov Gateway',
      card: 'Passerelle Carte Bancaire (3D Secure)',
    };

    setProcessingStep(`Connexion sécurisée à ${providerNames[paymentMethod]}...`);

    setTimeout(() => {
      setProcessingStep('Validation de la transaction en cours...');
      setTimeout(async () => {
        setProcessingStep('Crédit immédiat des Coins OZI...');

        const fullPhone = `${countryCode} ${phoneNumber}`;
        const res = await rechargeCoins(
          selectedPack.id,
          paymentMethod,
          paymentMethod === 'card' ? undefined : fullPhone,
          paymentMethod === 'card' ? { number: cardNumber, holder: cardHolder } : undefined
        );

        setIsProcessing(false);

        if (res.success) {
          setIsSuccess(true);
          setLastRechargedAmount(selectedPack.coins + selectedPack.bonusCoins);
          
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#FF5045', '#F59E0B', '#10B981', '#6366F1'],
            });
          } catch {
            // confetti fallback
          }
        }
      }, 900);
    }, 800);
  };

  const handleUnlockAndRead = () => {
    if (targetLockedChapter) {
      unlockChapterWithCoins(targetLockedChapter.id, targetLockedChapter.coinPrice || 5);
      openReader(targetLockedChapter.workId, targetLockedChapter.id);
      closeCoinShop();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e101a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-['Plus_Jakarta_Sans',sans-serif] text-slate-100">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#131522]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white font-['Outfit']">Boutique OZI Coins</h2>
                <OziLogo size="xs" />
              </div>
              <p className="text-[11px] text-slate-400">
                Solde actuel : <span className="font-extrabold text-amber-400">{currentCoins} Coins</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Switch Devise FCFA / EUR */}
            <div className="flex items-center p-0.5 bg-black/40 rounded-xl border border-white/10 text-[10px] font-bold">
              <button
                onClick={() => setCurrency('fcfa')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  currency === 'fcfa' ? 'bg-[#ff5a50] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                FCFA
              </button>
              <button
                onClick={() => setCurrency('eur')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  currency === 'eur' ? 'bg-[#ff5a50] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                EUR (€)
              </button>
            </div>

            <button
              onClick={closeCoinShop}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS (Recharge vs Historique) */}
        <div className="flex border-b border-white/5 bg-[#0b0d14] px-4">
          <button
            onClick={() => {
              setActiveTab('shop');
              setIsSuccess(false);
            }}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'shop'
                ? 'border-[#ff5a50] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Recharger mes Pièces
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#ff5a50] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Historique ({currentUser?.coinTransactions?.length || 0})
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* BANDEAU SI ACCÈS ANTICIPÉ CIBLÉ */}
          {targetLockedChapter && !isSuccess && activeTab === 'shop' && (
            <div className="p-3 bg-gradient-to-r from-amber-500/15 via-red-500/10 to-transparent border border-amber-500/30 rounded-2xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                  Accès Fast-Pass Requis
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {targetLockedChapter.title}
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  Coût de déblocage : <span className="font-extrabold text-amber-400">{targetLockedChapter.coinPrice || 5} Coins</span>
                </div>
              </div>
            </div>
          )}

          {/* VUE HISTORIQUE */}
          {activeTab === 'history' && (
            <div className="space-y-2.5">
              {(!currentUser?.coinTransactions || currentUser.coinTransactions.length === 0) ? (
                <div className="p-8 text-center bg-[#131522] rounded-2xl border border-white/5">
                  <Coins className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-300">Aucune transaction pour le moment</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Vos recharges Wave, Orange Money et déblocages d’épisodes apparaîtront ici.
                  </p>
                </div>
              ) : (
                currentUser.coinTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-[#131522] border border-white/5 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          tx.coinsChange > 0
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        <Coins className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{tx.details}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{new Date(tx.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          {tx.amountFcfa ? <span>• {tx.amountFcfa} FCFA</span> : null}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-xs font-extrabold whitespace-nowrap shrink-0 ${
                        tx.coinsChange > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {tx.coinsChange > 0 ? `+${tx.coinsChange}` : tx.coinsChange} 🪙
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* VUE SUCCÈS APRÈS PAIEMENT */}
          {isSuccess && activeTab === 'shop' && (
            <div className="p-6 bg-gradient-to-b from-emerald-950/40 to-[#131522] border border-emerald-500/30 rounded-3xl text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white font-['Outfit']">Paiement Validé !</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Votre compte a été crédité de <strong className="text-amber-400 font-black">+{lastRechargedAmount} Coins OZI</strong>.
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-bold text-slate-200">
                  <span>Nouveau solde :</span>
                  <span className="text-amber-400 font-extrabold">{currentUser?.coinsBalance || 0} Coins 🪙</span>
                </div>
              </div>

              {targetLockedChapter ? (
                <div className="pt-2">
                  <button
                    onClick={handleUnlockAndRead}
                    className="w-full py-3 px-4 bg-[#ff5a50] hover:bg-[#ff4236] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#ff5a50]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Débloquer et Lire l'épisode maintenant (-5 🪙)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={closeCoinShop}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Fermer et continuer ma lecture
                </button>
              )}
            </div>
          )}

          {/* VUE FORMULAIRE DE RECHARGE */}
          {!isSuccess && activeTab === 'shop' && (
            <>
              {/* ÉTAPE 1 : CHOIX DU PACK */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#ff5a50] text-white text-[10px] flex items-center justify-center font-black">1</span>
                    Choisissez un pack de Coins
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {coinPacks.map((pack) => {
                    const isSelected = selectedPack.id === pack.id;
                    const priceText = currency === 'fcfa' ? `${pack.priceFcfa.toLocaleString()} FCFA` : `${pack.priceEur.toFixed(2)} €`;

                    return (
                      <div
                        key={pack.id}
                        onClick={() => setSelectedPack(pack)}
                        className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#1b1e30] border-[#ff5a50] shadow-lg shadow-[#ff5a50]/15 ring-1 ring-[#ff5a50]'
                            : 'bg-[#131522] border-white/10 hover:border-white/20'
                        }`}
                      >
                        {pack.tag && (
                          <span
                            className={`absolute -top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              pack.popular
                                ? 'bg-amber-500 text-black'
                                : 'bg-[#ff5a50] text-white'
                            }`}
                          >
                            {pack.tag}
                          </span>
                        )}

                        <div>
                          <div className="flex items-center gap-1.5 text-amber-400 font-black text-sm mb-0.5">
                            <Coins className="w-4 h-4 shrink-0" />
                            <span>{pack.coins} Coins</span>
                          </div>
                          {pack.bonusCoins > 0 && (
                            <div className="text-[10px] font-bold text-emerald-400">
                              +{pack.bonusCoins} Bonus offerts !
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-xs font-black text-white">{priceText}</span>
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                              isSelected
                                ? 'bg-[#ff5a50] border-[#ff5a50] text-white'
                                : 'border-white/30 text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ÉTAPE 2 : MOYEN DE PAIEMENT */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#ff5a50] text-white text-[10px] flex items-center justify-center font-black">2</span>
                  Sélectionnez votre moyen de paiement
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {/* Wave */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wave')}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'wave'
                        ? 'bg-[#1b2538] border-cyan-400 ring-1 ring-cyan-400 text-white'
                        : 'bg-[#131522] border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-xs">
                      🌊
                    </div>
                    <span className="text-[11px] font-extrabold">Wave</span>
                  </button>

                  {/* Orange Money */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('orange_money')}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'orange_money'
                        ? 'bg-[#281b15] border-orange-500 ring-1 ring-orange-500 text-white'
                        : 'bg-[#131522] border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-xs">
                      🟠
                    </div>
                    <span className="text-[11px] font-extrabold truncate w-full text-center">Orange M.</span>
                  </button>

                  {/* MTN / Moov */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mtn_money')}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'mtn_money'
                        ? 'bg-[#282515] border-yellow-400 ring-1 ring-yellow-400 text-white'
                        : 'bg-[#131522] border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center font-black text-xs">
                      🟡
                    </div>
                    <span className="text-[11px] font-extrabold truncate w-full text-center">MTN/Moov</span>
                  </button>

                  {/* Carte Bancaire */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-[#1f1b30] border-purple-400 ring-1 ring-purple-400 text-white'
                        : 'bg-[#131522] border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-extrabold">Carte CB</span>
                  </button>
                </div>
              </div>

              {/* ÉTAPE 3 : FORMULAIRE DYNAMIQUE SELON LE MOYEN */}
              <div className="pt-2">
                {paymentMethod === 'wave' && (
                  <div className="p-4 bg-[#111624] border border-cyan-500/20 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                        <Smartphone className="w-4 h-4" />
                        <span>Paiement 1-Clic Wave (Sans Frais)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-black uppercase">
                        Direct QR / App
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-[#0b0e17] border border-white/10 rounded-xl px-2 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="+221">🇸🇳 +221 (Sénégal)</option>
                        <option value="+225">🇨🇮 +225 (Côte d'Ivoire)</option>
                        <option value="+229">🇧🇯 +229 (Bénin)</option>
                        <option value="+223">🇲🇱 +223 (Mali)</option>
                        <option value="+226">🇧🇫 +226 (Burkina)</option>
                        <option value="+228">🇹🇬 +228 (Togo)</option>
                      </select>

                      <div className="flex-1 relative">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="77 123 45 67"
                          className="w-full bg-[#0b0e17] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      Une notification de validation sera envoyée directement sur votre application Wave.
                    </p>
                  </div>
                )}

                {paymentMethod === 'orange_money' && (
                  <div className="p-4 bg-[#1e1511] border border-orange-500/20 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-orange-400 text-xs font-bold">
                        <Phone className="w-4 h-4" />
                        <span>Paiement Orange Money</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[9px] font-black uppercase">
                        Code USSD #144#
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-[#0e0a08] border border-white/10 rounded-xl px-2 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-400"
                      >
                        <option value="+225">🇨🇮 +225 (Côte d'Ivoire)</option>
                        <option value="+221">🇸🇳 +221 (Sénégal)</option>
                        <option value="+223">🇲🇱 +223 (Mali)</option>
                        <option value="+224">🇬🇳 +224 (Guinée)</option>
                        <option value="+237">🇨🇲 +237 (Cameroun)</option>
                      </select>

                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="07 08 09 10 11"
                        className="flex-1 bg-[#0e0a08] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-400"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Vous recevrez un prompt sur votre mobile ou composez <strong>#144#</strong> pour autoriser le débit.
                    </p>
                  </div>
                )}

                {paymentMethod === 'mtn_money' && (
                  <div className="p-4 bg-[#1f1d11] border border-yellow-500/20 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold">
                        <Smartphone className="w-4 h-4" />
                        <span>Paiement MTN / Moov Money</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-[9px] font-black uppercase">
                        Mobile Money
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-[#0f0e08] border border-white/10 rounded-xl px-2 py-2 text-xs font-bold text-white focus:outline-none focus:border-yellow-400"
                      >
                        <option value="+225">🇨🇮 +225 (Côte d'Ivoire)</option>
                        <option value="+229">🇧🇯 +229 (Bénin)</option>
                        <option value="+228">🇹🇬 +228 (Togo)</option>
                        <option value="+242">🇨🇬 +242 (Congo)</option>
                      </select>

                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="05 06 07 08 09"
                        className="flex-1 bg-[#0f0e08] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="p-4 bg-[#161324] border border-purple-500/20 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                        <CreditCard className="w-4 h-4" />
                        <span>Carte Bancaire (Visa / Mastercard)</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>3D Secure</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Nom sur la carte"
                          className="w-full bg-[#0d0a17] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="Numéro de carte (16 chiffres)"
                          className="flex-1 bg-[#0d0a17] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-400"
                        />
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/AA"
                          className="w-20 bg-[#0d0a17] border border-white/10 rounded-xl px-2 py-2 text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-purple-400"
                        />
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="CVC"
                          className="w-16 bg-[#0d0a17] border border-white/10 rounded-xl px-2 py-2 text-xs font-mono font-bold text-white text-center focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BOUTON D'ACTION DE PAIEMENT */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleStartPayment}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-[#ff5a50] to-[#ff3b2f] hover:from-[#ff6b62] hover:to-[#ff4c42] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-[#ff5a50]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-xs">{processingStep || 'Traitement sécurisé...'}</span>
                    </div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>
                        Payer {currency === 'fcfa' ? `${selectedPack.priceFcfa.toLocaleString()} FCFA` : `${selectedPack.priceEur.toFixed(2)} €`} (+{selectedPack.coins + selectedPack.bonusCoins} Coins)
                      </span>
                    </>
                  )}
                </button>

                <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Chiffrement SSL 256-bit
                  </span>
                  <span>•</span>
                  <span>Crédit Instantané</span>
                  <span>•</span>
                  <span>Sans engagement</span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
