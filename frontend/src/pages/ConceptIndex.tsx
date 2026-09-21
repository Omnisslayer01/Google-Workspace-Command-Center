import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layout, Monitor, Coffee, Check, Sparkles, FolderKanban } from 'lucide-react';

export const ConceptIndex: React.FC = () => {
  const concepts = [
    {
      id: 'concept-1',
      path: '/concept-1',
      title: 'Concept 1 — Editorial / Swiss',
      tagline: 'High typographic authority, asymmetric composition, and technical precision.',
      vibe: 'International Typographic Style (Swiss)',
      features: [
        'Large editorial headline: "Your entire workspace. One command center."',
        'Asymmetrical column layout with generous whitespace.',
        'High-contrast black & white palette with restrained Google service accents.',
        'Precision architectural schematic previewing the invoice workflow pipeline.',
        'Zero typical SaaS card grids or floating gradients.',
      ],
      palette: ['#0A0A0A', '#FFFFFF', '#71717A', '#ea4335', '#1a73e8', '#0f9d58'],
      badge: 'Editorial & Monograph',
      icon: <Layout className="w-5 h-5 text-zinc-900" />,
    },
    {
      id: 'concept-2',
      path: '/concept-2',
      title: 'Concept 2 — Product / Visual',
      tagline: 'Direct software canvas focus with interactive workflow simulation.',
      vibe: 'Modern Engineering Workbench (Linear / Apple)',
      features: [
        'Interactive Workbench with live "Simulate Invoice Pipeline" runner.',
        'Minimal surrounding copy letting the product UI lead the narrative.',
        'Crisp browser canvas frame showing active triggers, nodes, and audit scopes.',
        'Multi-tab inspector toggle (Canvas Flow, Execution Log, Security Audit).',
        'Direct tactile feel with authentic Google Workspace service colors.',
      ],
      palette: ['#FFFFFF', '#F4F4F5', '#2563EB', '#10B981', '#F59E0B'],
      badge: 'Interactive & Tactile',
      icon: <Monitor className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 'concept-3',
      path: '/concept-3',
      title: 'Concept 3 — Warm / Human',
      tagline: 'Calm, human-centered editorial design countering multi-tab digital fatigue.',
      vibe: 'Warm Monograph (Kinfolk / Stripe Press)',
      features: [
        'Warm parchment background (#FAF7F2) and espresso ink typography.',
        'Newsreader serif headlines paired with serene architectural plates.',
        'Thoughtful narrative: "Work that flows quietly. Without the constant tab-switching."',
        'Story-driven cross-service execution explaining the invoice journey calmly.',
        'Zero aggressive marketing jargon; authentic human-scale productivity.',
      ],
      palette: ['#FAF7F2', '#F5EFE6', '#1C1917', '#78716C', '#C25E34'],
      badge: 'Warm & Contemplative',
      icon: <Coffee className="w-5 h-5 text-[#C25E34]" />,
    },
    {
      id: 'concept-4',
      path: '/concept-4',
      title: 'Concept 4 — Colorful / Modern',
      tagline: 'Sophisticated multi-color gradients, deep navy text, and modern energy.',
      vibe: 'Vibrant & Sophisticated (Google / Modern SaaS)',
      features: [
        'Multi-color ambient gradients (light cyan → lavender → soft pink/peach).',
        'Deep navy/slate-950 typography (#0F172A) for strong contrast and legibility.',
        'Vibrant gradient CTA buttons with soft ambient elevation.',
        'Interactive pipeline test runner with real-time JSON payload inspector.',
        'Harmonious Google service accents with clean, non-overloaded spacing.',
      ],
      palette: ['#F0F9FF', '#F5F3FF', '#FDF2F8', '#2563EB', '#7C3AED', '#0F172A'],
      badge: 'Colorful & Modern',
      icon: <Sparkles className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'concept-5',
      path: '/concept-5',
      title: 'Concept 5 — Workspace Inspired',
      tagline: 'Clean, predominantly white, functional Google Workspace extension aesthetic.',
      vibe: 'Google Productivity Ecosystem (Gmail / Drive / Calendar / Sheets)',
      features: [
        '80–90% pure white & very light gray background for a breathable, focused feel.',
        'Google Blue (#1A73E8) as the primary interaction and CTA color.',
        'Functional service colors: Red (Gmail), Blue (Calendar), Green (Drive/Sheets).',
        'Minimal decoration, zero colorful background gradients, clean productivity cards.',
        'Restrained corner radii, functional timeline markers, and native API styling.',
      ],
      palette: ['#FFFFFF', '#F8F9FA', '#1A73E8', '#EA4335', '#0F9D58', '#202124'],
      badge: 'Workspace & Minimal',
      icon: <FolderKanban className="w-5 h-5 text-[#1a73e8]" />,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white py-12 px-6 sm:px-8 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header Banner */}
        <header className="bg-white border border-zinc-300 rounded-xl p-8 sm:p-10 shadow-sm mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                <span className="bg-[#ea4335] rounded-xs"></span>
                <span className="bg-[#1a73e8] rounded-xs"></span>
                <span className="bg-[#0f9d58] rounded-xs"></span>
                <span className="bg-[#f9ab00] rounded-xs"></span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-950">
                Google Workspace Command Center (GWCC)
              </h1>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-md border border-zinc-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>FS3 Frontend Concept Suite • v1.0</span>
            </div>
          </div>

          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 mb-4">
              Three Human-Crafted Landing Page Concepts
            </h2>
            <p className="text-zinc-600 text-base leading-relaxed mb-6">
              To avoid generic AI-generated SaaS clichés (purple gradients, glowing borders, floating blobs, fake stats), we developed three distinct design directions for the GWCC team to evaluate. Each concept is fully implemented, responsive, and ready for exploration.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-zinc-600">
              <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 p-2 rounded">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero AI Gradients</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 p-2 rounded">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Glassmorphism</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 p-2 rounded">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Realistic GWCC Flows</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 p-2 rounded">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Backend Isolated</span>
              </div>
            </div>
          </div>
        </header>

        {/* The Five Concept Cards */}
        <section aria-label="Concept selection" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-16">
          {concepts.map((concept) => (
            <div
              key={concept.id}
              className="bg-white border border-zinc-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-zinc-100 rounded-lg border border-zinc-200">
                    {concept.icon}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                    {concept.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-950 mb-1 leading-snug">{concept.title}</h3>
                <span className="text-xs font-medium text-blue-700 block mb-2">{concept.vibe}</span>
                <p className="text-xs text-zinc-600 leading-relaxed mb-4">{concept.tagline}</p>

                {/* Color swatch preview */}
                <div className="mb-4">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1.5">Color Tokens</span>
                  <div className="flex items-center gap-1.5">
                    {concept.palette.map((color, cIdx) => (
                      <span
                        key={cIdx}
                        className="w-3.5 h-3.5 rounded-full border border-zinc-300 shadow-2xs"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Feature highlights */}
                <div className="border-t border-zinc-100 pt-3">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-2">Key Highlights</span>
                  <ul className="space-y-1 text-xs text-zinc-700">
                    {concept.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1">
                        <span className="text-zinc-400 font-mono text-[10px] mt-0.5 shrink-0">0{fIdx + 1}.</span>
                        <span className="leading-snug text-[11px]">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 border-t border-zinc-200">
                <Link
                  to={concept.path}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Launch {concept.title.split('—')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* Side-by-Side Comparison Matrix */}
        <section className="bg-white border border-zinc-300 rounded-xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-zinc-950 mb-2">Design Matrix & Comparison</h3>
          <p className="text-xs text-zinc-600 mb-6">
            Review how each concept addresses the product requirements, typography, and aesthetic direction.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 font-mono uppercase tracking-wider">
                  <th className="py-3 px-2.5">Design Dimension</th>
                  <th className="py-3 px-2.5">Concept 1: Swiss</th>
                  <th className="py-3 px-2.5">Concept 2: Visual</th>
                  <th className="py-3 px-2.5">Concept 3: Warm</th>
                  <th className="py-3 px-2.5 text-indigo-700">Concept 4: Colorful</th>
                  <th className="py-3 px-2.5 text-[#1a73e8] font-bold">Concept 5: Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-700">
                <tr>
                  <td className="py-3.5 px-2.5 font-semibold text-zinc-900">Dominant Visual Element</td>
                  <td className="py-3.5 px-2.5">Typographic Scale & Architectural Schematic</td>
                  <td className="py-3.5 px-2.5">Interactive Workbench & Workflow Simulator</td>
                  <td className="py-3.5 px-2.5">Warm Editorial Plate & Narrative Journey</td>
                  <td className="py-3.5 px-2.5 text-indigo-900">Multi-Color Gradients & Real-time Flow Inspector</td>
                  <td className="py-3.5 px-2.5 text-blue-900 font-medium">Predominantly White Canvas & Functional Service Nodes</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-2.5 font-semibold text-zinc-900">Background Tone</td>
                  <td className="py-3.5 px-2.5 font-mono">Pure White (#FFFFFF) & Pure Black</td>
                  <td className="py-3.5 px-2.5 font-mono">Cool Studio Zinc (#F9FAFB)</td>
                  <td className="py-3.5 px-2.5 font-mono">Warm Linen/Parchment (#FAF7F2)</td>
                  <td className="py-3.5 px-2.5 font-mono text-indigo-800">Cyan, Lavender, Pink & Peach Blends</td>
                  <td className="py-3.5 px-2.5 font-mono text-blue-900 font-medium">Pure White (#FFFFFF) & Light Gray (#F8F9FA)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-2.5 font-semibold text-zinc-900">Typography Mood</td>
                  <td className="py-3.5 px-2.5">High-impact Grotesque with Monospace metadata</td>
                  <td className="py-3.5 px-2.5">Clean UI Sans with status badges</td>
                  <td className="py-3.5 px-2.5">Newsreader Serif paired with Warm Sans</td>
                  <td className="py-3.5 px-2.5 text-indigo-900">Deep Navy (#0F172A) & Gradient Headings</td>
                  <td className="py-3.5 px-2.5 text-blue-900 font-medium">Clean Productivity Sans with Google Blue (#1A73E8)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-2.5 font-semibold text-zinc-900">Target Impression</td>
                  <td className="py-3.5 px-2.5">Authoritative, modern, engineering-grade</td>
                  <td className="py-3.5 px-2.5">Tangible, immediate utility, high-converting</td>
                  <td className="py-3.5 px-2.5">Calm, prestigious, human-focused</td>
                  <td className="py-3.5 px-2.5 text-indigo-900">Energetic, attractive, modern productivity</td>
                  <td className="py-3.5 px-2.5 text-blue-900 font-medium">Familiar, lightweight extension of Google Workspace</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
