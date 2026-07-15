import type { Request, Response } from 'express';
import { acteService } from './acte.service';

function echapper(s: string): string {
  return s.replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c,
  );
}

/** Page publique HTML d'authentification d'un acte (cible du QR code). */
function pageHtml(
  numero: string,
  info: Awaited<ReturnType<typeof acteService.verifier>>,
): string {
  const styleBase =
    "font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:#f7f9fb;color:#191c1e;margin:0;padding:40px 20px;text-align:center";
  if (!info) {
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Acte introuvable</title></head>
      <body style="${styleBase}">
        <h1 style="color:#ba1a1a">Acte introuvable</h1>
        <p>Aucun acte ne correspond au numéro <strong>${echapper(numero)}</strong>.</p>
      </body></html>`;
  }
  const dispo = info.statut === 'Disponible' || info.statut === 'ActeGenere' || info.statut === 'Retire';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vérification d'acte</title></head>
    <body style="${styleBase}">
      <div style="max-width:460px;margin:0 auto;background:#fff;border-radius:20px;padding:32px;box-shadow:0 6px 24px rgba(0,17,58,.08)">
        <div style="font-size:44px">${dispo ? '✅' : 'ℹ️'}</div>
        <h1 style="color:#00113a;font-size:22px">Acte ${dispo ? 'authentique' : 'enregistré'}</h1>
        <p style="color:#444650">Cet acte figure bien dans le registre de l'état civil.</p>
        <div style="text-align:left;margin-top:20px;border-top:1px solid #e6e8ea;padding-top:16px">
          <p><strong>Numéro officiel :</strong> ${echapper(info.numero)}</p>
          <p><strong>Enfant :</strong> ${echapper(info.enfant.prenoms)} ${echapper(info.enfant.nom)}</p>
          <p><strong>Statut :</strong> ${echapper(info.statut)}</p>
        </div>
      </div>
    </body></html>`;
}

export const acteController = {
  async actePdf(req: Request, res: Response) {
    const { buffer, numero } = await acteService.genererPdf(
      req.params.id,
      (n) => `https://${req.get('host')}/verifier/${n}`,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="acte-${numero}.pdf"`);
    res.send(buffer);
  },

  async pageVerification(req: Request, res: Response) {
    const info = await acteService.verifier(req.params.numero);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(pageHtml(req.params.numero, info));
  },
};
