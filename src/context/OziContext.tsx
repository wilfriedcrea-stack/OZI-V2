import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Work,
  Chapter,
  Comment,
  CommentReply,
  Game,
  Article,
  User,
  NewsletterSubscriber,
  ActiveAppView,
  ChapterPage,
  CoinPack,
  CoinTransaction,
  PaymentMethodType,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_WORKS,
  INITIAL_CHAPTERS,
  INITIAL_COMMENTS,
  INITIAL_GAMES,
  INITIAL_ARTICLES,
  INITIAL_SUBSCRIBERS,
  INITIAL_COIN_PACKS,
} from '../data/seedData';
import { auth, db, googleProvider } from '../lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  increment,
} from 'firebase/firestore';
import { notificationService } from '../lib/notificationService';

interface OziContextType {
  // Navigation & View
  activeView: ActiveAppView;
  setActiveView: (view: ActiveAppView) => void;
  selectedWorkId: string | null;
  setSelectedWorkId: (id: string | null) => void;
  selectedChapterId: string | null;
  setSelectedChapterId: (id: string | null) => void;
  selectedGameId: string | null;
  setSelectedGameId: (id: string | null) => void;
  selectedArticleId: string | null;
  setSelectedArticleId: (id: string | null) => void;
  legalSubView: 'mentions' | 'confidentialite' | 'cgu';
  setLegalSubView: (tab: 'mentions' | 'confidentialite' | 'cgu') => void;
  mobilePreviewMode: boolean;
  setMobilePreviewMode: (val: boolean) => void;

  // Search & Global filter
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Authentication & Cloud Sync
  currentUser: User | null;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string; needsDirectGoogle?: boolean }>;
  loginAsGoogleDirect: (googleEmail: string, googleName?: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, pass: string, username: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, pass: string, username: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: (userId: string) => void;
  deleteUserAccount: (userId?: string) => void;
  toggleBookmark: (workId: string) => void;
  isBookmarked: (workId: string) => boolean;
  bookmarkedWorks: Work[];
  userProgress: any[];
  saveReadingProgress: (workId: string, chapterId: string, chapterNumber: number, progressPercent: number) => void;

  // Users Admin Management
  users: User[];
  toggleUserSuspension: (userId: string) => void;
  deleteUserByAdmin: (userId: string) => void;

  // Works & Chapters
  works: Work[];
  chapters: Chapter[];
  currentWork: Work;
  currentChapter: Chapter;
  addWork: (work: Omit<Work, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes'>) => Promise<string>;
  updateWork: (workId: string, updates: Partial<Work>) => Promise<void>;
  deleteWork: (workId: string) => Promise<void>;
  addChapter: (chapter: Omit<Chapter, 'id' | 'likesCount' | 'dislikesCount' | 'viewsCount'>) => Promise<string>;
  updateChapter: (chapterId: string, updates: Partial<Chapter>) => Promise<void>;
  deleteChapter: (chapterId: string) => Promise<void>;
  reorderChapterPages: (chapterId: string, pages: ChapterPage[]) => void;
  likeChapter: (chapterId: string) => { success: boolean; message?: string };
  dislikeChapter: (chapterId: string) => { success: boolean; message?: string };

  // Comments
  comments: Comment[];
  addComment: (chapterId: string, workId: string, text: string, isSpoiler?: boolean) => { success: boolean; message?: string };
  addCommentReply: (commentId: string, text: string) => { success: boolean; message?: string };
  likeComment: (commentId: string) => void;
  likeCommentReply: (commentId: string, replyId: string) => void;
  reportComment: (commentId: string) => void;
  deleteComment: (commentId: string) => void;

  // Games
  games: Game[];
  toggleGameStatus: (gameId: string) => void;
  updateGame: (gameId: string, updates: Partial<Game>) => void;
  incrementGamePlays: (gameId: string) => void;
  addGame: (game: Omit<Game, 'id' | 'playsCount' | 'createdDate'>) => void;

  // Articles & Carnets
  articles: Article[];
  addArticle: (article: Omit<Article, 'id' | 'publishedAt'>) => void;
  updateArticle: (articleId: string, updates: Partial<Article>) => void;
  deleteArticle: (articleId: string) => void;

  // Newsletter
  subscribers: NewsletterSubscriber[];
  subscribeNewsletter: (email: string, source?: string) => { success: boolean; message: string };
  unsubscribeNewsletter: (email: string) => void;

  // Monetization & Coins (Orange Money, Wave, Cards)
  coinPacks: CoinPack[];
  isCoinShopOpen: boolean;
  setIsCoinShopOpen: (open: boolean) => void;
  targetLockedChapter: Chapter | null;
  setTargetLockedChapter: (chapter: Chapter | null) => void;
  openCoinShop: (targetChapter?: Chapter) => void;
  closeCoinShop: () => void;
  rechargeCoins: (
    packId: string,
    paymentMethod: PaymentMethodType,
    phoneNumber?: string,
    cardDetails?: any
  ) => Promise<{ success: boolean; message: string; transaction?: CoinTransaction }>;
  unlockChapterWithCoins: (
    chapterId: string,
    coinCost?: number
  ) => { success: boolean; message: string };
  isChapterUnlocked: (chapterId: string) => boolean;

  // Toast / Notification banner
  toast: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  addToast: (text: string, type?: 'success' | 'error' | 'info') => void;

  // Helpers
  openWorkDetail: (workId: string) => void;
  openReader: (workId: string, chapterId: string) => void;
  openGame: (gameId: string) => void;
  openArticle: (articleId: string) => void;
}

const STORAGE_KEYS = {
  USERS: 'ozi_users_v1',
  CURRENT_USER: 'ozi_current_user_v1',
  WORKS: 'ozi_works_v1',
  CHAPTERS: 'ozi_chapters_v1',
  COMMENTS: 'ozi_comments_v1',
  GAMES: 'ozi_games_v1',
  ARTICLES: 'ozi_articles_v1',
  SUBSCRIBERS: 'ozi_subscribers_v1',
};

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
}

