import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useOzi } from '../../context/OziContext';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  image: string;
  quantity: number;
}

interface ShopDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export const ShopDrawer: React.FC<ShopDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const { showToast } = useOzi();
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePay = () => {
    if (cart.length === 0) return;
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      setOrderComplete(true);
      setTimeout(() => {
        onCheckout();
        setOrderComplete(false);
        onClose();
        showToast('Commande validée ! Vous recevrez un email de suivi.', 'success');
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Slide Drawer */}
      <div className="relative w-full max-w-sm bg-[#10121d] text-slate-100 h-full border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-250 font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#ff5a50]" />
              <h2 className="text-base font-black text-white font-['Outfit']">
                Panier Boutique OZI
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="my-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="p-8 text-center bg-[#151726] border border-white/10 rounded-2xl">
                <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">Votre panier est vide</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ajoutez des artbooks, figurines ou vêtements depuis la fiche des séries.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#151726] border border-white/10 rounded-2xl flex items-center gap-3"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    <div className="text-xs font-black text-[#ff5a50] mt-0.5">
                      {item.price}€{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({item.price * item.quantity}€)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 text-xs cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 text-xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-auto text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer & Checkout */}
        {cart.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span className="text-white font-bold">{total}€</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-emerald-400" /> Livraison standard
                </span>
                <span className="text-emerald-400 font-bold">OFFERTE</span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/5">
                <span>Total TTC</span>
                <span className="text-lg text-[#ff5a50]">{total}€</span>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={isOrdering || orderComplete}
              className="w-full py-3.5 bg-[#ff5a50] hover:bg-[#ff463b] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-[#ff5a50]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
            >
              {orderComplete ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Commande Confirmée !</span>
                </>
              ) : isOrdering ? (
                <span>Paiement sécurisé en cours...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Commander ({total}€)</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Paiement sécurisé SSL • Expédition sous 48h</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
