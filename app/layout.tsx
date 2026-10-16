import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'FLOW — Automação com intenção · ASCEN', description: 'Crie, explore e simule workflows. Uma demonstração interativa desenvolvida pela ASCEN.' };
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-PT"><body>{children}</body></html>}
