// Dit bestand is speciaal aangemaakt voor Hostinger of vergelijkbare hostingpanels.
// Hostinger (via Passenger Node.js) zoekt vaak standaard naar 'app.js' of 'server.js' als opstartbestand.
// Aangezien we de server compileren (bouwen) naar dist/server.cjs, importeren we die hier direct.

import('./dist/server.cjs').catch(err => {
  console.error('Fout bij het opstarten van de applicatie. Is npm run build succesvol uitgevoerd?', err);
});
