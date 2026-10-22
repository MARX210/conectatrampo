'use client';
import Link from 'next/link';
import { useState } from 'react';

type Published = { title: string; managementUrl: string; metadataDetected: boolean };

export default function PublicarPage() {
  const [kind, setKind] = useState('Link externo');
  const [published, setPublished] = useState<Published | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isExternal = kind === 'Link externo';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const response = await fetch('/api/opportunities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível publicar.');
      setPublished({ title: data.opportunity.title, managementUrl: data.managementUrl, metadataDetected: data.metadataDetected });
    } catch (err) { setError(err instanceof Error ? err.message : 'Falha ao publicar. Tente novamente.'); }
    finally { setLoading(false); }
  }

  async function copyManagementLink() {
    if (!published) return;
    const full = `${window.location.origin}${published.managementUrl}`;
    try { await navigator.clipboard.writeText(full); alert('Link de gerenciamento copiado. Guarde-o para encerrar sua publicação depois.'); }
    catch { window.prompt('Copie e guarde este link privado:', full); }
  }

  return <main className="publish-page">
    <header className="site-header wrap"><Link href="/" className="brand"><span className="brand-mark">ct</span><span>Conecta<span className="brand-accent">Trampo</span><small>TRABALHO QUE CONECTA</small></span></Link><Link className="text-link" href="/">← Voltar para oportunidades</Link></header>
    <section className="form-layout wrap">
      <div className="form-intro"><div className="eyebrow">PUBLICAÇÃO GRATUITA</div><h1>Uma oportunidade<br/><span>pode conectar tudo.</span></h1><p>Compartilhe um link em poucos segundos ou informe os detalhes do profissional que você precisa contratar.</p><div className="form-promise"><span>✓</span> Sem cobrança para publicar</div><div className="form-promise"><span>✓</span> Links externos com preenchimento automático quando possível</div><div className="form-promise"><span>✓</span> Link privado para encerrar sua publicação depois</div><div className="notice-box"><b>Antes de publicar</b><p>As publicações ficam visíveis imediatamente. Não inclua dados pessoais sensíveis. O link de gerenciamento funciona como uma chave privada: guarde-o e não compartilhe com outras pessoas.</p></div></div>
      <div className="form-card">
        {published ? <div className="success-state"><div className="success-icon">✓</div><h2>Publicação criada!</h2><p><strong>{published.title}</strong> já foi enviada para a plataforma.</p><p>{published.metadataDetected ? 'Detectamos informações na página original e usamos os dados disponíveis para preencher o anúncio. Confira os detalhes no site de origem.' : 'Não foi possível detectar todos os detalhes automaticamente. O link original continuará disponível para consulta.'}</p><div className="notice-box"><b>Guarde seu link de gerenciamento</b><p>Com esse link você poderá encerrar a publicação quando ela não estiver mais disponível. Ele é mostrado apenas agora; se perdê-lo, não será possível recuperar o acesso automaticamente.</p><button className="button button-secondary full-button" type="button" onClick={copyManagementLink}>Copiar link privado de gerenciamento</button></div><Link className="button button-primary full-button" href="/">Ver oportunidades</Link><button className="text-button" onClick={() => { setPublished(null); }}>Publicar outra oportunidade</button></div> : <>
          <div className="form-card-heading"><span className="form-icon">＋</span><div><h2>Publicar oportunidade</h2><p>Escolha o tipo de publicação.</p></div></div>
          <form onSubmit={handleSubmit} className="opportunity-form">
            <label>O que você quer publicar? *<select name="kind" value={kind} onChange={e => setKind(e.target.value)}><option value="Link externo">Tenho apenas um link de oportunidade</option><option value="Emprego">Publicar uma vaga de emprego</option><option value="Freelance">Procurar um freelancer</option><option value="Serviço">Divulgar um serviço</option></select></label>
            {isExternal ? <><label>Link da oportunidade *<input name="url" type="url" required placeholder="Cole aqui o link e pronto — ex.: https://..."/><span className="field-help">Vamos tentar detectar automaticamente título, descrição, empresa, categoria, local, modalidade e remuneração. Isso depende das informações públicas que o site de origem disponibiliza.</span></label><p className="field-help">Você não precisa preencher os outros campos para compartilhar um link.</p></> : <>
              <label>Título da oportunidade *<input name="title" required maxLength={160} placeholder={kind === 'Freelance' ? 'Ex.: Procuro designer freelancer' : kind === 'Serviço' ? 'Ex.: Faço manutenção de computadores' : 'Ex.: Assistente administrativo'}/></label>
              <label>Descrição *<textarea name="description" required maxLength={1800} rows={5} placeholder="Descreva o trabalho, requisitos, prazo ou serviço oferecido."/></label>
              <div className="form-row"><label>Categoria<select name="category" defaultValue="Outros"><option>Administração</option><option>Atendimento e vendas</option><option>Design e criação</option><option>Marketing e conteúdo</option><option>Tecnologia</option><option>Serviços gerais</option><option>Educação</option><option>Outros</option></select></label><label>Modalidade<select name="mode" defaultValue="A combinar"><option>A combinar</option><option>Presencial</option><option>Híbrido</option><option>Remoto</option></select></label></div>
              <div className="form-row"><label>Localização (opcional)<input name="location" defaultValue="Joinville, SC" maxLength={120}/></label><label>Pagamento (opcional)<input name="pay" maxLength={120} placeholder="Ex.: R$ 300 por projeto"/></label></div>
              <label>Link externo (opcional)<input name="url" type="url" placeholder="https://..."/><span className="field-help">Se houver uma página com mais detalhes, inclua o link.</span></label>
              <label>Contato (opcional)<input name="contact" maxLength={180} placeholder="E-mail profissional ou WhatsApp"/><span className="field-help">Informe apenas um contato que você tenha autorização para divulgar.</span></label>
            </>}
            <label className="checkbox-label"><input type="checkbox" required/> <span>Confirmo que tenho direito de publicar estas informações e concordo com os <Link href="/termos" target="_blank">Termos de uso</Link> e a <Link href="/privacidade" target="_blank">Política de privacidade</Link>.</span></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" disabled={loading} className="button button-primary full-button">{loading ? 'Publicando…' : 'Publicar gratuitamente'} <span aria-hidden="true">↗</span></button>
            <p className="form-disclaimer">A extração automática depende do site de origem. Publicações podem ser encerradas pelo autor e denunciadas por outros usuários.</p>
          </form>
        </>}
      </div>
    </section>
    <footer className="simple-footer wrap"><span>© {new Date().getFullYear()} ConectaTrampo</span><div><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></div></footer>
  </main>;
}
