// Aide des tests : le motif qui reconnaît le Grizl CF 7 et ses pièces, que le CF 8 Di2 remplace. Fiche, photos, pneus,
// selle, transmission, manettes et disques d'avant. Un seul motif pour tous les tests, pour que leurs copies ne
// divergent pas.
export const CF7 = /4553|cf-7|CF 7|continental|terra-adventure|terra adventure|selle royal|\bSRX\b|rx822|m7100|rx610|sm-rt64|rs500/i;

// Des noms de l'ancien vélo, pour vérifier que le motif les attrape.
export const NOMS_CF7 = Object.freeze([
  'canyon-4553', 'grizl-cf-7', 'continental-terra-adventure', 'Selle Royal SRX', 'shimano-rd-rx822-gs', 'CS-M7100-12',
  'FC-RX610-1', 'shimano-rx610-1x12', 'SM-RT64', 'BB-RS500-PB',
]);
