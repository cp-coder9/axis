'use client';
import { createContext, useContext, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
type TabsContextValue = { value: string; onValueChange(value: string): void };
const TabsContext = createContext<TabsContextValue | null>(null);
const useTabs = () => { const context = useContext(TabsContext); if (!context) throw new Error('Tabs primitives must be rendered inside Tabs.'); return context; };
export type TabsProps = { value: string; onValueChange(value: string): void; children: ReactNode };
export type TabListProps = HTMLAttributes<HTMLDivElement> & { label: string };
export type TabProps = ButtonHTMLAttributes<HTMLButtonElement> & { value: string };
export type TabPanelProps = HTMLAttributes<HTMLDivElement> & { value: string };
export function Tabs({ value, onValueChange, children }: TabsProps) { return <TabsContext.Provider value={{ value, onValueChange }}>{children}</TabsContext.Provider>; }
export function TabList({ label, ...props }: TabListProps) { return <div {...props} className={`ax-tabs ${props.className ?? ''}`.trim()} role="tablist" aria-label={label} />; }
export function Tab({ value, onKeyDown, ...props }: TabProps) { const tabs = useTabs(); const selected = tabs.value === value; return <button {...props} id={`tab-${value}`} role="tab" aria-selected={selected} aria-controls={`panel-${value}`} tabIndex={selected ? 0 : -1} onClick={(event) => { props.onClick?.(event); if (!event.defaultPrevented) tabs.onValueChange(value); }} onKeyDown={(event) => { onKeyDown?.(event); if (event.defaultPrevented) return; const items = [...event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>('[role="tab"]')]; const index = items.indexOf(event.currentTarget); const destination = event.key === 'ArrowRight' ? items[(index + 1) % items.length] : event.key === 'ArrowLeft' ? items[(index - 1 + items.length) % items.length] : event.key === 'Home' ? items[0] : event.key === 'End' ? items.at(-1) : null; if (destination) { event.preventDefault(); destination.focus(); } }} />; }
export function TabPanel({ value, ...props }: TabPanelProps) { const tabs = useTabs(); return <div {...props} id={`panel-${value}`} role="tabpanel" aria-labelledby={`tab-${value}`} hidden={tabs.value !== value} />; }
