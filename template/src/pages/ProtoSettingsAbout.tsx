import { useState } from 'react';
import { Info, Settings, History, Navigation, Terminal, ExternalLink, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AppShell, type NavSection } from '@/components/layout';

const navSections: NavSection[] = [
  {
    items: [
      { icon: Info, label: 'About', route: '/proto-settings/about' },
      { icon: Settings, label: 'Settings', route: '/proto-settings/settings' },
      { icon: Navigation, label: 'Navigation', route: '/proto-settings/navigation' },
      { icon: History, label: 'Versions', route: '/proto-settings/versions' },
    ],
  },
];

const PROJECT_DIR = '__PROJECT_DIR__';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-auto shrink-0 rounded p-1 text-grey-400 hover:bg-grey-200 hover:text-grey-600"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export default function ProtoSettingsAbout() {
  return (
    <AppShell
      title="Prototype Settings"
      secondaryNav={navSections}
      ribbonActiveIndex={-1}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-6 p-6">
          {/* Welcome */}
          <section>
            <h1 className="text-lg font-bold text-grey-800">
              Welcome to your prototype
            </h1>
            <p className="mt-1 max-w-[560px] text-2xs text-grey-500">
              This is a ready-to-go starter built on the Zluri design system. It
              gives you the app shell, components, and tokens so you can jump
              straight into building without setting anything up.
            </p>
          </section>

          {/* Get started */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-grey-800">
              Get started
            </h2>

            {/* Step 1 */}
            <Card>
              <CardContent className="flex gap-4 p-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-3xs font-semibold text-blue-600">
                  1
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-2xs font-semibold text-grey-800">
                    Open your project
                  </p>
                  <p className="text-3xs text-grey-500">
                    Navigate to the project folder in your terminal.
                  </p>
                  <div className="flex items-center gap-2 rounded-md bg-grey-100 px-3 py-2">
                    <Terminal className="h-3.5 w-3.5 shrink-0 text-grey-400" />
                    <code className="font-mono text-3xs text-grey-700">
                      cd {PROJECT_DIR}
                    </code>
                    <CopyButton text={`cd ${PROJECT_DIR}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardContent className="flex gap-4 p-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-3xs font-semibold text-blue-600">
                  2
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-2xs font-semibold text-grey-800">
                    Start the dev server
                  </p>
                  <p className="text-3xs text-grey-500">
                    Run this command to start your prototype locally. It will open
                    automatically at{' '}
                    <code className="rounded bg-grey-100 px-1 py-0.5 font-mono">localhost:5173</code>.
                    Run this again any time you want to come back to your prototype.
                  </p>
                  <div className="flex items-center gap-2 rounded-md bg-grey-100 px-3 py-2">
                    <Terminal className="h-3.5 w-3.5 shrink-0 text-grey-400" />
                    <code className="font-mono text-3xs text-grey-700">
                      npm run dev
                    </code>
                    <CopyButton text="npm run dev" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardContent className="flex gap-4 p-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-3xs font-semibold text-blue-600">
                  3
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-2xs font-semibold text-grey-800">
                    Start building with AI
                  </p>
                  <p className="text-3xs text-grey-500">
                    Run one of these commands in your terminal to start
                    prototyping.
                  </p>
                  <div className="overflow-hidden rounded-md border border-grey-200">
                    <table className="w-full text-left text-3xs">
                      <thead>
                        <tr className="border-b border-grey-200 bg-grey-100">
                          <th className="px-3 py-1.5 font-medium text-grey-500">
                            Tool
                          </th>
                          <th className="px-3 py-1.5 font-medium text-grey-500">
                            Command
                          </th>
                          <th className="px-3 py-1.5 font-medium text-grey-500">
                            Docs
                          </th>
                          <th className="w-8 px-1 py-1.5" />
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-grey-200">
                          <td className="px-3 py-2 text-grey-800">
                            Claude Code
                          </td>
                          <td className="px-3 py-2">
                            <code className="rounded bg-grey-100 px-1.5 py-0.5 font-mono text-grey-700">
                              claude
                            </code>
                          </td>
                          <td className="px-3 py-2">
                            <a
                              href="https://docs.anthropic.com/en/docs/claude-code/overview"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              Install
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                          <td className="px-1 py-2">
                            <CopyButton text="claude" />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-grey-800">Codex</td>
                          <td className="px-3 py-2">
                            <code className="rounded bg-grey-100 px-1.5 py-0.5 font-mono text-grey-700">
                              codex
                            </code>
                          </td>
                          <td className="px-3 py-2">
                            <a
                              href="https://github.com/openai/codex"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              Install
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                          <td className="px-1 py-2">
                            <CopyButton text="codex" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 pb-4 pt-2 text-center text-4xs text-grey-400">
          Built by{' '}
          <a
            href="https://mthnmhn.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-grey-500 hover:text-grey-700 hover:underline"
          >
            Mithun Mohan
          </a>
        </div>
      </div>
    </AppShell>
  );
}
