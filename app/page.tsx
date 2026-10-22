'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Opportunity = { id: string; title: string; description: string; category: string; kind: string; location: string; mode: string; pay: string; contact: string; url: string; createdAt: string; source: 'external' | 'community'; sourceTitle?: string };

const categories = ['Todas as categorias','Administração','Atendimento e vendas','Design e criação','Marketing e conteúdo','Tecnologia','Serviços gerais','Educação','Outros'];

export default function Home() {
  const [jobs, setJobs] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas as categorias');
  const [kind, setKind] = useState('Todas');
  const [showCookie, setShowCookie] = useState(false);

  useEffect(() => {
    fetch('/api/opportunities').then(async r => { if (!r.ok) throw new Error('load'); const data = await r.json(); setJobs(data.opportunities || []); }).catch(() => setLoadError(true)).finally(() => setLoading(false));
    setShowCookie(!localStorage.getItem('ct-cookie-choice'));
  }, []);

  const filtered = useMemo(() => jobs.filter(j => {
    const text = `${j.title} ${j.description} ${j.location} ${j.category}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (category === 'Todas as categorias' || j.category === category) && (kind === 'Todas' || j.kind === kind);
  }), [jobs, query, category, kind]);

  return <main>
    <div className="announcement"><span className="announcement-dot"/> Oportunidades locais, conexões reais <span className="announcement-sep">·</span> Joinville, SC</div>
    <header className="site-header wrap">
      <Link href="/" className="brand" aria-label="ConectaTrampo, página inicial"><span className="brand-mark">ct</span><span>Conecta<span className="brand-accent">Trampo</span><small>TRABALHO QUE CONECTA</small></span></Link>
      <nav aria-label="Navegação principal"><a href="#oportunidades">Encontrar trabalho</a><a href="#como-funciona">Como funciona</a><Link className="nav-publish" href="/publicar">＋ Publicar oportunidade</Link></nav>
    </header>

    <section className="hero wrap">
      <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-icon">✳</span> SUA PRÓXIMA CONEXÃO COMEÇA AQUI</div>
        <h1>Talentos e oportunidades.<br/><span>Conectados.</span></h1>
        <p className="hero-lead">Encontre freelas, serviços e oportunidades de trabalho em Joinville — ou divulgue o que você precisa contratar.</p>
        <div className="hero-actions"><a className="button button-primary" href="#oportunidades">Explorar oportunidades <span aria-hidden="true">↗</span></a><Link className="button button-secondary" href="/publicar">＋ Publicar gratuitamente</Link></div>
        <div className="hero-note"><span className="check-circle">✓</span> Gratuito para consultar e publicar</div>
      </div>
      <div className="hero-art" aria-label="Ilustração abstrata de conexões profissionais" role="img"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="float-card float-card-top"><span className="mini-icon lilac">✦</span><span><b>Novas conexões</b><small>Começam com uma oportunidade</small></span></div><div className="main-symbol"><div className="symbol-inner">ct</div><span className="spark spark-one">✦</span><span className="spark spark-two">✳</span></div><div className="float-card float-card-bottom"><span className="mini-icon green">↗</span><span><b>Uma oportunidade</b><small>Pode mudar tudo.</small></span><span className="online-dot"/></div><span className="art-dot dot-one"/><span className="art-dot dot-two"/><span className="art-dot dot-three"/></div>
    </section>

    <section className="search-section wrap" aria-label="Buscar oportunidades"><div className="search-box"><label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">Buscar por cargo, serviço ou palavra-chave</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cargo, serviço ou palavra-chave" /></label><label className="search-field location-field"><span aria-hidden="true">⌖</span><span className="sr-only">Localização</span><input value="Joinville, SC" readOnly aria-label="Localização padrão: Joinville, Santa Catarina"/></label><button className="button button-primary search-button" onClick={()=>document.getElementById('oportunidades')?.scrollIntoView({behavior:'smooth'})}>Buscar oportunidades <span aria-hidden="true">→</span></button></div><div className="quick-search"><span>Em alta:</span><button onClick={()=>{setQuery('freelance');setKind('Freelance')}}>Freelance</button><button onClick={()=>setQuery('remoto')}>Remoto</button><button onClick={()=>setQuery('design')}>Design</button><button onClick={()=>setQuery('atendimento')}>Atendimento</button><button onClick={()=>{setQuery('');setKind('Todas')}}>Limpar filtros</button></div></section>

    <section id="oportunidades" className="opportunities wrap"><div className="section-heading"><div><div className="eyebrow">FEITO PARA SE MOVER</div><h2>Oportunidades para <span>acontecer.</span></h2><p>Trabalhos divulgados pela comunidade e links para oportunidades externas.</p></div><Link className="text-link" href="/publicar">Tem uma oportunidade? Publique →</Link></div>
      <div className="filters"><div className="filter-tabs" aria-label="Filtrar por tipo">{['Todas','Emprego','Freelance','Serviço'].map(t=><button key={t} className={kind===t?'active':''} onClick={()=>setKind(t)}>{t}</button>)}</div><label className="category-select"><span className="sr-only">Filtrar por categoria</span><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label></div>
      <div className="job-grid">{filtered.map((job,i)=><article className="job-card" key={job.id}><div className="job-card-top"><div className={`company-avatar avatar-${i%4}`}>{job.category==='Tecnologia'?'⌘':job.category==='Design e criação'?'✳':job.category==='Atendimento e vendas'?'↗':'✦'}</div><span className={`type-badge ${job.kind==='Freelance'?'badge-purple':job.kind==='Serviço'?'badge-green':''}`}>{job.kind}</span></div><div className="job-category">{job.category}</div><h3>{job.title}</h3><p className="job-description">{job.description}</p><div className="job-meta"><span>⌖ {job.location}</span><span>◷ {job.mode}</span></div><div className="job-card-bottom"><div><small>Remuneração</small><b>{job.pay || 'A combinar'}</b></div>{job.url ? <a className="card-action" href={job.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir oportunidade externa: ${job.title}`}>Ver vaga <span aria-hidden="true">↗</span></a> : <a className="card-action" href={`mailto:${job.contact}?subject=${encodeURIComponent('Tenho interesse: '+job.title)}`}>Tenho interesse <span aria-hidden="true">→</span></a>}</div>{job.source==='external'&&<div className="external-note">↗ Link externo · confira as condições na origem</div>}</article>)}</div>
      {filtered.length===0&&<div className="empty-state"><span>⌕</span><h3>Nenhuma oportunidade encontrada</h3><p>Tente outro termo ou limpe os filtros para ver mais resultados.</p><button className="button button-secondary" onClick={()=>{setQuery('');setCategory('Todas as categorias');setKind('Todas')}}>Limpar filtros</button></div>}
      <div className="results-note">{loading ? 'Carregando oportunidades…' : loadError ? 'Não foi possível conectar ao banco de dados.' : `${filtered.length} ${filtered.length===1?'oportunidade encontrada':'oportunidades encontradas'}`} <span>·</span> Confira sempre os detalhes com o anunciante.</div>
    </section>

    <section id="como-funciona" className="how-section"><div className="wrap"><div className="section-heading centered"><div><div className="eyebrow">SIMPLES ASSIM</div><h2>Uma comunidade. <span>Mais possibilidades.</span></h2><p>O ConectaTrampo aproxima quem procura e quem oferece trabalho.</p></div></div><div className="steps-grid"><article className="step-card"><span className="step-number">01</span><div className="step-icon">⌕</div><h3>Encontre</h3><p>Explore oportunidades e acesse os links originais para saber mais e se candidatar.</p></article><article className="step-card"><span className="step-number">02</span><div className="step-icon">↗</div><h3>Publique</h3><p>Divulgue um freela, um serviço ou uma oportunidade sem pagar para anunciar.</p></article><article className="step-card"><span className="step-number">03</span><div className="step-icon">✳</div><h3>Conecte-se</h3><p>Entre em contato com o anunciante e combine os próximos passos diretamente.</p></article></div></div></section>

    <section className="cta-section wrap"><div className="cta-orb" aria-hidden="true">✳</div><div><div className="eyebrow">SUA PRÓXIMA CONEXÃO</div><h2>Tem uma oportunidade<br/>para compartilhar?</h2><p>Ajude alguém a encontrar o próximo trabalho ou encontre o talento que está procurando.</p></div><Link href="/publicar" className="button button-light">Publicar gratuitamente <span aria-hidden="true">↗</span></Link></section>

    <footer className="site-footer"><div className="wrap footer-main"><Link href="/" className="brand footer-brand"><span className="brand-mark">ct</span><span>Conecta<span className="brand-accent">Trampo</span><small>TRABALHO QUE CONECTA</small></span></Link><p>Oportunidades e conexões profissionais, começando por Joinville, SC.</p><div className="footer-links"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos de uso</Link><Link href="/cookies">Cookies</Link><a href="mailto:contato@conectatrampo.com.br">Contato</a></div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} ConectaTrampo. Projeto em fase inicial.</span><span>Não garantimos a veracidade ou contratação em oportunidades externas. Verifique antes de compartilhar dados.</span></div></footer>
    {showCookie&&<div className="cookie-banner" role="dialog" aria-label="Aviso de armazenamento local"><div><b>Uma experiência mais simples</b><p>Este site usa armazenamento local para lembrar sua escolha neste aviso. Não usamos rastreadores publicitários nesta versão.</p><Link href="/cookies">Saiba mais</Link></div><button className="button button-primary" onClick={()=>{localStorage.setItem('ct-cookie-choice','acknowledged');setShowCookie(false)}}>Entendi</button></div>}
  </main>;
}
