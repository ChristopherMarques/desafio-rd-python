import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/Badge";
import { DOC_ARTICLES, DOC_CATEGORIES } from "@/docs";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Layers,
  Menu,
  Search,
  X,
} from "lucide-react";

interface DocsReaderProps {
  onBackToMission: () => void;
  initialSlug?: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function DocsReader({ onBackToMission, initialSlug }: DocsReaderProps) {
  const [activeSlug, setActiveSlug] = React.useState<string>(
    initialSlug || DOC_ARTICLES[0].slug
  );
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const activeArticle = React.useMemo(() => {
    return DOC_ARTICLES.find((a) => a.slug === activeSlug) || DOC_ARTICLES[0];
  }, [activeSlug]);

  // Artigo anterior e próximo para navegação guiada no rodapé
  const currentIndex = DOC_ARTICLES.findIndex((a) => a.slug === activeArticle.slug);
  const prevArticle = currentIndex > 0 ? DOC_ARTICLES[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < DOC_ARTICLES.length - 1 ? DOC_ARTICLES[currentIndex + 1] : null;

  // Extração automática de Headings (H2 e H3) para a barra "Nesta página" (estilo Mintlify)
  const tocItems = React.useMemo<TocItem[]>(() => {
    const lines = activeArticle.content.split("\n");
    const items: TocItem[] = [];

    lines.forEach((line) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);

      if (h2Match) {
        const text = h2Match[1].replace(/[*_`]/g, "").trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        items.push({ id, text, level: 2 });
      } else if (h3Match) {
        const text = h3Match[1].replace(/[*_`]/g, "").trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        items.push({ id, text, level: 3 });
      }
    });

    return items;
  }, [activeArticle.content]);

