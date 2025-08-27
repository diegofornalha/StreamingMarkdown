import React, { useState, useEffect, useRef } from 'react';
import { MessageInput } from './MessageInput';
import { StreamingMessage } from './StreamingMessage';
import ChatAPI, { ChatMessage, StreamResponse } from '../lib/api';

export const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentStreamContent, setCurrentStreamContent] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [tokenInfo, setTokenInfo] = useState<{ input?: number; output?: number } | null>(null);
    const [costInfo, setCostInfo] = useState<number | null>(null);
    
    const apiRef = useRef<ChatAPI | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamContentRef = useRef<string>('');
    const tokenInfoRef = useRef<{ input?: number; output?: number } | null>(null);
    const costInfoRef = useRef<number | null>(null);

    useEffect(() => {
        // Inicializa API
        apiRef.current = new ChatAPI();
        
        // Cria sessão inicial
        apiRef.current.createSession().then(id => {
            setSessionId(id);
        });

        return () => {
            // Cleanup
            if (apiRef.current) {
                apiRef.current.deleteSession().catch(console.error);
            }
        };
    }, []);

    useEffect(() => {
        // Auto-scroll para última mensagem
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentStreamContent]);

    const handleSendMessage = async (message: string) => {
        if (!apiRef.current || isStreaming) return;

        console.log('Sending message:', message);

        // Adiciona mensagem do usuário
        const userMessage: ChatMessage = {
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setIsStreaming(true);
        setCurrentStreamContent('');
        setTokenInfo(null);
        setCostInfo(null);

        // Reset refs
        streamContentRef.current = '';
        tokenInfoRef.current = null;
        costInfoRef.current = null;

        try {
            await apiRef.current.sendMessage(
                message,
                (data: StreamResponse) => {
                    console.log('Stream data:', data);
                    if (data.type === 'assistant_text') {
                        const newContent = data.content || '';
                        streamContentRef.current += newContent;
                        setCurrentStreamContent(streamContentRef.current);
                    } else if (data.type === 'tool_use') {
                        const toolMsg = `\n📦 Usando ferramenta: ${data.tool}\n`;
                        streamContentRef.current += toolMsg;
                        setCurrentStreamContent(streamContentRef.current);
                    } else if (data.type === 'tool_result') {
                        // Opcionalmente mostrar resultados de ferramentas
                    } else if (data.type === 'result') {
                        // Atualiza informações de tokens e custo
                        if (data.input_tokens !== undefined) {
                            tokenInfoRef.current = {
                                input: data.input_tokens,
                                output: data.output_tokens
                            };
                            setTokenInfo(tokenInfoRef.current);
                        }
                        if (data.cost_usd !== undefined) {
                            costInfoRef.current = data.cost_usd;
                            setCostInfo(data.cost_usd);
                        }
                    }
                },
                (error: string) => {
                    console.error('Stream error:', error);
                    const errorMsg = `\n❌ Erro: ${error}`;
                    streamContentRef.current += errorMsg;
                    setCurrentStreamContent(streamContentRef.current);
                },
                () => {
                    console.log('Stream complete, final content:', streamContentRef.current);
                    // Streaming completo - adiciona mensagem final
                    if (streamContentRef.current) {
                        // Limpa o conteúdo de streaming ANTES de adicionar à lista
                        const finalContent = streamContentRef.current;
                        const finalTokens = tokenInfoRef.current;
                        const finalCost = costInfoRef.current;
                        
                        // Limpa o estado de streaming primeiro
                        setCurrentStreamContent('');
                        setIsStreaming(false);
                        
                        // Depois adiciona a mensagem final
                        setTimeout(() => {
                            setMessages(prev => [...prev, {
                                role: 'assistant',
                                content: finalContent,
                                timestamp: new Date(),
                                tokens: finalTokens || undefined,
                                cost: finalCost || undefined
                            } as ChatMessage]);
                        }, 0);
                    } else {
                        setCurrentStreamContent('');
                        setIsStreaming(false);
                    }
                }
            );
        } catch (error) {
            console.error('Error sending message:', error);
            setIsStreaming(false);
            setCurrentStreamContent('');
        }
    };

    const handleClearSession = async () => {
        if (!apiRef.current || isStreaming) return;
        
        try {
            await apiRef.current.clearSession();
            setMessages([]);
            setCurrentStreamContent('');
            setTokenInfo(null);
            setCostInfo(null);
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    };

    const handleInterrupt = async () => {
        if (!apiRef.current || !isStreaming) return;
        
        try {
            await apiRef.current.interruptSession();
            setIsStreaming(false);
            
            // Salva conteúdo parcial como mensagem
            if (currentStreamContent) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: currentStreamContent + '\n\n[Interrompido]',
                    timestamp: new Date()
                } as ChatMessage]);
                setCurrentStreamContent('');
            }
        } catch (error) {
            console.error('Error interrupting session:', error);
        }
    };

    return (
        <div className="chat-interface">
            <div className="chat-header">
                <h1 className="chat-title">🤖 Claude Chat</h1>
                <div className="chat-controls">
                    {sessionId && (
                        <span className="session-info">Sessão: {sessionId.slice(0, 8)}</span>
                    )}
                    <button
                        onClick={handleClearSession}
                        disabled={isStreaming}
                        className="control-button"
                    >
                        🔄 Limpar
                    </button>
                    {isStreaming && (
                        <button
                            onClick={handleInterrupt}
                            className="control-button interrupt-button"
                        >
                            ⏸️ Interromper
                        </button>
                    )}
                </div>
            </div>

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={`msg-${index}`}>
                        <StreamingMessage
                            content={msg.content}
                            role={msg.role}
                            isStreaming={false}
                        />
                        {msg.tokens && (
                            <div className="token-info">
                                Tokens: {msg.tokens.input}↑ {msg.tokens.output}↓
                                {msg.cost && ` | Custo: $${msg.cost.toFixed(6)}`}
                            </div>
                        )}
                    </div>
                ))}
                
                {isStreaming && currentStreamContent && (
                    <div key="streaming-msg">
                        <StreamingMessage
                            content={currentStreamContent}
                            role="assistant"
                            isStreaming={true}
                        />
                        {tokenInfoRef.current && (
                            <div className="token-info streaming-info">
                                Tokens: {tokenInfoRef.current.input}↑ {tokenInfoRef.current.output}↓
                                {costInfoRef.current && ` | Custo: $${costInfoRef.current.toFixed(6)}`}
                            </div>
                        )}
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            <MessageInput
                onSendMessage={handleSendMessage}
                disabled={isStreaming}
                placeholder={isStreaming ? "Aguardando resposta..." : "Digite sua mensagem..."}
            />

            <style jsx>{`
                .chat-interface {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    max-height: 100vh;
                    background: var(--bg-primary, white);
                }

                .chat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    background: var(--bg-secondary, #fafafa);
                    border-bottom: 1px solid var(--border-color, #e5e5e5);
                }

                .chat-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--text-primary, #1a1a1a);
                    margin: 0;
                }

                .chat-controls {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .session-info {
                    font-size: 12px;
                    color: var(--text-secondary, #666);
                    padding: 4px 8px;
                    background: var(--bg-tertiary, #f0f0f0);
                    border-radius: 4px;
                }

                .control-button {
                    padding: 6px 12px;
                    border: 1px solid var(--border-color, #e5e5e5);
                    border-radius: 6px;
                    background: var(--bg-primary, white);
                    color: var(--text-primary, #1a1a1a);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .control-button:hover:not(:disabled) {
                    background: var(--bg-secondary, #fafafa);
                    border-color: var(--primary-color, #3b82f6);
                }

                .control-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .interrupt-button {
                    background: var(--error-bg, #fee);
                    color: var(--error-color, #c00);
                    border-color: var(--error-color, #c00);
                }

                .interrupt-button:hover {
                    background: var(--error-hover, #fcc);
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                }

                .token-info {
                    padding: 4px 56px;
                    font-size: 11px;
                    color: var(--text-secondary, #666);
                    background: var(--bg-tertiary, #f9f9f9);
                    animation: fadeIn 0.3s ease-in;
                }
                
                .streaming-info {
                    opacity: 0.7;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 640px) {
                    .chat-header {
                        padding: 12px;
                    }

                    .chat-title {
                        font-size: 18px;
                    }

                    .chat-messages {
                        padding: 12px;
                    }

                    .session-info {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};