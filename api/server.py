"""Servidor FastAPI para integração com Claude Code SDK."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import asyncio
import json
import uuid

from claude_handler import ClaudeHandler

app = FastAPI(title="Claude Chat API")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3020", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Handler global
claude_handler = ClaudeHandler()

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class SessionAction(BaseModel):
    session_id: str

@app.get("/")
async def root():
    """Health check."""
    return {"status": "ok", "service": "Claude Chat API"}

@app.post("/api/chat")
async def send_message(chat_message: ChatMessage):
    """Envia mensagem e retorna stream de respostas."""
    
    # Gera session_id se não fornecido
    session_id = chat_message.session_id or str(uuid.uuid4())
    
    async def generate():
        """Gera stream SSE."""
        try:
            async for response in claude_handler.send_message(
                session_id, 
                chat_message.message
            ):
                # Formato SSE
                data = json.dumps(response)
                yield f"data: {data}\n\n"
                
        except Exception as e:
            error_data = json.dumps({
                "type": "error",
                "error": str(e),
                "session_id": session_id
            })
            yield f"data: {error_data}\n\n"
        finally:
            # Envia evento de fim
            yield f"data: {json.dumps({'type': 'done', 'session_id': session_id})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Session-ID": session_id
        }
    )

@app.post("/api/interrupt")
async def interrupt_session(action: SessionAction):
    """Interrompe a execução da sessão."""
    success = await claude_handler.interrupt_session(action.session_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return {"status": "interrupted", "session_id": action.session_id}

@app.post("/api/clear")
async def clear_session(action: SessionAction):
    """Limpa o contexto da sessão."""
    await claude_handler.clear_session(action.session_id)
    return {"status": "cleared", "session_id": action.session_id}

@app.post("/api/new-session")
async def create_new_session():
    """Cria uma nova sessão."""
    session_id = str(uuid.uuid4())
    await claude_handler.create_session(session_id)
    return {"session_id": session_id}

@app.delete("/api/session/{session_id}")
async def delete_session(session_id: str):
    """Remove uma sessão."""
    await claude_handler.destroy_session(session_id)
    return {"status": "deleted", "session_id": session_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)