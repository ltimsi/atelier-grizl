// Registre des documents officiels sur lesquels s'appuie la scène 3D.
// Règle des sources (docs/regle-des-sources.md) : cotes, formes et références viennent d'un document du fabricant.
// Park Tool n'y figure pas : il ne sert que pour les gestes, jamais pour une cote ou une forme.
// Module pur : aucune dépendance, utilisable tel quel dans le navigateur et dans Node.

const SHIMANO_DM = 'https://si.shimano.com';
const SHIMANO_INFO = 'https://productinfo.shimano.com/en';
const CONTINENTAL_ONGLETS =
  'https://www.continental-tires.com/products/bicycle/tires/terra-adventure/_jcr_content/root/container/tabs';

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
  'canyon-hb0067': Object.freeze({
    titre: 'Canyon, page du cintre HB0067 AL Gravel Dropbar (évasement, déport, inclinaison, largeurs, collier)',
    url: 'https://www.canyon.com/fr-ch/accessoires-velo/composants/cintres-cockpits-potences/canyon-hb0067-al-gravel-dropbar/9102480.html',
    type: 'fiche',
  }),
  'canyon-photo-hb0067-marquage': Object.freeze({
    titre: 'Canyon, photo officielle du cintre HB0067 de 420, en pleine taille : marquage « REACH 70 mm », ' +
      '« DROP 128 mm », « FLARE 16° »',
    url: 'https://dma.canyon.com/image/upload/v1772197873/2026_full_S-PARTS_HB-CAYN-HB0067-01-AL-31-8-420-bk-gy_10016269_BK_GY_full_bf3ph4',
    type: 'photo',
  }),
  'canyon-photo-st0046': Object.freeze({
    titre: 'Canyon, photo officielle de la potence ST0046 de 60, en pleine taille : marquage « LENGTH 60 mm », « ANGLE 6° »',
    url: 'https://dma.canyon.com/image/upload/v1778490570/2026_full_S-PARTS_ST-ST0046-01-60-31-8-1-1-8_9102474_BK_full_xjukzl',
    type: 'photo',
  }),

  // Continental
  'continental-terra-adventure': Object.freeze({
    titre: 'Continental, page du pneu Terra Adventure',
    url: 'https://www.continental-tires.com/products/bicycle/tires/terra-adventure/',
    type: 'fiche',
  }),
  'continental-photo-terra-adventure-centre': Object.freeze({
    titre: 'Continental, photo officielle des crampons centraux du Terra Adventure (rangées de trois, trois et quatre)',
    url: `${CONTINENTAL_ONGLETS}/item_1742229074804/image.coreimg.png/1758019398356/continental--terra-adventure--feature--center.png`,
    type: 'photo',
  }),
  'continental-photo-terra-adventure-epaules': Object.freeze({
    titre: 'Continental, photo officielle des crampons d’épaule du Terra Adventure',
    url: `${CONTINENTAL_ONGLETS}/item_1742229074804/image_copy.coreimg.png/1758019398454/continental--terra-adventure--feature--shoulder.png`,
    type: 'photo',
  }),

  // DT Swiss
  'dtswiss-manuel-roues': Object.freeze({
    titre: 'DT Swiss, manuel d’utilisation des roues (WHEELS User Manual V2026.07), cité dans le chapitre Freins',
    url: 'https://d2a13k6araex7u.cloudfront.net/pmt/00/00/00/00/00/00/00/10/00/00/00/85/8/MAN_WXWXXXXXX1610S_WEB_ZZ_001.pdf?v=57647',
    type: 'manuel',
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
  'shimano-rx610-1x12': Object.freeze({
    titre: 'Shimano, page de la gamme GRX RX610 1x12 : ST-RX610-R, BL-RX610-L, RD-RX822-GS, CS-M7100-12, FC-RX610-1, ' +
      'BB-RS500-PB, CN-M7100',
    url: `${SHIMANO_INFO}/lineup/rx610-1x12`,
    type: 'fiche',
  }),
  'shimano-fc-rx610-1': Object.freeze({
    titre: 'Shimano, fiche technique du pédalier FC-RX610-1 (ligne de chaîne, entraxe, quatre bras, facteur Q, matières)',
    url: `${SHIMANO_INFO}/product/FC-RX610-1`,
    type: 'fiche',
  }),
  'shimano-bb-rs500-pb': Object.freeze({
    titre: 'Shimano, fiche technique du boîtier BB-RS500-PB (largeur de boîte, adaptateur en résine)',
    url: `${SHIMANO_INFO}/product/BB-RS500-PB`,
    type: 'fiche',
  }),
  'shimano-cs-m7100-12': Object.freeze({
    titre: 'Shimano, fiche technique de la cassette CS-M7100-12 (dentures, matières des pignons et de l’araignée)',
    url: `${SHIMANO_INFO}/product/CS-M7100-12`,
    type: 'fiche',
  }),
  'shimano-cn-m7100': Object.freeze({
    titre: 'Shimano, fiche technique de la chaîne CN-M7100 (plaques grises et SIL-TEC, attache QUICK-LINK)',
    url: `${SHIMANO_INFO}/product/CN-M7100`,
    type: 'fiche',
  }),
  'shimano-rd-rx822-gs': Object.freeze({
    titre: 'Shimano, fiche technique du dérailleur RD-RX822-GS (grand pignon de 45, galets de 13 dents, matières)',
    url: `${SHIMANO_INFO}/product/RD-RX822-GS`,
    type: 'fiche',
  }),
  'shimano-st-rx610-r': Object.freeze({
    titre: 'Shimano, fiche technique de la manette ST-RX610-R (collier, durite SM-BH90-JK-SSR noire, gaines)',
    url: `${SHIMANO_INFO}/product/ST-RX610-R`,
    type: 'fiche',
  }),
  'shimano-bl-rx610-l': Object.freeze({
    titre: 'Shimano, fiche technique du levier de frein BL-RX610-L (levier simple, collier)',
    url: `${SHIMANO_INFO}/product/BL-RX610-L`,
    type: 'fiche',
  }),
  'shimano-rx820-2x12-di2': Object.freeze({
    titre: 'Shimano, page de la gamme GRX RX820 2x12 Di2',
    url: `${SHIMANO_INFO}/lineup/rx820-2x12-di2`,
    type: 'fiche',
  }),
  'shimano-sm-rt64': Object.freeze({
    titre: 'Shimano, fiche technique du disque SM-RT64 (matières, épaisseur, bagues)',
    url: `${SHIMANO_INFO}/product/SM-RT64`,
    type: 'fiche',
  }),
  'shimano-deore-xt-m8000': Object.freeze({
    titre: 'Shimano, page de la gamme Deore XT M8000 2x11 Di2 : disque RT-MT800, Center Lock, FREEZA',
    url: `${SHIMANO_INFO}/lineup/deore-xt-m8000-2x11-di2`,
    type: 'fiche',
  }),
  'shimano-l04c-mf': Object.freeze({
    titre: 'Shimano, page des plaquettes L04C-MF',
    url: 'https://bike.shimano.com/en-NA/products/service-and-upgrade-parts/pdp.P-BP-L04C-MF.html',
    type: 'fiche',
  }),
});
