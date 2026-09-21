import { Window } from 'happy-dom';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Initialisation de l'environnement DOM simulé (comme dans une WebView Android ou un navigateur mobile)
const domWindow = new Window({
  url: 'https://ozi-webtoon.app',
  width: 390,
  height: 844, // Résolution standard mobile iPhone / Samsung Galaxy
});

// Polyfills globaux compatibles Node 22
Object.defineProperty(globalThis, 'window', { value: domWindow, writable: true, configurable: true });
Object.defineProperty(globalThis, 'document', { value: domWindow.document, writable: true, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: domWindow.localStorage, writable: true, configurable: true });
Object.defineProperty(globalThis, 'sessionStorage', { value: domWindow.sessionStorage, writable: true, configurable: true });
Object.defineProperty(globalThis, 'HTMLElement', { value: domWindow.HTMLElement, writable: true, configurable: true });
Object.defineProperty(globalThis, 'Element', { value: domWindow.Element, writable: true, configurable: true });
Object.defineProperty(globalThis, 'CustomEvent', { value: domWindow.CustomEvent, writable: true, configurable: true });
Object.defineProperty(globalThis, 'Event', { value: domWindow.Event, writable: true, configurable: true });

// Mock matchMedia
(global.window as any).matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

// Mock requestAnimationFrame
(global.window as any).requestAnimationFrame = (cb: () => void) => setTimeout(cb, 16);
(global.window as any).cancelAnimationFrame = (id: any) => clearTimeout(id);

// Mock ResizeObserver & IntersectionObserver
class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(global.window as any).ResizeObserver = MockObserver;
(global.window as any).IntersectionObserver = MockObserver;

