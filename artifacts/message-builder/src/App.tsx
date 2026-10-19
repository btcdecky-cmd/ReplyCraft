import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGenerateMessageReply } from '@workspace/api-client-react';
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Clipboard,
  Feather,
  MessageCircle,
  RotateCcw,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const [conversation, setConversation] = useState('');
  const [tone, setTone] = useState('Warm & natural');
  const [draft, setDraft] = useState<{
    recipient: string | null;
    relationship: string | null;
    context: string;
    reply: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const generateReply = useGenerateMessageReply();
  const tones = ['Warm & natural', 'Direct & clear', 'Kind but firm', 'Light & playful'];
  const characterCount = conversation.length;
  const canGenerate = conversation.trim().length > 0 && !generateReply.isPending;

  const generate = () => {
    if (!canGenerate) return;
    setCopied(false);
    generateReply.mutate(
      { data: { conversation: conversation.trim(), tone } },
      { onSuccess: (reply) => setDraft(reply) },
    );
  };

  const copyReply = async () => {
    if (!draft?.reply) return;
    try {
      await navigator.clipboard.writeText(draft.reply);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setConversation('');
    setDraft(null);
    generateReply.reset();
    setCopied(false);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup" aria-label="Kindred message builder">
          <div className="brand-mark"><Feather size={19} strokeWidth={1.8} /></div>
          <span className="brand-name">kindred<span>.</span></span>
          <span className="brand-divider" />
          <span className="brand-product">message builder</span>
        </div>
        <div className="topbar-note"><span className="status-dot" /> A little help finding the words</div>
      </header>

      <section className="intro">
        <div className="eyebrow"><span className="eyebrow-line" /> YOUR WORDS, WITH A LITTLE HELP</div>
        <h1>Say it like <em>you</em> mean it.</h1>
        <p>Bring the conversation. We’ll help you find a reply that feels like yours.</p>
      </section>

      <section className="workspace" aria-label="Message builder">
        <div className="compose-column">
          <div className="section-kicker"><span className="step-number">01</span><span>THE CONVERSATION</span><span className="kicker-rule" /></div>
          <div className="conversation-card">
            <div className="card-heading">
              <div className="heading-icon"><MessageCircle size={17} /></div>
              <div>
                <h2>What are you replying to?</h2>
                <p>Paste a message or the whole conversation.</p>
              </div>
            </div>
            <label htmlFor="conversation" className="sr-only">Paste your conversation</label>
            <textarea
              id="conversation"
              data-testid="input-conversation"
              value={conversation}
              onChange={(event) => setConversation(event.target.value.slice(0, 12000))}
              placeholder={'Paste the message or conversation here…\n\nThe more context you share, the more naturally we can help.'}
              maxLength={12000}
            />
            <div className="textarea-footer">
              <span className="count-hint">A message or full conversation works</span>
              <span className="character-count">{characterCount.toLocaleString()} <span>/ 12,000</span></span>
            </div>
          </div>

          <div className="tone-section">
            <div className="tone-heading">
              <div className="section-kicker"><span className="step-number">02</span><span>THE FEELING</span></div>
              <span className="tone-aside">Choose a tone to start</span>
            </div>
            <div className="tone-list" role="group" aria-label="Preferred reply tone">
              {tones.map((option, index) => (
                <button
                  className={`tone-chip ${tone === option ? 'selected' : ''}`}
                  key={option}
                  onClick={() => setTone(option)}
                  type="button"
                  aria-pressed={tone === option}
                  data-testid={`button-tone-${index}`}
                >
                  {tone === option && <span className="tone-check"><Check size={12} /></span>}
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button
            className="generate-button"
            onClick={generate}
            disabled={!canGenerate}
            type="button"
            data-testid="button-generate"
          >
            {generateReply.isPending ? (
              <><span className="button-loader" /> Finding the right words…</>
            ) : (
              <><WandSparkles size={17} /> Help me write a reply <ArrowRight size={16} className="button-arrow" /></>
            )}
          </button>
          {generateReply.isError && (
            <div className="error-message" role="alert" data-testid="status-generation-error">
              <span>We couldn’t make a draft just now. Your conversation is still here.</span>
              <button type="button" onClick={generate} data-testid="button-retry">Try again <RotateCcw size={13} /></button>
            </div>
          )}
          <p className="privacy-note"><span className="privacy-mark">↳</span> Not saved here. Your message is sent to Groq to write a reply.</p>
        </div>

        <div className="result-column">
          <div className="section-kicker"><span className="step-number">03</span><span>YOUR REPLY</span><span className="kicker-rule" /></div>
          {generateReply.isPending ? (
            <div className="result-card loading-card" aria-live="polite" data-testid="status-generating">
              <div className="loading-top"><span className="skeleton-line short" /><span className="skeleton-line tiny" /></div>
              <span className="skeleton-line wide" /><span className="skeleton-line medium" /><span className="skeleton-line almost-wide" />
              <span className="skeleton-line short" />
              <div className="loading-caption"><Sparkles size={14} /> Listening for what matters…</div>
            </div>
          ) : draft ? (
            <div className="result-card drafted" data-testid="card-reply-result">
              <div className="draft-meta">
                <div className="draft-label"><span className="draft-indicator" /> A FIRST DRAFT</div>
                <button className="text-action" type="button" onClick={reset} data-testid="button-start-over">Start over <RotateCcw size={13} /></button>
              </div>
              <label htmlFor="reply-draft" className="sr-only">Edit your reply</label>
              <textarea
                id="reply-draft"
                className="reply-editor"
                value={draft.reply}
                onChange={(event) => setDraft({ ...draft, reply: event.target.value })}
                data-testid="input-reply-draft"
              />
              <div className="reply-footer">
                <span>Make it yours before you send.</span>
                <button className={`copy-button ${copied ? 'copied' : ''}`} type="button" onClick={copyReply} data-testid="button-copy-reply">
                  {copied ? <Check size={15} /> : <Clipboard size={15} />}
                  {copied ? 'Copied' : 'Copy reply'}
                </button>
              </div>
            </div>
          ) : (
            <div className="result-card empty-card" data-testid="empty-reply-state">
              <div className="empty-art" aria-hidden="true">
                <div className="art-orbit orbit-one" />
                <div className="art-orbit orbit-two" />
                <div className="art-note"><Feather size={24} strokeWidth={1.35} /></div>
                <span className="art-spark spark-a">+</span><span className="art-spark spark-b">·</span>
              </div>
              <div className="empty-copy">
                <span className="empty-overline">A good reply starts with listening</span>
                <h2>Your next words<br />are still yours.</h2>
                <p>Once you share the conversation, we’ll pick up on the context and give you a thoughtful place to start.</p>
              </div>
              <div className="empty-bottom"><span>NO PRESSURE TO SEND</span><ArrowDownRight size={16} /></div>
            </div>
          )}

          {draft && (
            <div className="insights" data-testid="panel-conversation-insights">
              <div className="insights-head"><div><span className="insights-overline">READING BETWEEN THE LINES</span><h3>A little context</h3></div><span className="insights-spark"><Sparkles size={15} /></span></div>
              <div className="insight-grid">
                <div className="insight-item">
                  <span className="insight-label">WHO</span>
                  <span className="insight-value" data-testid="text-recipient">{draft.recipient || 'Not identified'}</span>
                </div>
                <div className="insight-item">
                  <span className="insight-label">YOUR CONNECTION</span>
                  <span className="insight-value" data-testid="text-relationship">{draft.relationship || 'Not identified'}</span>
                </div>
              </div>
              <div className="context-note">
                <span className="context-mark">“</span>
                <p data-testid="text-context">{draft.context}</p>
              </div>
              <div className="insights-tail"><span>Use what fits. Leave what doesn’t.</span><span className="tail-dash" /></div>
            </div>
          )}

          {!draft && !generateReply.isPending && (
            <div className="right-footnote"><span className="footnote-number">01 — 03</span><span>Paste · Set the tone · Make it yours</span></div>
          )}
        </div>
      </section>
      <footer className="page-footer">
        <span>kindred <span className="footer-separator">/</span> a quieter kind of writing tool</span>
        <span>TAKE YOUR TIME. SAY IT YOUR WAY.</span>
      </footer>
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
