// ============================================================
// POST /api/repos/[id]/chat — Why Engine + Ghost Author chat
// RAG pipeline with streaming responses
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { ragChat } from '@/lib/rag';
import { v4 as uuid } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: repoId } = await params;

  try {
    const body = await request.json();
    const { message, mode = 'why', session_id, ghost_author_id } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify repo exists and is ready
    const { data: repo } = await supabase
      .from('repositories')
      .select('id, status')
      .eq('id', repoId)
      .single();

    if (!repo || repo.status !== 'ready') {
      return NextResponse.json(
        { error: 'Repository not found or not ready' },
        { status: 404 }
      );
    }

    // Get or create session
    let sessionId = session_id;
    if (!sessionId) {
      sessionId = uuid();
      await supabase.from('chat_sessions').insert({
        id: sessionId,
        repo_id: repoId,
        mode,
        ghost_author_id: ghost_author_id || null,
        created_at: new Date().toISOString(),
        title: message.slice(0, 100),
      });
    }

    // Save user message
    await supabase.from('chat_messages').insert({
      id: uuid(),
      session_id: sessionId,
      role: 'user',
      content: message,
      citations: [],
      created_at: new Date().toISOString(),
    });

    // Get ghost author profile if in ghost mode
    let ghostProfile: string | undefined;
    let ghostName: string | undefined;
    if (mode === 'ghost' && ghost_author_id) {
      const { data: author } = await supabase
        .from('authors')
        .select('*')
        .eq('id', ghost_author_id)
        .single();

      if (author) {
        ghostName = author.name;
        ghostProfile = `Name: ${author.name}\nCommits: ${author.total_commits}\nFiles touched: ${author.files_touched}\nDomains: ${JSON.stringify(author.domains)}\nActive: ${author.first_commit_at} to ${author.last_commit_at}`;
      }
    }

    // Run RAG pipeline
    const { content, citations } = await ragChat(
      repoId,
      message,
      mode,
      ghostProfile,
      ghostName
    );

    // Save assistant message
    const assistantMessageId = uuid();
    await supabase.from('chat_messages').insert({
      id: assistantMessageId,
      session_id: sessionId,
      role: 'assistant',
      content,
      citations,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      session_id: sessionId,
      message: {
        id: assistantMessageId,
        role: 'assistant',
        content,
        citations,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