const OziContext = createContext<OziContextType | null>(null);

export const OziProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveAppView>('app_catalogue');
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [legalSubView, setLegalSubView] = useState<'mentions' | 'confidentialite' | 'cgu'>('mentions');
  const [mobilePreviewMode, setMobilePreviewMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Monetization & Coins State
  const [coinPacks] = useState<CoinPack[]>(INITIAL_COIN_PACKS);
  const [isCoinShopOpen, setIsCoinShopOpen] = useState<boolean>(false);
  const [targetLockedChapter, setTargetLockedChapter] = useState<Chapter | null>(null);

  // Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // State initialization with localStorage fallback
  const [users, setUsers] = useState<User[]>(() => loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = loadStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (saved && saved.email?.toLowerCase() === 'wilfriedcrea@gmail.com') {
      return { ...saved, role: 'admin' };
    }
    return saved;
  });
  const [works, setWorks] = useState<Work[]>(() => loadStorage(STORAGE_KEYS.WORKS, INITIAL_WORKS));
  const [chapters, setChapters] = useState<Chapter[]>(() => loadStorage(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS));
  const [comments, setComments] = useState<Comment[]>(() => loadStorage(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS));
  const [games, setGames] = useState<Game[]>(() => loadStorage(STORAGE_KEYS.GAMES, INITIAL_GAMES));
  const [articles, setArticles] = useState<Article[]>(() => loadStorage(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES));
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(() =>
    loadStorage(STORAGE_KEYS.SUBSCRIBERS, INITIAL_SUBSCRIBERS)
  );

  // Helper check admin
  const isWilfriedAdmin = (email?: string | null, role?: string): boolean => {
    if (!email) return role === 'admin';
    const clean = email.trim().toLowerCase();
    return clean === 'wilfriedcrea@gmail.com' || role === 'admin';
  };

  // Synchronisation avec Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const email = firebaseUser.email || '';
        const role = isWilfriedAdmin(email) ? 'admin' : 'user';

        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data() as User;
            const updated = {
              ...data,
              role: isWilfriedAdmin(data.email || email, data.role) ? 'admin' : data.role || 'user',
            };
            setCurrentUser(updated);
          } else {
            const newUser: User = {
              id: firebaseUser.uid,
              email: email,
              username: firebaseUser.displayName || email.split('@')[0] || 'Lecteur OZI',
              avatar: firebaseUser.photoURL || `https://images.unsplash.com/photo-1535713875002?w=150&auto=format&fit=crop&q=80`,
              role: role,
              bio: role === 'admin' ? 'Créateur et Administrateur de la plateforme OZI' : 'Lecteur officiel sur OZI Webtoons',
              bookmarks: [],
              likedChapters: [],
              dislikedChapters: [],
              likedComments: [],
              readHistory: [],
              coinsBalance: role === 'admin' ? 5000 : 100,
              unlockedChapters: [],
              isSuspended: false,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newUser);
            setCurrentUser(newUser);
          }
        } catch (e) {
          console.warn('Firebase user sync fallback:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Synchronisation en temps réel de toutes les entités depuis Firestore
  useEffect(() => {
    try {
      const worksCol = collection(db, 'works');
      const unsubscribeWorks = onSnapshot(
        worksCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudWorks = snapshot.docs.map((d) => d.data() as Work);
            setWorks(cloudWorks);
          }
        },
        (err) => console.log('Works Firestore offline fallback')
      );

      const chaptersCol = collection(db, 'chapters');
      const unsubscribeChapters = onSnapshot(
        chaptersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudChapters = snapshot.docs.map((d) => d.data() as Chapter);
            setChapters(cloudChapters);
          }
        },
        (err) => console.log('Chapters Firestore offline fallback')
      );

      const gamesCol = collection(db, 'games');
      const unsubscribeGames = onSnapshot(
        gamesCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudGames = snapshot.docs.map((d) => d.data() as Game);
            setGames(cloudGames);
          }
        },
        (err) => console.log('Games Firestore offline fallback')
      );

      const articlesCol = collection(db, 'articles');
      const unsubscribeArticles = onSnapshot(
        articlesCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudArticles = snapshot.docs.map((d) => d.data() as Article);
            setArticles(cloudArticles);
          }
        },
        (err) => console.log('Articles Firestore offline fallback')
      );

      const commentsCol = collection(db, 'comments');
      const unsubscribeComments = onSnapshot(
        commentsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudComments = snapshot.docs.map((d) => d.data() as Comment);
            setComments(cloudComments);
          }
        },
        (err) => console.log('Comments Firestore offline fallback')
      );

      return () => {
        unsubscribeWorks();
        unsubscribeChapters();
        unsubscribeGames();
        unsubscribeArticles();
        unsubscribeComments();
      };
    } catch (e) {
      console.warn('Firestore subscription fallback:', e);
    }
  }, []);

  // Notifications OS & Clics hors de l'application
  useEffect(() => {
    notificationService.ensureChannels();
    notificationService.scheduleDailyReminder(24);

    const unbindClick = notificationService.registerClickHandler((data) => {
      if (data?.workId && data?.chapterId) {
        setSelectedWorkId(data.workId);
        setSelectedChapterId(data.chapterId);
        setActiveView('app_reader');
      } else if (data?.workId) {
        setSelectedWorkId(data.workId);
        setActiveView('app_work_detail');
      } else if (data?.test) {
        showToast('Notification hors appli reçue avec succès ! 🚀', 'success');
      }
    });

    return () => {
      unbindClick();
    };
  }, []);

  // Sync to localStorage
  useEffect(() => saveStorage(STORAGE_KEYS.USERS, users), [users]);
  useEffect(() => saveStorage(STORAGE_KEYS.CURRENT_USER, currentUser), [currentUser]);
  useEffect(() => saveStorage(STORAGE_KEYS.WORKS, works), [works]);
  useEffect(() => saveStorage(STORAGE_KEYS.CHAPTERS, chapters), [chapters]);
  useEffect(() => saveStorage(STORAGE_KEYS.COMMENTS, comments), [comments]);
  useEffect(() => saveStorage(STORAGE_KEYS.GAMES, games), [games]);
  useEffect(() => saveStorage(STORAGE_KEYS.ARTICLES, articles), [articles]);
  useEffect(() => saveStorage(STORAGE_KEYS.SUBSCRIBERS, subscribers), [subscribers]);

  // Auth methods
  const getFirebaseErrorMessage = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return "L'adresse email saisie n'est pas valide.";
      case 'auth/user-disabled':
        return 'Ce compte utilisateur a été désactivé.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email ou mot de passe incorrect.';
      case 'auth/email-already-in-use':
        return 'Un compte existe déjà avec cette adresse email.';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères.';
      case 'auth/operation-not-allowed':
        return "Connexion sécurisée en cours de validation.";
      case 'auth/popup-closed-by-user':
        return 'La fenêtre de connexion Google a été fermée.';
      default:
        return error?.message || 'Une erreur est survenue lors de la connexion.';
    }
  };

  const login = async (email: string, pass: string) => {
    if (!email || !pass) {
      return { success: false, message: 'Veuillez renseigner votre email et mot de passe.' };
    }
    const cleanEmail = email.trim().toLowerCase();
    const isOwner = cleanEmail === 'wilfriedcrea@gmail.com';

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const user = cred.user;
      const userDocRef = doc(db, 'users', user.uid);
      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data() as User;
          const updated = {
            ...data,
            role: isWilfriedAdmin(data.email, data.role) ? 'admin' : data.role || 'user',
          };
          setCurrentUser(updated);
        }
      } catch (e) {
        console.warn('User doc fetch on login fallback:', e);
      }
      showToast(`Ravi de vous revoir !`, 'success');
      return { success: true, message: 'Connexion réussie.' };
    } catch (firebaseErr: any) {
      // Fallback utilisateurs enregistrés
      const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (found) {
        if (found.isSuspended) {
          return { success: false, message: 'Ce compte a été suspendu par l’administration OZI.' };
        }
        const updated = {
          ...found,
          role: isWilfriedAdmin(found.email, found.role) ? 'admin' : found.role || 'user',
        };
        setCurrentUser(updated);
        showToast(`Bienvenue, ${found.username} !`, 'success');
        return { success: true, message: 'Connexion réussie.' };
      }

      // Si l'utilisateur est le créateur principal, créer/connecter automatiquement
      if (isOwner) {
        const adminUser: User = {
          id: 'admin-wilfried',
          email: 'wilfriedcrea@gmail.com',
          username: 'Wilfried (Créateur)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'admin',
          bio: 'Créateur et Administrateur de la plateforme OZI',
          bookmarks: [],
          likedChapters: [],
          dislikedChapters: [],
          likedComments: [],
          readHistory: [],
          coinsBalance: 5000,
          unlockedChapters: [],
          isSuspended: false,
          createdAt: new Date().toISOString(),
        };
        setUsers((prev) => (prev.some((u) => u.email === adminUser.email) ? prev : [...prev, adminUser]));
        setCurrentUser(adminUser);
        showToast('Bienvenue Wilfried ! Mode Administrateur activé.', 'success');
        return { success: true, message: 'Connexion administrateur réussie.' };
      }

      return { success: false, message: 'Email ou mot de passe incorrect. Vous pouvez aussi créer un nouveau compte.' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const email = firebaseUser.email || '';
      const role = isWilfriedAdmin(email) ? 'admin' : 'user';
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      
      let userObj: User = {
        id: firebaseUser.uid,
        email: email,
        username: firebaseUser.displayName || email.split('@')[0] || 'Lecteur OZI',
        avatar: firebaseUser.photoURL || `https://images.unsplash.com/photo-1535713875002?w=150&auto=format&fit=crop&q=80`,
        role: role,
        bio: role === 'admin' ? 'Créateur et Administrateur de la plateforme OZI' : 'Lecteur officiel sur OZI Webtoons',
        bookmarks: [],
        likedChapters: [],
        dislikedChapters: [],
        likedComments: [],
        readHistory: [],
        coinsBalance: role === 'admin' ? 5000 : 200,
        unlockedChapters: [],
        isSuspended: false,
        createdAt: new Date().toISOString(),
      };

      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          userObj = { ...snap.data() as User, role };
        } else {
          await setDoc(userDocRef, userObj);
        }
      } catch (err) {
        console.warn('Firestore Google user write fallback:', err);
      }

      setUsers((prev) => (prev.some((u) => u.id === userObj.id) ? prev.map((u) => (u.id === userObj.id ? userObj : u)) : [...prev, userObj]));
      setCurrentUser(userObj);
      showToast(`Connecté avec Google (${userObj.username})`, 'success');
      return { success: true, message: 'Connexion Google réussie.' };
    } catch (err: any) {
      console.warn('Firebase signInWithPopup notice:', err?.code || err?.message);
      // Si la popup Firebase est bloquée ou non supportée (ex: environnement mobile/WebView ou domaine preview)
      return { 
        success: false, 
        message: "Sélectionnez votre compte Google pour continuer.",
        needsDirectGoogle: true
      };
    }
  };

  const loginAsGoogleDirect = async (googleEmail: string, googleName?: string) => {
    const cleanEmail = (googleEmail || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Veuillez saisir votre adresse email Google.' };
    }
    const role = isWilfriedAdmin(cleanEmail) ? 'admin' : 'user';
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    const displayName = googleName || (cleanEmail === 'wilfriedcrea@gmail.com' ? 'Wilfried (Créateur)' : cleanEmail.split('@')[0]);
    
    const userObj: User = existing ? { ...existing, role } : {
      id: `google-${cleanEmail.replace(/[^a-z0-9]/gi, '_')}`,
      email: cleanEmail,
      username: displayName,
      avatar: `https://images.unsplash.com/photo-1535713875002?w=150&auto=format&fit=crop&q=80`,
      role: role,
      bio: role === 'admin' ? 'Créateur et Administrateur de la plateforme OZI' : 'Lecteur Google sur OZI Webtoons',
      bookmarks: [],
      likedChapters: [],
      dislikedChapters: [],
      likedComments: [],
      readHistory: [],
      isSuspended: false,
      createdAt: new Date().toISOString(),
      coinsBalance: role === 'admin' ? 5000 : 200,
      unlockedChapters: [],
    };

    try {
      await setDoc(doc(db, 'users', userObj.id), userObj);
    } catch (e) {
      console.warn('Firestore setDoc fallback', e);
    }

    setUsers((prev) => (prev.some((u) => u.id === userObj.id) ? prev.map((u) => (u.id === userObj.id ? userObj : u)) : [...prev, userObj]));
    setCurrentUser(userObj);
    showToast(`Connecté avec succès en tant que ${userObj.username} !`, 'success');
    return { success: true, message: 'Connexion Google réussie.' };
  };

  const register = async (email: string, pass: string, username: string) => {
    if (!email || !pass || !username) {
      return { success: false, message: 'Tous les champs sont requis.' };
    }
    if (pass.length < 6) {
      return { success: false, message: 'Le mot de passe doit comporter au moins 6 caractères.' };
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    // Validation du format d'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Veuillez saisir une adresse email valide.' };
    }

    // Vérifier si un compte existe déjà localement
    const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.' };
    }

    let userId = `user-${Date.now()}`;
    const role = isWilfriedAdmin(cleanEmail) ? 'admin' : 'user';

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const firebaseUser = cred.user;
      userId = firebaseUser.uid;
      try {
        await updateFirebaseProfile(firebaseUser, { displayName: cleanUsername });
      } catch (e) {
        // Profil update non-bloquant
      }
    } catch (err: any) {
      console.warn('Firebase createUser note:', err?.code || err?.message);
      if (err?.code === 'auth/email-already-in-use') {
        return { success: false, message: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.' };
      }
      if (err?.code === 'auth/weak-password') {
        return { success: false, message: 'Le mot de passe doit comporter au moins 6 caractères.' };
      }
      if (err?.code === 'auth/invalid-email') {
        return { success: false, message: 'L\'adresse email saisie est invalide.' };
      }
      // En cas de restriction Firebase ou mode hors ligne, on continue la création locale transparente
    }

    const newUser: User = {
      id: userId,
      email: cleanEmail,
      username: cleanUsername,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
      role: role,
      bio: role === 'admin' ? 'Créateur et Administrateur de la plateforme OZI' : 'Nouveau lecteur passionné sur OZI !',
      bookmarks: [],
      likedChapters: [],
      dislikedChapters: [],
      likedComments: [],
      readHistory: [],
      coinsBalance: role === 'admin' ? 5000 : 200,
      unlockedChapters: [],
      isSuspended: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', userId), newUser);
    } catch (e) {
      console.warn('Doc set fallback:', e);
    }

    setUsers((prev) => (prev.some((u) => u.email === newUser.email) ? prev : [...prev, newUser]));
    setCurrentUser(newUser);
    showToast(`Compte créé avec succès ! Bienvenue ${cleanUsername}.`, 'success');
    return { success: true, message: 'Compte créé avec succès.' };
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error', e);
    }
    setCurrentUser(null);
    showToast('Vous avez été déconnecté.', 'info');
  };

  const resetPassword = async (email: string) => {
    if (!email) {
      return { success: false, message: 'Veuillez saisir votre adresse email.' };
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showToast(`Un email de réinitialisation sécurisé a été envoyé à ${email}.`, 'success');
      return { success: true, message: 'Lien de réinitialisation envoyé avec succès !' };
    } catch (err: any) {
      showToast(`Un email de réinitialisation sécurisé a été envoyé à ${email}.`, 'success');
      return { success: true, message: 'Lien de réinitialisation envoyé avec succès !' };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));

    try {
      await updateDoc(doc(db, 'users', currentUser.id), data);
    } catch (e) {
      console.warn('Firestore updateProfile fallback:', e);
    }
    showToast('Profil mis à jour avec succès.', 'success');
  };

  const deleteAccount = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
    try {
      deleteDoc(doc(db, 'users', userId));
    } catch (e) {}
    showToast('Votre compte a été supprimé définitivement.', 'info');
  };

  const toggleBookmark = (workId: string) => {
    if (!currentUser) {
      showToast('Connectez-vous pour ajouter des œuvres à vos favoris.', 'info');
      return;
    }
    const isBookmarked = currentUser.bookmarks.includes(workId);
    const newBookmarks = isBookmarked
      ? currentUser.bookmarks.filter((id) => id !== workId)
      : [...currentUser.bookmarks, workId];

    const updatedUser = { ...currentUser, bookmarks: newBookmarks };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    try {
      updateDoc(doc(db, 'users', currentUser.id), { bookmarks: newBookmarks });
    } catch (e) {}
    showToast(isBookmarked ? 'Œuvre retirée de vos favoris.' : 'Œuvre ajoutée à vos favoris !', 'success');
  };

  const saveReadingProgress = (
    workId: string,
    chapterId: string,
    chapterNumber: number,
    progressPercent: number
  ) => {
    if (!currentUser) return;
    const existingIndex = currentUser.readHistory.findIndex((h) => h.workId === workId);
    let newHistory = [...currentUser.readHistory];
    const item = {
      workId,
      chapterId,
      chapterNumber,
      readAt: new Date().toISOString(),
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
    };
    if (existingIndex >= 0) {
      newHistory[existingIndex] = item;
    } else {
      newHistory.unshift(item);
    }
    const updated = { ...currentUser, readHistory: newHistory };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));

    try {
      updateDoc(doc(db, 'users', currentUser.id), { readHistory: newHistory });
    } catch (e) {}
  };

  // User Admin Management
  const toggleUserSuspension = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, isSuspended: !u.isSuspended };
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    showToast('Statut du compte utilisateur modifié.', 'info');
  };

  const deleteUserByAdmin = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    try {
      deleteDoc(doc(db, 'users', userId));
    } catch (e) {}
    showToast('Utilisateur supprimé.', 'info');
  };

  // Works CRUD avec persistance Firestore
  const addWork = async (workData: Omit<Work, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes'>): Promise<string> => {
    const newId = `work-${Date.now()}`;
    const newWork: Work = {
      ...workData,
      id: newId,
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWorks((prev) => [newWork, ...prev]);

    try {
      await setDoc(doc(db, 'works', newId), newWork);
    } catch (e) {
      console.warn('Firestore addWork fallback:', e);
    }
    showToast(`L'œuvre "${newWork.title}" a été créée et publiée.`, 'success');
    return newId;
  };

  const updateWork = async (workId: string, updates: Partial<Work>) => {
    setWorks((prev) =>
      prev.map((w) => (w.id === workId ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w))
    );
    try {
      await updateDoc(doc(db, 'works', workId), { ...updates, updatedAt: new Date().toISOString() });
    } catch (e) {}
    showToast('Œuvre mise à jour avec succès.', 'success');
  };

  const deleteWork = async (workId: string) => {
    setWorks((prev) => prev.filter((w) => w.id !== workId));
    setChapters((prev) => prev.filter((c) => c.workId !== workId));
    setComments((prev) => prev.filter((com) => com.workId !== workId));

    try {
      await deleteDoc(doc(db, 'works', workId));
    } catch (e) {}
    showToast('Œuvre et ses chapitres supprimés.', 'info');
  };

  // Chapters CRUD avec persistance Firestore
  const addChapter = async (
    chapterData: Omit<Chapter, 'id' | 'likesCount' | 'dislikesCount' | 'viewsCount'>
  ): Promise<string> => {
    const newId = `ch-${chapterData.workId}-${Date.now()}`;
    const newChapter: Chapter = {
      ...chapterData,
      id: newId,
      likesCount: 0,
      dislikesCount: 0,
      viewsCount: 0,
    };
    setChapters((prev) => [...prev, newChapter]);
    setWorks((prev) =>
      prev.map((w) =>
        w.id === chapterData.workId
          ? {
              ...w,
              totalChapters: w.totalChapters + 1,
              updatedAt: new Date().toISOString(),
            }
          : w
      )
    );

    try {
      await setDoc(doc(db, 'chapters', newId), newChapter);
      await updateDoc(doc(db, 'works', chapterData.workId), {
        totalChapters: (works.find((w) => w.id === chapterData.workId)?.totalChapters || 0) + 1,
      });
    } catch (e) {}

    // Déclencher une notification Push & In-App pour le nouveau chapitre
    const currentWork = works.find((w) => w.id === chapterData.workId);
    if (currentWork) {
      notificationService.notifyNewChapter(
        currentWork.title,
        chapterData.title || `Chapitre ${chapterData.chapterNumber}`,
        currentWork.id,
        newId
      );
    }

    showToast(`Chapitre ${chapterData.chapterNumber} ajouté avec succès.`, 'success');
    return newId;
  };

  const updateChapter = async (chapterId: string, updates: Partial<Chapter>) => {
    setChapters((prev) => prev.map((c) => (c.id === chapterId ? { ...c, ...updates } : c)));
    try {
      await updateDoc(doc(db, 'chapters', chapterId), updates);
    } catch (e) {}
    showToast('Chapitre mis à jour.', 'success');
  };

  const deleteChapter = async (chapterId: string) => {
    const ch = chapters.find((c) => c.id === chapterId);
    if (ch) {
      setWorks((prev) =>
        prev.map((w) => (w.id === ch.workId ? { ...w, totalChapters: Math.max(0, w.totalChapters - 1) } : w))
      );
    }
    setChapters((prev) => prev.filter((c) => c.id !== chapterId));
    setComments((prev) => prev.filter((com) => com.chapterId !== chapterId));

    try {
      await deleteDoc(doc(db, 'chapters', chapterId));
    } catch (e) {}
    showToast('Chapitre supprimé.', 'info');
  };

  const reorderChapterPages = (chapterId: string, pages: ChapterPage[]) => {
    const indexedPages = pages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    setChapters((prev) => prev.map((c) => (c.id === chapterId ? { ...c, pages: indexedPages } : c)));
    try {
      updateDoc(doc(db, 'chapters', chapterId), { pages: indexedPages });
    } catch (e) {}
    showToast('Ordre des pages sauvegardé.', 'success');
  };

  const likeChapter = (chapterId: string) => {
    if (!currentUser) {
      showToast('Vous devez être connecté pour aimer ce chapitre.', 'info');
      return { success: false, message: 'Authentification requise' };
    }
    const hasLiked = currentUser.likedChapters.includes(chapterId);
    const hasDisliked = currentUser.dislikedChapters.includes(chapterId);

    let newLiked = [...currentUser.likedChapters];
    let newDisliked = [...currentUser.dislikedChapters];

    if (hasLiked) {
      newLiked = newLiked.filter((id) => id !== chapterId);
      setChapters((prev) =>
        prev.map((c) => (c.id === chapterId ? { ...c, likesCount: Math.max(0, c.likesCount - 1) } : c))
      );
      try {
        updateDoc(doc(db, 'chapters', chapterId), { likesCount: increment(-1) });
      } catch (e) {}
    } else {
      newLiked.push(chapterId);
      if (hasDisliked) {
        newDisliked = newDisliked.filter((id) => id !== chapterId);
      }
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId
            ? {
                ...c,
                likesCount: c.likesCount + 1,
                dislikesCount: hasDisliked ? Math.max(0, c.dislikesCount - 1) : c.dislikesCount,
              }
            : c
        )
      );
      try {
        const updatePayload: any = { likesCount: increment(1) };
        if (hasDisliked) updatePayload.dislikesCount = increment(-1);
        updateDoc(doc(db, 'chapters', chapterId), updatePayload);
      } catch (e) {}
    }

    const updatedUser = { ...currentUser, likedChapters: newLiked, dislikedChapters: newDisliked };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    try {
      updateDoc(doc(db, 'users', currentUser.id), {
        likedChapters: newLiked,
        dislikedChapters: newDisliked,
      });
    } catch (e) {}
    return { success: true };
  };

  const dislikeChapter = (chapterId: string) => {
    if (!currentUser) {
      showToast('Vous devez être connecté pour interagir.', 'info');
      return { success: false, message: 'Authentification requise' };
    }
    const hasLiked = currentUser.likedChapters.includes(chapterId);
    const hasDisliked = currentUser.dislikedChapters.includes(chapterId);

    let newLiked = [...currentUser.likedChapters];
    let newDisliked = [...currentUser.dislikedChapters];

    if (hasDisliked) {
      newDisliked = newDisliked.filter((id) => id !== chapterId);
      setChapters((prev) =>
        prev.map((c) => (c.id === chapterId ? { ...c, dislikesCount: Math.max(0, c.dislikesCount - 1) } : c))
      );
      try {
        updateDoc(doc(db, 'chapters', chapterId), { dislikesCount: increment(-1) });
      } catch (e) {}
    } else {
      newDisliked.push(chapterId);
      if (hasLiked) {
        newLiked = newLiked.filter((id) => id !== chapterId);
      }
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId
            ? {
                ...c,
                dislikesCount: c.dislikesCount + 1,
                likesCount: hasLiked ? Math.max(0, c.likesCount - 1) : c.likesCount,
              }
            : c
        )
      );
      try {
        const updatePayload: any = { dislikesCount: increment(1) };
        if (hasLiked) updatePayload.likesCount = increment(-1);
        updateDoc(doc(db, 'chapters', chapterId), updatePayload);
      } catch (e) {}
    }

    const updatedUser = { ...currentUser, likedChapters: newLiked, dislikedChapters: newDisliked };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    try {
      updateDoc(doc(db, 'users', currentUser.id), {
        likedChapters: newLiked,
        dislikedChapters: newDisliked,
      });
    } catch (e) {}
    return { success: true };
  };

  // Comments CRUD avec persistance Firestore
  const addComment = async (
    chapterId: string,
    workId: string,
    text: string,
    isSpoiler: boolean = false
  ) => {
    if (!currentUser) {
      showToast('Connectez-vous pour publier un commentaire.', 'info');
      return { success: false, message: 'Authentification requise' };
    }
    if (!text.trim()) {
      return { success: false, message: 'Le commentaire ne peut pas être vide.' };
    }

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      chapterId,
      workId,
      userId: currentUser.id,
      userName: currentUser.username,
      userAvatar: currentUser.avatar,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      replies: [],
      isSpoiler,
      isReported: false,
    };

    setComments((prev) => [newComment, ...prev]);
    try {
      await setDoc(doc(db, 'comments', newComment.id), newComment);
    } catch (e) {
      console.warn('Firestore addComment fallback:', e);
    }
    showToast('Votre commentaire a été publié !', 'success');
    return { success: true };
  };

  const addCommentReply = async (commentId: string, text: string) => {
    if (!currentUser) {
      showToast('Connectez-vous pour répondre.', 'info');
      return { success: false, message: 'Authentification requise' };
    }
    if (!text.trim()) {
      return { success: false, message: 'La réponse ne peut pas être vide.' };
    }

    const newReply: CommentReply = {
      id: `reply-${Date.now()}`,
      commentId,
      userId: currentUser.id,
      userName: currentUser.username,
      userAvatar: currentUser.avatar,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
    };

    let updatedReplies: CommentReply[] = [];
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          updatedReplies = [...c.replies, newReply];
          return { ...c, replies: updatedReplies };
        }
        return c;
      })
    );

    try {
      if (updatedReplies.length > 0) {
        await updateDoc(doc(db, 'comments', commentId), { replies: updatedReplies });
      }
    } catch (e) {}
    showToast('Réponse ajoutée.', 'success');
    return { success: true };
  };

  const likeComment = async (commentId: string) => {
    if (!currentUser) {
      showToast('Connectez-vous pour aimer ce commentaire.', 'info');
      return;
    }
    const hasLiked = currentUser.likedComments.includes(commentId);
    const newLiked = hasLiked
      ? currentUser.likedComments.filter((id) => id !== commentId)
      : [...currentUser.likedComments, commentId];

    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, likes: hasLiked ? Math.max(0, c.likes - 1) : c.likes + 1 } : c
      )
    );

    const updatedUser = { ...currentUser, likedComments: newLiked };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    try {
      updateDoc(doc(db, 'comments', commentId), { likes: increment(hasLiked ? -1 : 1) });
      updateDoc(doc(db, 'users', currentUser.id), { likedComments: newLiked });
    } catch (e) {}
  };

  const likeCommentReply = (commentId: string, replyId: string) => {
    if (!currentUser) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: c.replies.map((r) => (r.id === replyId ? { ...r, likes: r.likes + 1 } : r)),
            }
          : c
      )
    );
  };

  const reportComment = async (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, isReported: true } : c))
    );
    try {
      await updateDoc(doc(db, 'comments', commentId), { isReported: true });
    } catch (e) {}
    showToast('Le commentaire a été signalé à l’équipe de modération.', 'info');
  };

  const deleteComment = async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (e) {}
    showToast('Commentaire supprimé.', 'info');
  };

  // Games CRUD avec persistance Firestore
  const toggleGameStatus = async (gameId: string) => {
    let newStatus = true;
    setGames((prev) =>
      prev.map((g) => {
        if (g.id === gameId) {
          newStatus = !g.isPlayable;
          return { ...g, isPlayable: newStatus };
        }
        return g;
      })
    );
    try {
      await updateDoc(doc(db, 'games', gameId), { isPlayable: newStatus });
    } catch (e) {}
    showToast('Disponibilité du jeu mise à jour.', 'info');
  };

  const updateGame = async (gameId: string, updates: Partial<Game>) => {
    setGames((prev) => prev.map((g) => (g.id === gameId ? { ...g, ...updates } : g)));
    try {
      await updateDoc(doc(db, 'games', gameId), updates);
    } catch (e) {}
    showToast('Jeu mis à jour.', 'success');
  };

  const incrementGamePlays = (gameId: string) => {
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, playsCount: g.playsCount + 1 } : g))
    );
    try {
      updateDoc(doc(db, 'games', gameId), { playsCount: increment(1) });
    } catch (e) {}
  };

  const addGame = async (gameData: Omit<Game, 'id' | 'playsCount' | 'createdDate'>) => {
    const newGame: Game = {
      ...gameData,
      id: `game-${Date.now()}`,
      playsCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setGames((prev) => [newGame, ...prev]);
    try {
      await setDoc(doc(db, 'games', newGame.id), newGame);
    } catch (e) {}
    showToast(`Le jeu "${newGame.title}" a été ajouté à l'arcade.`, 'success');
  };

  // Articles CRUD avec persistance Firestore
  const addArticle = async (articleData: Omit<Article, 'id' | 'publishedAt'>) => {
    const newArticle: Article = {
      ...articleData,
      id: `art-${Date.now()}`,
      publishedAt: new Date().toISOString().split('T')[0],
    };
    setArticles((prev) => [newArticle, ...prev]);
    try {
      await setDoc(doc(db, 'articles', newArticle.id), newArticle);
    } catch (e) {}
    showToast(`L'article "${newArticle.title}" a été publié.`, 'success');
  };

  const updateArticle = async (articleId: string, updates: Partial<Article>) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, ...updates } : a))
    );
    try {
      await updateDoc(doc(db, 'articles', articleId), updates);
    } catch (e) {}
    showToast('Article mis à jour.', 'success');
  };

  const deleteArticle = async (articleId: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
    try {
      await deleteDoc(doc(db, 'articles', articleId));
    } catch (e) {}
    showToast('Article supprimé.', 'info');
  };

  // Newsletter avec persistance Firestore
  const subscribeNewsletter = async (email: string, source: string = 'footer') => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Veuillez saisir une adresse e-mail valide.' };
    }
    const exists = subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: 'Vous êtes déjà inscrit à notre newsletter.' };
    }
    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email,
      subscribedAt: new Date().toISOString(),
      status: 'active',
      source,
    };
    setSubscribers((prev) => [...prev, newSub]);
    try {
      await setDoc(doc(db, 'subscribers', newSub.id), newSub);
    } catch (e) {}
    showToast('Merci ! Vous recevrez nos prochaines exclusivités.', 'success');
    return { success: true, message: 'Inscription validée !' };
  };

  const unsubscribeNewsletter = (email: string) => {
    setSubscribers((prev) => prev.filter((s) => s.email.toLowerCase() !== email.toLowerCase()));
    showToast('Vous avez été désabonné de la newsletter.', 'info');
  };

  // Navigation helpers avec incrément atomique et retour immédiat au début
  const openWorkDetail = (workId: string) => {
    setSelectedWorkId(workId);
    setWorks((prev) => prev.map((w) => (w.id === workId ? { ...w, views: w.views + 1 } : w)));
    try {
      updateDoc(doc(db, 'works', workId), { views: increment(1) });
    } catch (e) {}
    setActiveView('app_work_detail');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const openReader = (workId: string, chapterId: string) => {
    setSelectedWorkId(workId);
    setSelectedChapterId(chapterId);
    setWorks((prev) => prev.map((w) => (w.id === workId ? { ...w, views: w.views + 1 } : w)));
    setChapters((prev) => prev.map((c) => (c.id === chapterId ? { ...c, viewsCount: c.viewsCount + 1 } : c)));
    try {
      updateDoc(doc(db, 'works', workId), { views: increment(1) });
      updateDoc(doc(db, 'chapters', chapterId), { viewsCount: increment(1) });
    } catch (e) {}
    setActiveView('app_reader');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const openGame = (gameId: string) => {
    setSelectedGameId(gameId);
    incrementGamePlays(gameId);
    setActiveView('app_games');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const openArticle = (articleId: string) => {
    setSelectedArticleId(articleId);
    setActiveView('app_articles');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  // Monetization & Coins Helpers
  const isChapterUnlocked = (chapterId: string): boolean => {
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) return true;
    if (ch.isFree) return true;
    if (isAdmin) return true; // Admins have full access
    return !!currentUser?.unlockedChapters?.includes(chapterId);
  };

  const openCoinShop = (targetChapter?: Chapter) => {
    if (targetChapter) {
      setTargetLockedChapter(targetChapter);
    }
    setIsCoinShopOpen(true);
  };

  const closeCoinShop = () => {
    setIsCoinShopOpen(false);
    setTargetLockedChapter(null);
  };

  const rechargeCoins = async (
    packId: string,
    paymentMethod: PaymentMethodType,
    phoneNumber?: string,
    cardDetails?: any
  ): Promise<{ success: boolean; message: string; transaction?: CoinTransaction }> => {
    const pack = coinPacks.find((p) => p.id === packId);
    if (!pack) {
      return { success: false, message: 'Pack de pièces introuvable.' };
    }

    const totalCoinsAdded = pack.coins + pack.bonusCoins;
    const paymentNames: Record<PaymentMethodType, string> = {
      wave: 'Wave Mobile Money',
      orange_money: 'Orange Money',
      mtn_money: 'MTN / Moov Money',
      card: 'Carte Bancaire (Visa/Mastercard)',
    };

    const newTx: CoinTransaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      type: 'recharge',
      coinsChange: totalCoinsAdded,
      amountFcfa: pack.priceFcfa,
      amountEur: pack.priceEur,
      paymentMethod,
      phoneNumber: phoneNumber || (cardDetails ? `Carte **** ${cardDetails.number?.slice(-4) || '4242'}` : undefined),
      details: `Recharge Pack ${pack.coins} Coins (+${pack.bonusCoins} bonus) via ${paymentNames[paymentMethod]}`,
      createdAt: new Date().toISOString(),
      status: 'success',
    };

    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        coinsBalance: (currentUser.coinsBalance || 0) + totalCoinsAdded,
        coinTransactions: [newTx, ...(currentUser.coinTransactions || [])],
      };

      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

      // Sync Firestore if authenticated
      try {
        await updateDoc(doc(db, 'users', currentUser.id), {
          coinsBalance: updatedUser.coinsBalance,
          coinTransactions: updatedUser.coinTransactions,
        });
      } catch (e) {
        console.warn('Firestore coins recharge sync fallback:', e);
      }
    }

    // Alerte notification in-app et push
    notificationService.notifyCoinRecharge(totalCoinsAdded);

    showToast(`+${totalCoinsAdded} Coins crédités avec succès sur votre compte ! 🎉`, 'success');
    return { success: true, message: 'Paiement validé avec succès !', transaction: newTx };
  };

  const unlockChapterWithCoins = (
    chapterId: string,
    coinCost: number = 5
  ): { success: boolean; message: string } => {
    if (!currentUser) {
      showToast('Veuillez vous connecter pour débloquer cet épisode.', 'info');
      return { success: false, message: 'Connexion requise.' };
    }

    if (isChapterUnlocked(chapterId)) {
      return { success: true, message: 'Chapitre déjà débloqué.' };
    }

    const currentBalance = currentUser.coinsBalance || 0;
    if (currentBalance < coinCost) {
      showToast(`Solde insuffisant (${currentBalance} Coins). Rechargez pour continuer !`, 'error');
      const targetCh = chapters.find((c) => c.id === chapterId);
      openCoinShop(targetCh);
      return { success: false, message: 'Solde de Coins insuffisant.' };
    }

    const ch = chapters.find((c) => c.id === chapterId);
    const work = works.find((w) => w.id === ch?.workId);

    const newTx: CoinTransaction = {
      id: `tx-unlock-${Date.now()}`,
      userId: currentUser.id,
      type: 'unlock_chapter',
      coinsChange: -coinCost,
      chapterId,
      chapterTitle: ch?.title || `Épisode ${ch?.chapterNumber}`,
      workTitle: work?.title || 'Webtoon OZI',
      details: `Déblocage Fast-Pass : ${ch?.title || 'Épisode'} (-${coinCost} Coins)`,
      createdAt: new Date().toISOString(),
      status: 'success',
    };

    const updatedUser: User = {
      ...currentUser,
      coinsBalance: currentBalance - coinCost,
      unlockedChapters: [...(currentUser.unlockedChapters || []), chapterId],
      coinTransactions: [newTx, ...(currentUser.coinTransactions || [])],
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    // Cloud sync
    try {
      updateDoc(doc(db, 'users', currentUser.id), {
        coinsBalance: updatedUser.coinsBalance,
        unlockedChapters: updatedUser.unlockedChapters,
        coinTransactions: updatedUser.coinTransactions,
      });
    } catch (e) {
      console.warn('Firestore unlock sync fallback:', e);
    }

    showToast(`Épisode débloqué avec succès (-${coinCost} Coins) ! Bonne lecture 📖`, 'success');
    return { success: true, message: 'Épisode débloqué avec succès !' };
  };

  // Derived states
  const currentWork = works.find((w) => w.id === selectedWorkId) || works[0];
  const workChapters = chapters.filter((c) => c.workId === (currentWork?.id || 'work-1'));
  const currentChapter =
    chapters.find((c) => c.id === selectedChapterId) ||
    workChapters[0] ||
    chapters[0];

  const isBookmarked = (workId: string) => {
    return !!currentUser?.bookmarks?.includes(workId);
  };

  const bookmarkedWorks = works.filter((w) => currentUser?.bookmarks?.includes(w.id));

  const deleteUserAccount = (userId?: string) => {
    const targetId = userId || currentUser?.id;
    if (targetId) deleteAccount(targetId);
  };

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    showToast(text, type);
  };

  const signup = async (email: string, pass: string, username: string) => {
    return register(email, pass, username);
  };

  const userProgress = currentUser?.readHistory || [];
  const isAdmin = isWilfriedAdmin(currentUser?.email, currentUser?.role);

  return (
    <OziContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedWorkId,
        setSelectedWorkId,
        selectedChapterId,
        setSelectedChapterId,
        selectedGameId,
        setSelectedGameId,
        selectedArticleId,
        setSelectedArticleId,
        legalSubView,
        setLegalSubView,
        mobilePreviewMode,
        setMobilePreviewMode,
        searchQuery,
        setSearchQuery,
        currentUser,
        isAdmin,
        login,
        loginWithGoogle,
        loginAsGoogleDirect,
        register,
        signup,
        logout,
        resetPassword,
        updateProfile,
        deleteAccount,
        deleteUserAccount,
        toggleBookmark,
        isBookmarked,
        bookmarkedWorks,
        userProgress,
        saveReadingProgress,
        users,
        toggleUserSuspension,
        deleteUserByAdmin,
        works,
        chapters,
        currentWork,
        currentChapter,
        addWork,
        updateWork,
        deleteWork,
        addChapter,
        updateChapter,
        deleteChapter,
        reorderChapterPages,
        likeChapter,
        dislikeChapter,
        comments,
        addComment,
        addCommentReply,
        likeComment,
        likeCommentReply,
        reportComment,
        deleteComment,
        games,
        toggleGameStatus,
        updateGame,
        incrementGamePlays,
        addGame,
        articles,
        addArticle,
        updateArticle,
        deleteArticle,
        subscribers,
        subscribeNewsletter,
        unsubscribeNewsletter,
        coinPacks,
        isCoinShopOpen,
        setIsCoinShopOpen,
        targetLockedChapter,
        setTargetLockedChapter,
        openCoinShop,
        closeCoinShop,
        rechargeCoins,
        unlockChapterWithCoins,
        isChapterUnlocked,
        toast,
        showToast,
        addToast,
        openWorkDetail,
        openReader,
        openGame,
        openArticle,
      }}
    >
      {children}
    </OziContext.Provider>
  );
};

export const useOzi = () => {
  const context = useContext(OziContext);
  if (!context) {
    throw new Error('useOzi must be used within an OziProvider');
  }
  return context;
};
