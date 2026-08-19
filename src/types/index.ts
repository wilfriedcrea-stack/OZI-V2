export type WorkType = 'webtoon' | 'manga' | 'bd';
export type WorkStatus = 'ongoing' | 'completed' | 'hiatus';

export type Genre =
  | 'Action'
  | 'Romance'
  | 'Fantasy'
  | 'Sci-Fi'
  | 'Thriller'
  | 'Comédie'
  | 'Drame'
  | 'Isekai'
  | 'Aventure'
  | 'Mystère'
  | 'Horreur'
  | 'Tranche de vie'
  | 'Arts Martiaux'
  | 'Surnaturel';

export interface ChapterPage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  altText?: string;
}

export interface Chapter {
  id: string;
  workId: string;
  chapterNumber: number;
  title: string;
  releaseDate: string;
  pages: ChapterPage[];
  likesCount: number;
  dislikesCount: number;
  viewsCount: number;
  isFree: boolean;
  coinPrice?: number; // Price in OZI Coins for Fast-Pass (default: 5)
  audioUrl?: string; // OST / Ambiance musicale associée au chapitre (lecture en boucle)
  audioTitle?: string; // Titre du morceau / OST
  audioArtist?: string; // Compositeur / Artiste
}

export interface Work {
  id: string;
  title: string;
  originalTitle?: string;
  type: WorkType;
  genres: Genre[];
  synopsis: string;
  author: string;
  artist: string;
  coverUrl: string;
  bannerUrl: string;
  rating: number; // e.g. 4.8
  views: number;
  likes: number;
  status: WorkStatus;
  featured: boolean;
  releaseYear: number;
  totalChapters: number;
  ageRating: string; // e.g. "Tous publics", "12+", "16+"
  updatedAt: string;
  createdAt: string;
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  likes: number;
  dislikes: number;
  createdAt: string;
  isReported?: boolean;
}

export interface Comment {
  id: string;
  chapterId: string;
  workId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  likes: number;
  dislikes: number;
  createdAt: string;
  isSpoiler?: boolean;
  isReported?: boolean;
  replies: CommentReply[];
}

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: 'Arcade' | 'Puzzle' | 'Quiz' | 'Action' | 'Mémoire';
  developer: string;
  playsCount: number;
  isEnabled: boolean;
  createdDate: string;
  gameType: 'runner' | 'memory' | 'quiz' | 'puzzle';
  badge?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: 'Actualité' | 'Carnet de création' | 'Interview' | 'Dossier';
  summary: string;
  content: string;
  author: string;
  coverUrl: string;
  publishedAt: string;
  tags: string[];
  readTimeMinutes: number;
}

export interface ReadHistoryItem {
  workId: string;
  chapterId: string;
  chapterNumber: number;
  readAt: string;
  progressPercent: number;
}

export type PaymentMethodType = 'wave' | 'orange_money' | 'mtn_money' | 'card';

export interface CoinPack {
  id: string;
  coins: number;
  bonusCoins: number;
  priceFcfa: number;
  priceEur: number;
  tag?: string;
  popular?: boolean;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  type: 'recharge' | 'unlock_chapter' | 'gift' | 'bonus';
  coinsChange: number; // positive for gain, negative for spent
  amountFcfa?: number;
  amountEur?: number;
  paymentMethod?: PaymentMethodType;
  phoneNumber?: string;
  chapterId?: string;
  chapterTitle?: string;
  workTitle?: string;
  details: string;
  createdAt: string;
  status: 'success' | 'pending' | 'failed';
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  role: 'user' | 'admin';
  bio?: string;
  coinsBalance: number;
  unlockedChapters: string[]; // chapterIds unlocked via coins
  coinTransactions?: CoinTransaction[];
  bookmarks: string[]; // workIds
  likedChapters: string[]; // chapterIds
  dislikedChapters: string[]; // chapterIds
  likedComments: string[]; // commentIds
  readHistory: ReadHistoryItem[];
  isSuspended: boolean;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  source: string;
}

export type ActiveAppView =
  | 'app_catalogue'
  | 'app_work_detail'
  | 'app_reader'
  | 'app_games'
  | 'app_articles'
  | 'app_profile'
  | 'app_library'
  | 'landing'
  | 'admin'
  | 'legal';
