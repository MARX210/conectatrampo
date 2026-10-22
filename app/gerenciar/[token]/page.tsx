'use client';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

type Item = { id: string; title: string; status: string; createdAt: string; url: string };
export default function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { fetch(`/api/manage/${encodeURIComponent(token)}`).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Link inválido.'); setItem(d.opportunity); }).catch(e => setError(e.message || 'Não foi possível localizar a publicação.')).finally(() => setLoading(false)); }, [token]);
  async function closePublication() {
    if (!confirm('Encerrar esta publicação? Ela deixará de aparecer na lista pública.')) return;
    setBusy(true); setError('');
    try { const r = await fetch(`/api/manage/${encodeURIComponent(token)}`, { method: 'DELETE' }); const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Não foi possível encerrar.'); setDone(true); setItem(null); }
    catch (e) { setError(e instanceof Error ? e.message : 'Erro ao encerrar.'); }
    finally { setBusy(false); }
  }
  return <main className="publish-page"><header className="site-header wrap"><Link href="/" className="brand"><span className="brand-mark">ct</span><span>Conecta<span className="brand-accent">Trampo</span><small>TRABALHO QUE CONECTA</small></span></Link><Link className="text-link" href="/">← Página inicial</Link></header><section className="form-layout wrap"><div className="form-intro"><div className="eyebrow">ÁREA DO PUBLICADOR</div><h1>Gerencie sua<br/><span>publicação.</span></h1><p>Use esta página privada para verificar e encerrar o anúncio que você publicou.</p><div className="notice-box"><b>Proteja este endereço</b><p>Qualquer pessoa com este link poderá gerenciar a publicação. Não o compartilhe publicamente.</p></div></div><div className="form-card">{loading ? <p>Carregando publicação…</p> : done ? <div className="success-state"><div className="success-icon">✓</div><h2>Publicação encerrada</h2><p>Ela não aparecerá mais na lista pública de oportunidades. O registro é mantido no sistema para integridade e prevenção de abuso.</p><Link className="button button-primary full-button" href="/">Voltar para o ConectaTrampo</Link></div> : error && !item ? <div className="empty-state"><h2>Não foi possível abrir</h2><p>{error}</p><p>Verifique se o link está completo e se foi copiado corretamente.</p><Link className="button button-secondary full-button" href="/">Voltar ao site</Link></div> : item ? <><div className="form-card-heading"><span className="form-icon">✓</span><div><h2>Sua publicação</h2><p>Status: {item.status === 'active' ? 'Ativa' : 'Encerrada'}</p></div></div><h3>{item.title}</h3>{item.url && <p><a href={item.url} target="_blank" rel="noopener noreferrer">Abrir link original ↗</a></p>}<p className="field-help">Publicada em {new Date(item.createdAt).toLocaleDateString('pt-BR')}.</p>{item.status === 'active' ? <button className="button button-primary full-button" disabled={busy} onClick={closePublication}>{busy ? 'Encerrando…' : 'Encerrar publicação'}</button> : <p>Esta publicação já foi encerrada.</p>}{error && <p className="form-error" role="alert">{error}</p>}<p className="form-disclaimer">Encerrar a publicação a remove dos resultados públicos, mas não apaga o registro de auditoria do banco de dados.</p></> : null}</div></section><footer className="simple-footer wrap"><span>© {new Date().getFullYear()} ConectaTrampo</span><Link href="/privacidade">Privacidade</Link></footer></main>;
}
