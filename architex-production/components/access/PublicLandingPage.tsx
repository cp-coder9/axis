'use client';

import { FormEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { installLandingRuntime } from './landing-runtime';

type PublicLandingPageProps = { onSignIn: () => void; onSignUp: () => void };
type LoadedPage = { markup: string; styles: string; runtime: string };

const wingmanReply = (question: string) => {
  const value = question.toLowerCase();
  if (value.includes('cost')) return 'Project cost depends on scope, location, quality and professional inputs. Start with a structured brief so Architex can identify the right cost pathway.';
  if (value.includes('carport') || value.includes('plan')) return 'Building-plan requirements depend on the municipality, zoning controls and the proposed work. Architex can route the question to the correct approval and professional pathway.';
  if (value.includes('dwelling')) return 'A second dwelling usually depends on zoning rights, coverage, services and municipal approval. Start with a property and project brief to identify the exact checks.';
  return 'Architex can turn that question into a structured brief and connect it to the relevant guidance, professional or approval route.';
};

export function PublicLandingPage({ onSignIn, onSignUp }: PublicLandingPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState<LoadedPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/preview3.html')
      .then((response) => {
        if (!response.ok) throw new Error(`Homepage asset returned ${response.status}`);
        return response.text();
      })
      .then((html) => {
        const document = new DOMParser().parseFromString(html, 'text/html');
        const runtime = Array.from(document.querySelectorAll('script')).map((script) => script.textContent ?? '').join('\n')
          .replaceAll('requestAnimationFrame(draw);', 'if (document.body.contains(canvas)) requestAnimationFrame(draw);');
        document.querySelectorAll('script').forEach((script) => script.remove());
        const styles = Array.from(document.head.querySelectorAll('style')).map((style) => style.textContent ?? '').join('\n');
        if (active) setPage({ markup: document.body.innerHTML, styles, runtime });
      })
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : 'Homepage asset could not be loaded'));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!page || !rootRef.current) return;
    const host = rootRef.current;
    const landingRoot = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    const isolatedStyles = page.styles
      .replace(/(^|\n)\s*:root\s*\{/g, '$1:host {')
      .replace(/(^|\n)\s*body\s*\{/g, '$1:host {')
      .replace(/(^|\n)\s*html\s*\{/g, '$1:host {');
    landingRoot.innerHTML = `<style>:host{display:block;min-height:100vh;line-height:normal;letter-spacing:normal;font-style:normal;font-weight:400;text-align:start}${isolatedStyles}</style>${page.markup}`;
    const authCapture = (event: Event) => {
      const target = (event.composedPath()[0] as HTMLElement | undefined)?.closest?.('button, a') as HTMLElement | null;
      if (!target) return;
      const label = target.textContent?.trim().toLowerCase() ?? '';
      const modalTitle = target.dataset.modalTitle?.toLowerCase();
      if (modalTitle === 'sign in' || label === 'sign in') {
        event.preventDefault(); event.stopImmediatePropagation(); onSignIn();
      } else if (label === 'sign up' || label === 'create account') {
        event.preventDefault(); event.stopImmediatePropagation(); onSignUp();
      }
    };
    landingRoot.addEventListener('click', authCapture, { capture: true });
    const removeRuntime = installLandingRuntime(landingRoot, page.runtime);
    return () => {
      landingRoot.removeEventListener('click', authCapture, { capture: true });
      removeRuntime();
      landingRoot.innerHTML = '';
    };
  }, [onSignIn, onSignUp, page]);

  useEffect(() => {
    if (!page || !rootRef.current) return;
    if (page.runtime) return;
    const root = rootRef.current;
    const canvas = root.querySelector<HTMLCanvasElement>('#datumCanvas');
    const stage = root.querySelector<HTMLElement>('#datumStage');
    if (!canvas || !stage) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frame = 0;
    let pointer = { x: 0, y: 0, active: false };
    const nodes = ['Start a Project', 'Find a Professional', 'Explore Knowledge', 'About Architex', 'Sign Up', 'Sign In'];
    const cta = root.querySelector<HTMLButtonElement>('#datumPointerCta');
    const label = root.querySelector<HTMLElement>('#datumPointerLabel');
    const draw = () => {
      const rect = stage.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(rect.width * ratio);
      const height = Math.round(rect.height * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width; canvas.height = height;
        canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);
      const y = rect.height * 0.52;
      const gradient = context.createLinearGradient(0, 0, rect.width, 0);
      gradient.addColorStop(0, 'rgba(22,126,121,0)');
      gradient.addColorStop(0.18, 'rgba(22,126,121,.62)');
      gradient.addColorStop(0.82, 'rgba(22,126,121,.62)');
      gradient.addColorStop(1, 'rgba(22,126,121,0)');
      context.strokeStyle = gradient; context.lineWidth = 1.3;
      context.beginPath(); context.moveTo(0, y); context.lineTo(rect.width, y); context.stroke();
      let hasHover = false;
      nodes.forEach((node, index) => {
        const x = rect.width * (0.08 + index * 0.168);
        const hovered = pointer.active && Math.hypot(pointer.x - x, pointer.y - y) < 90;
        context.beginPath(); context.fillStyle = hovered ? '#102033' : '#167e79';
        context.arc(x, y, hovered ? 6 : 4, 0, Math.PI * 2); context.fill();
        if (hovered && cta && label) {
          hasHover = true; label.textContent = node;
          cta.style.left = `${Math.max(90, Math.min(rect.width - 90, pointer.x))}px`;
          cta.style.top = `${Math.max(8, Math.min(rect.height - 54, pointer.y))}px`;
          cta.classList.add('visible');
        }
      });
      if (!hasHover) cta?.classList.remove('visible');
      frame = window.requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
    };
    const leave = () => { pointer.active = false; cta?.classList.remove('visible'); };
    stage.addEventListener('pointermove', move); stage.addEventListener('pointerleave', leave);
    frame = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frame);
      stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', leave);
    };
  }, [page]);

  const openInfo = (title: string, copy: string) => {
    const root = rootRef.current;
    const dialog = root?.querySelector<HTMLDialogElement>('#infoDialog');
    const titleNode = root?.querySelector<HTMLElement>('#modalTitle');
    const content = root?.querySelector<HTMLElement>('#modalContent');
    if (titleNode) titleNode.textContent = title;
    if (content) content.textContent = copy;
    dialog?.showModal();
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('button, a');
    if (!target) return;
    const label = target.textContent?.trim().toLowerCase() ?? '';
    const modalTitle = target.dataset.modalTitle?.toLowerCase();
    if (modalTitle === 'sign in' || label === 'sign in') { event.preventDefault(); event.stopPropagation(); onSignIn(); return; }
    if (label === 'sign up' || label === 'create account') { event.preventDefault(); event.stopPropagation(); onSignUp(); return; }
    if (page?.runtime) return;
    if (target.matches('[data-close-dialog]')) { rootRef.current?.querySelector<HTMLDialogElement>('#infoDialog')?.close(); return; }
    if (target.matches('[data-close-project]')) { rootRef.current?.querySelector<HTMLDialogElement>('#projectDialog')?.close(); return; }
    if (target.matches('[data-start-project]')) { rootRef.current?.querySelector<HTMLDialogElement>('#projectDialog')?.showModal(); return; }
    if (target.dataset.target) { rootRef.current?.querySelector(`#${target.dataset.target}`)?.scrollIntoView({ behavior: 'smooth' }); return; }
    if (target.dataset.focusWingman !== undefined) { rootRef.current?.querySelector<HTMLInputElement>('#wingmanInput')?.focus(); return; }
    if (target.dataset.prompt) {
      const input = rootRef.current?.querySelector<HTMLInputElement>('#wingmanInput');
      if (input) { input.value = target.dataset.prompt; input.focus(); }
      return;
    }
    if (target.dataset.modalTitle) openInfo(target.dataset.modalTitle, target.dataset.modalCopy ?? 'Continue into the relevant Architex public workflow.');
    if (target.dataset.service) openInfo(target.querySelector('h3, strong')?.textContent ?? 'Architex Marketplace', 'Browse the relevant public marketplace route and continue into a structured project when ready.');
  };

  const handleSubmit = (event: FormEvent<HTMLDivElement>) => {
    const form = event.target as HTMLFormElement;
    if (form.id === 'wingmanForm') {
      event.preventDefault();
      const input = form.querySelector<HTMLInputElement>('#wingmanInput');
      const log = rootRef.current?.querySelector<HTMLElement>('#chatLog');
      const question = input?.value.trim() ?? '';
      if (!question || !log) return;
      const user = document.createElement('div'); user.className = 'chat-bubble user'; user.textContent = question;
      const answer = document.createElement('div'); answer.className = 'chat-bubble bot'; answer.textContent = wingmanReply(question);
      log.append(user, answer); if (input) input.value = ''; log.scrollTop = log.scrollHeight;
    }
    if (form.id === 'knowledgeSearch') {
      event.preventDefault();
      const query = form.querySelector<HTMLInputElement>('#knowledgeQuery')?.value.trim().toLowerCase() ?? '';
      rootRef.current?.querySelectorAll<HTMLElement>('.knowledge-card').forEach((card) => {
        card.hidden = Boolean(query) && !`${card.textContent} ${card.dataset.keywords}`.toLowerCase().includes(query);
      });
    }
  };

  if (error) return <main className="public-landing-load-error" role="alert">The Architex homepage could not load. {error}</main>;
  if (!page) return <main className="public-landing-loading" role="status">Loading Architex…</main>;
  return (
    <div ref={rootRef} className="public-landing-host">
      <button type="button" hidden onClick={onSignIn}>Sign in</button>
      <button type="button" hidden onClick={onSignUp}>Sign up</button>
    </div>
  );
}
