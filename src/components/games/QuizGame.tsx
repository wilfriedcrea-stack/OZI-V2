import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'D’où provient historiquement le format Webtoon ?',
    options: ['Japon', 'Corée du Sud', 'France', 'Chine'],
    correctIndex: 1,
    explanation: 'Le terme et format webtoon est né en Corée du Sud au début des années 2000 avec le défilement vertical pour mobile.',
  },
  {
    id: 2,
    question: 'Dans quel sens se lit traditionnellement un Manga japonais ?',
    options: ['De gauche à droite', 'De droite à gauche', 'De haut en bas uniquement', 'En diagonale'],
    correctIndex: 1,
    explanation: 'Le manga traditionnel japonais se lit de droite à gauche, de haut en bas.',
  },
  {
    id: 3,
    question: 'Que signifie le sous-genre narratif "Isekai" très populaire en webtoon ?',
    options: ['Voyage dans le temps', 'Monde alternatif / Réincarnation', 'Enquête policière', 'Combat de méchas'],
    correctIndex: 1,
    explanation: 'Isekai (異世界) signifie littéralement "autre monde" et désigne la réincarnation ou téléportation dans un monde fantastique.',
  },
  {
    id: 4,
    question: 'Quel est le héros légendaire qui commande l’armée des ombres dans Shadow Monarch Rebirth ?',
    options: ['Elena', 'Alex', 'Kenshin', 'Léo'],
    correctIndex: 1,
    explanation: 'Alex, chasseur de rang F, hérite du pouvoir du Monarque des Ombres.',
  },
  {
    id: 5,
    question: 'Qu’est-ce qui caractérise la Bande Dessinée franco-belge par rapport au Webtoon ?',
    options: ['Le format d’album A4 relié et la mise en page en planches', 'Uniquement des dessins en noir et blanc', 'Une lecture exclusivement sur smartphone', 'Des parutions quotidiennes'],
    correctIndex: 0,
    explanation: 'La BD franco-belge classique est traditionnellement publiée en albums grand format cartonnés avec une composition de planche rigoureuse.',
  },
];

export const QuizGame: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  const getRankBadge = () => {
    const ratio = score / QUIZ_QUESTIONS.length;
    if (ratio === 1) return { title: '👑 Grand Maître OZI', desc: 'Score parfait ! Votre savoir est infini.' };
    if (ratio >= 0.7) return { title: '⚔️ Otaku Vétéran', desc: 'Excellente culture manga & webtoon.' };
    if (ratio >= 0.4) return { title: '📖 Lecteur Passionné', desc: 'Bonne base, continuez vos lectures !' };
    return { title: '🌱 Apprenti Lecteur', desc: 'Découvrez plus d’œuvres dans le catalogue OZI !' };
  };

  return (
    <div className="w-full max-w-xl mx-auto p-5 bg-slate-900/90 border border-slate-800 rounded-2xl">
      {/* Quiz Top bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Le Grand Quiz Manga & Webtoon</h3>
            <p className="text-xs text-slate-400">Testez vos connaissances en 5 questions</p>
          </div>
        </div>

        {!isFinished && (
          <div className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-mono font-bold text-amber-400 border border-slate-700">
            {currentIndex + 1} / {QUIZ_QUESTIONS.length}
          </div>
        )}
      </div>

      {!isFinished ? (
        <div>
          {/* Question Box */}
          <div className="mb-5">
            <h4 className="text-base sm:text-lg font-semibold text-slate-100 mb-4 leading-snug">
              {currentQ.question}
            </h4>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-750 hover:border-slate-600';

                if (isAnswered) {
                  if (idx === currentQ.correctIndex) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-semibold';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-red-950/80 border-red-500 text-red-300';
                  } else {
                    btnStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isAnswered}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all duration-200 flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && idx === currentQ.correctIndex && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className="p-3.5 bg-slate-800/90 border border-slate-700 rounded-xl mb-4 text-xs text-slate-300 animate-in fade-in duration-200">
              <span className="font-semibold text-amber-400 block mb-1">💡 Explication :</span>
              {currentQ.explanation}
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                {currentIndex < QUIZ_QUESTIONS.length - 1 ? 'Question suivante' : 'Voir les résultats'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Screen */
        <div className="text-center py-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center mb-4">
            <Award className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-extrabold text-white mb-1">{getRankBadge().title}</h4>
          <p className="text-xs text-slate-400 mb-4">{getRankBadge().desc}</p>

          <div className="inline-block px-6 py-3 bg-slate-800/80 border border-slate-700 rounded-xl mb-6">
            <div className="text-2xl font-black text-amber-400 font-mono">
              {score} / {QUIZ_QUESTIONS.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Bonnes réponses</div>
          </div>

          <div>
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Recommencer le quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