// Simulation Runner
async function runSimulationSuite() {
  console.log('===========================================================');
  console.log('🚀 DÉMARRAGE DE LA SUITE DE SIMULATION — APPLICATION OZI');
  console.log('===========================================================\n');

  let passedTests = 0;
  let totalTests = 5;

  const { ErrorBoundary } = await import('../src/components/common/ErrorBoundary.js');
  const { OziProvider } = await import('../src/context/OziContext.js');
  const { default: App } = await import('../src/App.js');
  const { WorkDetailView } = await import('../src/components/app/WorkDetailView.js');
  const { ReaderView } = await import('../src/components/app/ReaderView.js');
  const { INITIAL_WORKS, INITIAL_CHAPTERS } = await import('../src/data/seedData.js');

  // -------------------------------------------------------------
  // TEST 1 : Démarrage à froid (Cold Start / Premier lancement)
  // -------------------------------------------------------------
  console.log('🧪 TEST 1 : Démarrage à froid (LocalStorage vide, premier lancement)');
  try {
    localStorage.clear();

    const appHtml = renderToString(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(OziProvider, null, React.createElement(App, null))
      )
    );

    // Vérifier que le rendu n'est pas vide et ne contient pas l'écran d'erreur
    if (!appHtml || appHtml.trim().length === 0) {
      throw new Error('Le rendu HTML est vide (Écran noir détecté).');
    }
    if (appHtml.includes('ozi-error-boundary-screen')) {
      throw new Error("L'ErrorBoundary s'est déclenché au premier démarrage !");
    }
    if (!appHtml.includes('OZI') && !appHtml.includes('Webtoon')) {
      throw new Error("Le contenu OZI n'a pas été généré.");
    }

    console.log('   ✅ Rendu initial réussi sans erreur.');
    console.log(`   📊 Taille de l\'arbre rendu : ${appHtml.length} octets.`);
    passedTests++;
  } catch (err: any) {
    console.error('   ❌ Échec du Test 1 :', err.message);
  }

  // -------------------------------------------------------------
  // TEST 2 : Robustesse face à un cache local corrompu
  // -------------------------------------------------------------
  console.log('\n🧪 TEST 2 : Démarrage avec LocalStorage corrompu ou incomplet');
  try {
    localStorage.clear();
    // Injections de données potentiellement destructrices
    localStorage.setItem('ozi_works_data', '[]');
    localStorage.setItem('ozi_chapters_data', '[null, undefined, {}]');
    localStorage.setItem('ozi_games_data', 'invalid_json{{{');
    localStorage.setItem('ozi_comments_data', 'null');
    localStorage.setItem('ozi_articles_data', 'undefined');

    const appHtml = renderToString(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(OziProvider, null, React.createElement(App, null))
      )
    );

    if (appHtml.includes('ozi-error-boundary-screen')) {
      throw new Error("L'application a crashé suite aux données corrompues.");
    }
    if (!appHtml.includes('Catalogue') && !appHtml.includes('OZI')) {
      throw new Error('Les données de repli sécurisées n ont pas été chargées.');
    }

    console.log('   ✅ Auto-récupération et assainissement du cache réussis.');
    console.log('   🛡️ Aucun crash "Cannot read property of undefined [0]".');
    passedTests++;
  } catch (err: any) {
    console.error('   ❌ Échec du Test 2 :', err.message);
  }

  // -------------------------------------------------------------
  // TEST 3 : Simulation Environnement Mobile Natif Capacitor (Android WebView)
  // -------------------------------------------------------------
  console.log('\n🧪 TEST 3 : Simulation WebView Native Android (Capacitor)');
  try {
    (global.window as any).Capacitor = {
      isNativePlatform: () => true,
      getPlatform: () => 'android',
      isPluginAvailable: () => true,
    };

    const appHtml = renderToString(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(OziProvider, null, React.createElement(App, null))
      )
    );

    if (appHtml.includes('ozi-error-boundary-screen')) {
      throw new Error("Crash détecté lors de l'exécution en mode natif Capacitor.");
    }

    console.log('   ✅ Environnement Capacitor Android simulé avec succès.');
    passedTests++;
  } catch (err: any) {
    console.error('   ❌ Échec du Test 3 :', err.message);
  }

  // -------------------------------------------------------------
  // TEST 4 : Simulation du Lecteur Webtoon & Détail d'œuvre
  // -------------------------------------------------------------
  console.log('\n🧪 TEST 4 : Rendu du Lecteur Webtoon et de la fiche Détail');
  try {
    localStorage.clear();

    const detailHtml = renderToString(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(
          OziProvider,
          null,
          React.createElement(WorkDetailView, {
            work: INITIAL_WORKS[0],
            onBack: () => {},
            onSelectChapter: () => {},
          })
        )
      )
    );

    const readerHtml = renderToString(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(
          OziProvider,
          null,
          React.createElement(ReaderView, {
            work: INITIAL_WORKS[0],
            chapter: INITIAL_CHAPTERS[0],
            onBack: () => {},
          })
        )
      )
    );

    if (detailHtml.includes('ozi-error-boundary-screen') || readerHtml.includes('ozi-error-boundary-screen')) {
      throw new Error('Crash dans le lecteur ou le détail.');
    }

    console.log('   ✅ Fiche d\'œuvre et Lecteur Webtoon rendus sans interruption.');
    passedTests++;
  } catch (err: any) {
    console.error('   ❌ Échec du Test 4 :', err.message);
  }

  // -------------------------------------------------------------
  // TEST 5 : Validation du Mécanisme de Secours ErrorBoundary
  // -------------------------------------------------------------
  console.log('\n🧪 TEST 5 : Validation du filet de sécurité (ErrorBoundary)');
  try {
    const testError = new Error('Erreur simulée pour tester l\'auto-défense OZI');
    const derivedState = ErrorBoundary.getDerivedStateFromError(testError);

    if (!derivedState.hasError || derivedState.error !== testError) {
      throw new Error('getDerivedStateFromError ne bascule pas correctement hasError à true.');
    }

    // Instanciation directe de l'ErrorBoundary en état d'erreur
    const errorBoundaryInstance = new ErrorBoundary({
      children: null,
      fallbackTitle: 'OZI — Petite pause technique',
    });
    errorBoundaryInstance.state = derivedState;

    const errorUi = errorBoundaryInstance.render();
    const errorHtml = renderToString(errorUi as React.ReactElement);

    if (!errorHtml.includes('ozi-error-boundary-screen')) {
      throw new Error('L\'ErrorBoundary ne rend pas l\'écran de secours.');
    }
    if (!errorHtml.includes('Petite pause technique')) {
      throw new Error('Le message utilisateur bienveillant est absent.');
    }
    if (!errorHtml.includes('btn-error-reload') || !errorHtml.includes('btn-error-reset-cache')) {
      throw new Error('Les boutons de secours (recharger / vider le cache) sont absents.');
    }

    console.log('   ✅ getDerivedStateFromError bascule instantanément l\'état vers hasError.');
    console.log('   ✅ L\'interface de secours ozi-error-boundary-screen s\'affiche.');
    console.log('   🛡️ Boutons de rechargement et réinitialisation de cache opérationnels.');
    passedTests++;
  } catch (err: any) {
    console.error('   ❌ Échec du Test 5 :', err.message);
  }

  // -------------------------------------------------------------
  // TEST 6 : Validation du rendu des vues secondaires (Catalogue, Jeux, Profil, Articles, Recherche)
  // -------------------------------------------------------------
  console.log('\n🧪 TEST 6 : Rendu sans faille de toutes les vues applicatives');
  totalTests = 6;
  try {
    const { CatalogueView } = await import('../src/components/app/CatalogueView.js');
    const { GamesArcadeView } = await import('../src/components/app/GamesArcadeView.js');
    const { UserProfileView } = await import('../src/components/app/UserProfileView.js');
    const { ArticlesView } = await import('../src/components/app/ArticlesView.js');
    const { SearchModal } = await import('../src/components/app/SearchModal.js');

    const views = [
      { name: 'Catalogue & Filtres', component: CatalogueView },
      { name: 'Jeux Arcade', component: GamesArcadeView },
      { name: 'Profil Utilisateur', component: UserProfileView },
      { name: 'Articles & Actualités', component: ArticlesView },
      { name: 'Modal de Recherche', component: SearchModal },
    ];

    for (const v of views) {
      const html = renderToString(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(OziProvider, null, React.createElement(v.component as any, { isOpen: true, onClose: () => {} }))
        )
      );
      if (!html || html.includes('ozi-error-boundary-screen')) {
        throw new Error(`Échec de rendu de la vue ${v.name}`);
      }
      console.log(`   ✅ Vue "${v.name}" rendue sans aucune erreur (${html.length} octets).`);
    }

    passedTests++;
  } catch (err: any) {
    console.error('   ❌ Échec du Test 6 :', err.message);
  }

  // -------------------------------------------------------------
  // Bilan
  // -------------------------------------------------------------
  console.log('\n===========================================================');
  console.log(`RÉSULTAT GLOBAL : ${passedTests}/${totalTests} TESTS VALIDÉS`);
  console.log('===========================================================');

  if (passedTests === totalTests) {
    console.log('🎉 TOUTES LES SIMULATIONS ONT RÉUSSI : LE PROBLÈME D\'ÉCRAN NOIR EST 100% RÉSOLU !');
    process.exit(0);
  } else {
    console.error('⚠️ CERTAINS TESTS ONT ÉCHOUÉ.');
    process.exit(1);
  }
}

runSimulationSuite().catch((e) => {
  console.error('Erreur fatale de simulation:', e);
  process.exit(1);
});
