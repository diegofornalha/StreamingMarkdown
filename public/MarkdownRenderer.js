"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownRenderer = void 0;
class MarkdownRenderer {
    constructor(containerId) {
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }
        this.container = element;
        this.container.classList.add('notion-content');
    }
    render(markdown) {
        marked.setOptions({
            highlight: function (code, lang) {
                return code;
            }
        });
        const html = marked.parse(markdown);
        this.container.innerHTML = html;
        this.applyStyles();
    }
    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notion-content {
                font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif;
                line-height: 1.5;
                color: rgb(55, 53, 47);
                width: 100%;
                max-width: 900px;
                margin: 0 auto;
                padding: 0 96px;
            }

            .notion-content > *:first-child {
                margin-top: 2em;
            }

            .notion-content h1 {
                font-weight: 700;
                font-size: 2.5em;
                margin: 1em 0 4px;
                padding: 3px 2px;
            }

            .notion-content h2 {
                font-weight: 600;
                font-size: 1.875em;
                margin: 1.4em 0 4px;
                padding: 3px 2px;
            }

            .notion-content h3 {
                font-weight: 600;
                font-size: 1.5em;
                margin: 1em 0 4px;
                padding: 3px 2px;
            }

            .notion-content p {
                margin: 2px 0;
                padding: 3px 2px;
                min-height: 1.5em;
            }

            .notion-content p:first-of-type {
                font-style: italic;
                color: rgba(55, 53, 47, 0.65);
            }

            .notion-content pre {
                background: rgb(247, 246, 243);
                border-radius: 4px;
                padding: 16px;
                margin: 4px 0;
                overflow: auto;
            }

            .notion-content code {
                font-family: SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace;
                line-height: normal;
                background: rgba(135, 131, 120, 0.15);
                color: #EB5757;
                border-radius: 3px;
                font-size: 85%;
                padding: 0.2em 0.4em;
            }

            .notion-content pre code {
                background: transparent;
                padding: 0;
                color: inherit;
                font-size: 14px;
                display: block;
            }

            .notion-content ul,
            .notion-content ol {
                margin: 2px 0;
                padding-left: 24px;
            }

            .notion-content li {
                padding: 3px 2px;
                min-height: 1.5em;
            }

            .notion-content blockquote {
                margin: 4px 0;
                padding-left: 14px;
                border-left: 3px solid rgba(55, 53, 47, 0.16);
                color: rgba(55, 53, 47, 0.65);
            }

            .notion-content a {
                color: rgb(35, 131, 226);
                text-decoration: none;
                border-bottom: 0.05em solid rgba(35, 131, 226, 0.4);
            }

            .notion-content a:hover {
                border-bottom: 0.05em solid rgb(35, 131, 226);
            }

            .notion-content strong {
                font-weight: 600;
            }

            .notion-content hr {
                margin: 6px 0;
                border: none;
                border-top: 1px solid rgba(55, 53, 47, 0.16);
            }
        `;
        document.head.appendChild(style);
    }
}
exports.MarkdownRenderer = MarkdownRenderer;
