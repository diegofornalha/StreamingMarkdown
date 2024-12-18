'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { StreamingMarkdownRenderer } from '../StreamingMarkdownRenderer';

const markdownContent = `# control

*humans should focus on bigger problems*

## Setup

\`\`\`bash
git clone git@github.com:anysphere/control
\`\`\`

\`\`\`bash
./init.sh
\`\`\`

## Folder structure

**The most important folders are:**

1. \`vscode\`: this is our fork of vscode, as a submodule.
2. \`milvus\`: this is where our Rust server code lives.
3. \`schema\`: this is our Protobuf definitions for communication between the client and the server.

Each of the above folders should contain fairly comprehensive README files; please read them. If something is missing, or not working, please add it to the README!

**Some less important folders:**

1. \`release\`: this is a collection of scripts and guides for releasing various things.
2. \`infra\`: infrastructure definitions for the on-prem deployment.
3. \`third_party\`: where we keep our vendored third party dependencies.

## Rust Proto Definitions

They are in a file called \`aiserver.v1.rs\`. It might not be clear where that file is. Run \`rg --files --no-ignore bazel-out | rg aiserver.v1.rs\` to find the file.

## Releasing

Within \`vscode/\`:

- Bump the version
- Then:

\`\`\`bash
git checkout build-todesktop
git merge main
git push origin build-todesktop
\`\`\`

- Wait for 14 minutes for gulp and ~30 minutes for todesktop
- Go to todesktop.com ([https://todesktop.com](https://todesktop.com)), test the build locally and hit release
`;

export default function Home(): JSX.Element {
    const [isStreaming, setIsStreaming] = useState<boolean>(false);

    const renderMarkdown = useCallback((): void => {
        const renderer = new MarkdownRenderer('markdownContainer');
        renderer.render(markdownContent);
    }, []);

    const startStreaming = useCallback(async (): Promise<void> => {
        if (isStreaming) return;
        
        setIsStreaming(true);
        const streamingRenderer = new StreamingMarkdownRenderer('markdownContainer');
        await streamingRenderer.streamMarkdown(markdownContent, 30);
        setIsStreaming(false);
    }, [isStreaming]);

    useEffect(() => {
        renderMarkdown();
    }, [renderMarkdown]);

    return (
        <main className="flex min-h-screen flex-col items-center p-24">
            <div className="layout-content">
                <div className="notion-page-content">
                    <button
                        onClick={startStreaming}
                        disabled={isStreaming}
                        className="stream-button bg-notion-link hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isStreaming ? 'Streaming...' : 'STREAM'}
                    </button>
                    <div id="markdownContainer" className="notion-content" />
                </div>
            </div>
        </main>
    );
} 