  // Filtro de busca na documentação
  const filteredArticles = React.useMemo(() => {
    if (!searchQuery.trim()) return DOC_ARTICLES;
    const query = searchQuery.toLowerCase();
    return DOC_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleSelectArticle = (slug: string) => {
    setActiveSlug(slug);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-tangram-neutral-dark-bg text-slate-100 flex flex-col font-sans">
      {/* Barra Superior estilo Mintlify */}
      <header className="sticky top-0 z-40 bg-tangram-neutral-inverse/90 backdrop-blur-md border-b border-tangram-neutral-dark-border px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-tangram-neutral-dark-subtle border border-tangram-neutral-dark-border"
              title="Abrir menu de documentação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={onBackToMission}
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-tangram-primary px-3 py-1.5 rounded-lg bg-tangram-neutral-dark-subtle border border-tangram-neutral-dark-border hover:border-tangram-primary/50 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Mission Control</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 border-l border-tangram-neutral-dark-border pl-3">
              <span className="text-xs text-slate-400 font-mono">Documentação Oficial</span>
              <Badge variant="blue" size="sm">
                Mintlify Style
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://tangram.rdstation.com.br/docs/foundations/color/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-tangram-primary font-mono transition-colors"
            >
              <span>Tangram Colors</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-tangram-primary bg-tangram-primary/10 border border-tangram-primary/30 px-3 py-1.5 rounded-lg hover:bg-tangram-primary/20 transition-all"
            >
              <span>Swagger API</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal: Sidebar Esquerda + Leitor Markdown + Sumário "Nesta página" */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex items-start px-4 lg:px-8 py-6 gap-8">
        {/* Sidebar Esquerda (Navegação de Artigos) */}
        <aside
          className={`fixed lg:sticky top-16 left-0 z-30 w-72 lg:w-64 h-[calc(100vh-4rem)] bg-tangram-neutral-inverse lg:bg-transparent border-r lg:border-r-0 border-tangram-neutral-dark-border p-4 lg:p-0 overflow-y-auto transition-transform lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          }`}
        >
          {/* Caixa de Busca */}
          <div className="relative mb-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar nas docs..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-tangram-neutral-dark-subtle border border-tangram-neutral-dark-border text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-tangram-primary transition-all font-mono"
            />
          </div>

          {/* Lista de Categorias e Artigos */}
          <nav className="space-y-6">
            {DOC_CATEGORIES.map((category) => {
              const articles = filteredArticles.filter((a) => a.category === category);
              if (articles.length === 0) return null;

              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
                    <Layers className="w-3 h-3 text-tangram-primary" />
                    <span>{category}</span>
                  </div>

                  <div className="space-y-0.5">
                    {articles.map((art) => {
                      const isSelected = art.slug === activeArticle.slug;
                      return (
                        <button
                          key={art.slug}
                          onClick={() => handleSelectArticle(art.slug)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between group ${
                            isSelected
                              ? "bg-tangram-primary/15 text-tangram-primary border border-tangram-primary/40 shadow-sm"
                              : "text-slate-300 hover:text-white hover:bg-tangram-neutral-dark-subtle/80"
                          }`}
                        >
                          <span className="truncate">{art.title}</span>
                          {art.badge && (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                isSelected
                                  ? "bg-tangram-primary text-slate-900"
                                  : "bg-tangram-neutral-dark-subtle text-slate-400 group-hover:text-slate-200"
                              }`}
                            >
                              {art.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Backdrop para fechar menu no mobile */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          />
        )}

        {/* Leitor Central do Artigo */}
        <main className="flex-1 min-w-0 max-w-3xl pb-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-3">
            <span>Docs</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-slate-300">{activeArticle.category}</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-tangram-primary truncate">{activeArticle.title}</span>
          </div>

          {/* Cabeçalho do Artigo */}
          <div className="pb-6 mb-8 border-b border-tangram-neutral-dark-border">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="blue" size="sm">
                {activeArticle.category}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                &bull; Leitura estimada: {activeArticle.readingTime}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeArticle.title}
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {activeArticle.description}
            </p>
          </div>

          {/* Conteúdo Markdown com ReactMarkdown + RemarkGFM */}
          <article className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-8 mb-4 tracking-tight pb-2 border-b border-tangram-neutral-dark-border/80">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/\s+/g, "-");
                  return (
                    <h2
                      id={id}
                      className="text-lg sm:text-xl font-bold text-white mt-8 mb-3 flex items-center gap-2 group scroll-mt-20"
                    >
                      <span className="text-tangram-primary">#</span>
                      {children}
                    </h2>
                  );
                },
                h3: ({ children }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/\s+/g, "-");
                  return (
                    <h3
                      id={id}
                      className="text-base font-bold text-slate-100 mt-6 mb-2 scroll-mt-20"
                    >
                      {children}
                    </h3>
                  );
                },
                p: ({ children }) => (
                  <p className="text-slate-300 leading-relaxed my-3">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 space-y-1.5 my-3 text-slate-300">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 space-y-1.5 my-3 text-slate-300">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed marker:text-tangram-primary">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <div className="border-l-4 border-tangram-primary bg-tangram-neutral-dark-subtle/70 px-4 py-2.5 rounded-r-lg my-4 text-xs text-slate-200">
                    {children}
                  </div>
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  const codeString = String(children).replace(/\n$/, "");

                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-tangram-neutral-dark-subtle border border-tangram-neutral-dark-border text-tangram-primary font-mono text-[12px]">
                        {children}
                      </code>
                    );
                  }

                  const isCopied = copiedCode === codeString;

                  return (
                    <div className="relative my-4 rounded-xl overflow-hidden border border-tangram-neutral-dark-border bg-tangram-neutral-dark-bg">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-tangram-neutral-dark-subtle/80 border-b border-tangram-neutral-dark-border text-[11px] font-mono text-slate-400">
                        <span>Código / Payload</span>
                        <button
                          onClick={() => copyToClipboard(codeString)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors"
                          title="Copiar código"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-tangram-success" />
                              <span className="text-tangram-success text-[10px]">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 overflow-x-auto font-mono text-xs text-slate-200 leading-normal">
                        <code {...props}>{children}</code>
                      </pre>
                    </div>
                  );
                },
                table: ({ children }) => (
                  <div className="my-5 overflow-x-auto rounded-xl border border-tangram-neutral-dark-border">
                    <table className="w-full text-left text-xs border-collapse">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-tangram-neutral-dark-subtle border-b border-tangram-neutral-dark-border text-slate-200 uppercase font-mono tracking-wider text-[11px]">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="p-3 font-bold border-r border-tangram-neutral-dark-border last:border-r-0">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="p-3 border-t border-tangram-neutral-dark-border/60 border-r last:border-r-0 text-slate-300">
                    {children}
                  </td>
                ),
                hr: () => <hr className="my-8 border-tangram-neutral-dark-border" />,
              }}
            >
              {activeArticle.content}
            </ReactMarkdown>
          </article>

          {/* Navegação de Artigo Anterior e Próximo */}
          <div className="mt-12 pt-6 border-t border-tangram-neutral-dark-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevArticle ? (
              <button
                onClick={() => handleSelectArticle(prevArticle.slug)}
                className="p-4 rounded-xl border border-tangram-neutral-dark-border hover:border-tangram-primary/50 bg-tangram-neutral-dark-card hover:bg-tangram-neutral-dark-subtle transition-all text-left flex flex-col justify-between"
              >
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Artigo Anterior
                </span>
                <span className="text-sm font-bold text-white mt-1">{prevArticle.title}</span>
              </button>
            ) : (
              <div />
            )}

            {nextArticle && (
              <button
                onClick={() => handleSelectArticle(nextArticle.slug)}
                className="p-4 rounded-xl border border-tangram-neutral-dark-border hover:border-tangram-primary/50 bg-tangram-neutral-dark-card hover:bg-tangram-neutral-dark-subtle transition-all text-right flex flex-col justify-between sm:items-end"
              >
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 justify-end">
                  Próximo Artigo <ArrowRight className="w-3 h-3" />
                </span>
                <span className="text-sm font-bold text-white mt-1">{nextArticle.title}</span>
              </button>
            )}
          </div>
        </main>

        {/* Sumário "Nesta página" à Direita (Desktop) */}
        {tocItems.length > 0 && (
          <aside className="hidden xl:block w-56 sticky top-20 flex-shrink-0 text-xs">
            <div className="font-bold uppercase tracking-wider text-[11px] text-slate-400 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-tangram-primary" />
              Nesta página
            </div>

            <nav className="space-y-1.5 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              {tocItems.map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.id}`}
                  className={`block transition-colors leading-snug ${
                    item.level === 3 ? "pl-3 text-slate-400 hover:text-white" : "text-slate-300 hover:text-tangram-primary font-medium"
                  }`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>
    </div>
  );
}
