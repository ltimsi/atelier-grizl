// Registre des documents officiels sur lesquels s'appuie la scène 3D.
// Règle des sources (docs/regle-des-sources.md) : cotes, formes et références viennent d'un document du fabricant.
// Park Tool n'y figure pas : il ne sert que pour les gestes, jamais pour une cote ou une forme.
// Module pur : aucune dépendance, utilisable tel quel dans le navigateur et dans Node.

const SHIMANO_DM = 'https://si.shimano.com';
const SHIMANO_INFO = 'https://productinfo.shimano.com/en';

export const SOURCES = Object.freeze({
  // Canyon
  'canyon-4553': Object.freeze({
    titre: 'Canyon, fiche suisse du Grizl CF 7 (4553), coloris Floating Violet',
    url: 'https://www.canyon.com/fr-ch/velos-de-gravel/adventure/grizl/cf/grizl-cf-7/4553.html?dwvar_4553_pv_rahmenfarbe=R126_P06',
    type: 'fiche',
  }),
  'canyon-photo-4553-fv': Object.freeze({
    titre: 'Canyon, photo officielle du Grizl CF 7, Floating Violet',
    url: 'https://dma.canyon.com/image/upload/w_1600,c_fit/b_rgb:F2F2F2/f_auto/q_auto/v1785934004/2027_FULL_grizl_cf-7_4553_R126_P06_talwxt',
    type: 'photo',
  }),
  'canyon-photo-4553-confort': Object.freeze({
    titre: 'Canyon, photo officielle de la fiche du Grizl CF 7, Floating Violet : collier, tige et selle',
    url: 'https://dma.canyon.com/image/upload/w_1439,h_1439,c_fill/f_auto/q_auto/v1785325520/2027_TOP-5_grizl_cf-7_4553_R126_P06_comfort_uzbklm',
    type: 'photo',
  }),
  'canyon-photo-4553-degagement': Object.freeze({
    titre: 'Canyon, photo officielle du dégagement des pneus sur la fiche du Grizl CF 7 ' +
      '(vélo photographié : Grizl CF 6, Floating Violet)',
    url: 'https://dma.canyon.com/image/upload/w_1439,h_1439,c_fill/f_auto/q_auto/v1785415216/2027_TOP-3_grizl_cf-6_4552_R126_P06_tyre-clearance_oopxdn',
    type: 'photo',
  }),
  'canyon-sp100': Object.freeze({
    titre: 'Canyon, page de la tige de selle SP100 VCLS 2.1 CF 27.2',
    url: 'https://www.canyon.com/fr-ch/accessoires-velo/composants/tige-de-selle-et-colliers/canyon-sp100-vcls-2.1-cf-27.2-seatpost/10016374.html',
    type: 'fiche',
  }),
  'canyon-photo-sp100': Object.freeze({
    titre: 'Canyon, photo officielle de la tige de selle SP100, de profil',
    url: 'https://dma.canyon.com/image/upload/w_1439,c_fit/b_rgb:F2F2F2/f_auto/q_auto/v1778239226/2026_full_S-PARTS_SP-C000002655-P0100-01-P01-350_10016374_BK_full_w05odu',
    type: 'photo',
  }),
  'canyon-photo-sp100-marquage': Object.freeze({
    titre: 'Canyon, photo officielle de la tête de la tige SP100, avec les cotes imprimées sur la tige',
    url: 'https://dma.canyon.com/image/upload/w_1439,h_1439,c_fit/b_rgb:F2F2F2/f_auto/q_auto/v1778505931/2026_ALT-1_ACC_SP-C000002655-P0100-01-P01-350_10016374_BK_Full_qgacz3',
    type: 'photo',
  }),
  'canyon-geometrie-velo-route': Object.freeze({
    titre: 'Canyon, page d’explication de la géométrie (stack et reach efficaces)',
    url: 'https://www.canyon.com/fr-ch/blog-content/actualite-velo-route/explication-geometrie-velo-route/b19102022.html',
    type: 'fiche',
  }),

  // Continental
  'continental-terra-adventure': Object.freeze({
    titre: 'Continental, page du pneu Terra Adventure',
    url: 'https://www.continental-tires.com/products/bicycle/tires/terra-adventure/',
    type: 'fiche',
  }),

  // Shimano : manuels revendeur (DM), cités dans src/parts/20-freins.html
  'shimano-dm-gadbr01': Object.freeze({
    titre: 'Shimano DM-GADBR01, manuel revendeur des freins GRX (français)',
    url: `${SHIMANO_DM}/fr/pdfs/dm/GADBR01/DM-GADBR01-10-FRE.pdf`,
    type: 'manuel',
  }),
  'shimano-dm-hb0002': Object.freeze({
    titre: 'Shimano DM-HB0002, manuel revendeur (anglais)',
    url: `${SHIMANO_DM}/en/pdfs/dm/HB0002/DM-HB0002-14-ENG.pdf`,
    type: 'manuel',
  }),
  'shimano-dm-torque': Object.freeze({
    titre: 'Shimano DM-TORQUE, couples de serrage (anglais)',
    url: `${SHIMANO_DM}/en/pdfs/dm/TORQUE/DM-TORQUE-03-ENG.pdf`,
    type: 'manuel',
  }),
  'shimano-dm-rawh010': Object.freeze({
    titre: 'Shimano DM-RAWH010, manuel revendeur (anglais)',
    url: `${SHIMANO_DM}/en/pdfs/dm/RAWH010/DM-RAWH010-02-ENG.pdf`,
    type: 'manuel',
  }),

  // Shimano : tableaux de compatibilité et pages produit, cités dans src/parts/20-freins.html
  'shimano-c-192': Object.freeze({
    titre: 'Shimano C-192, tableau de compatibilité',
    url: `${SHIMANO_INFO}/compatibility/C-192`,
    type: 'tableau',
  }),
  'shimano-c-461': Object.freeze({
    titre: 'Shimano C-461, tableau de compatibilité',
    url: `${SHIMANO_INFO}/compatibility/C-461`,
    type: 'tableau',
  }),
  'shimano-c-612': Object.freeze({
    titre: 'Shimano C-612, tableau de compatibilité',
    url: `${SHIMANO_INFO}/compatibility/C-612`,
    type: 'tableau',
  }),
  'shimano-rx610-2x12': Object.freeze({
    titre: 'Shimano, page de la gamme GRX RX610 2x12',
    url: `${SHIMANO_INFO}/lineup/rx610-2x12`,
    type: 'fiche',
  }),
  'shimano-rx820-2x12-di2': Object.freeze({
    titre: 'Shimano, page de la gamme GRX RX820 2x12 Di2',
    url: `${SHIMANO_INFO}/lineup/rx820-2x12-di2`,
    type: 'fiche',
  }),
  'shimano-l04c-mf': Object.freeze({
    titre: 'Shimano, page des plaquettes L04C-MF',
    url: 'https://bike.shimano.com/en-NA/products/service-and-upgrade-parts/pdp.P-BP-L04C-MF.html',
    type: 'fiche',
  }),
});
