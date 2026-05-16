// ============================================================
// GET /api/repos/[id]/status — SSE stream for ingestion progress
// Real-time updates during repository processing
// ============================================================

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: repoId } = await params;
  const supabase = createServerClient();

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Poll for status updates
        const pollInterval = setInterval(async () => {
          try {
            const { data: repo, error } = await supabase
              .from('repositories')
              .select('status, total_commits, total_files, total_authors')
              .eq('id', repoId)
              .single();

            if (error || !repo) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ error: 'Repository not found' })}\n\n`)
              );
              clearInterval(pollInterval);
              controller.close();
              return;
            }

            // Send status update
            const statusData = {
              status: repo.status,
              total_commits: repo.total_commits || 0,
              total_files: repo.total_files || 0,
              total_authors: repo.total_authors || 0,
              progress: getProgressPercentage(repo.status),
              message: getStatusMessage(repo.status, repo.total_commits),
            };

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(statusData)}\n\n`)
            );

            // Close stream when done or failed
            if (repo.status === 'ready' || repo.status === 'failed') {
              clearInterval(pollInterval);
              controller.close();
            }
          } catch (pollError) {
            console.error('Poll error:', pollError);
            clearInterval(pollInterval);
            controller.close();
          }
        }, 1000); // Poll every second

        // Cleanup on client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(pollInterval);
          controller.close();
        });
      } catch (error) {
        console.error('SSE error:', error);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

function getProgressPercentage(status: string): number {
  const progressMap: Record<string, number> = {
    pending: 5,
    cloning: 20,
    parsing: 50,
    embedding: 80,
    ready: 100,
    failed: 0,
  };
  return progressMap[status] || 0;
}

function getStatusMessage(status: string, commitCount: number): string {
  const messages: Record<string, string> = {
    pending: 'Preparing to clone repository...',
    cloning: 'Cloning repository from GitHub...',
    parsing: `Parsing Git history... (${commitCount} commits processed)`,
    embedding: 'Generating embeddings for semantic search...',
    ready: 'Repository indexed and ready!',
    failed: 'Indexing failed. Please try again.',
  };
  return messages[status] || 'Processing...';
}

// Made with Bob
