/**
 * In-memory storage for PDF sessions
 * Stores PDF buffers temporarily for per-page processing
 */

interface PdfSession {
    pdfBuffer: Uint8Array;
    fileName: string;
    pageCount: number;
    createdAt: number;
}

// In-memory store
const sessions = new Map<string, PdfSession>();

// Auto-cleanup interval (10 minutes)
const SESSION_TTL = 10 * 60 * 1000;
const MAX_SESSIONS = 20;

// Generate unique session ID
function generateSessionId(): string {
    return `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Cleanup expired sessions
function cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [id, session] of sessions) {
        if (now - session.createdAt > SESSION_TTL) {
            sessions.delete(id);
            console.log(`[Session Store] Cleaned up expired session: ${id}`);
        }
    }
}

// Enforce max sessions limit (remove oldest)
function enforceMaxSessions(): void {
    if (sessions.size >= MAX_SESSIONS) {
        let oldestId: string | null = null;
        let oldestTime = Infinity;

        for (const [id, session] of sessions) {
            if (session.createdAt < oldestTime) {
                oldestTime = session.createdAt;
                oldestId = id;
            }
        }

        if (oldestId) {
            sessions.delete(oldestId);
            console.log(`[Session Store] Removed oldest session: ${oldestId}`);
        }
    }
}

/**
 * Create a new PDF session
 */
export function createSession(
    pdfBuffer: Uint8Array,
    fileName: string,
    pageCount: number
): string {
    cleanupExpiredSessions();
    enforceMaxSessions();

    const sessionId = generateSessionId();
    sessions.set(sessionId, {
        pdfBuffer,
        fileName,
        pageCount,
        createdAt: Date.now(),
    });

    console.log(`[Session Store] Created session: ${sessionId}, pages: ${pageCount}`);
    return sessionId;
}

/**
 * Get a PDF session by ID
 */
export function getSession(sessionId: string): PdfSession | null {
    const session = sessions.get(sessionId);

    if (!session) {
        console.log(`[Session Store] Session not found: ${sessionId}`);
        return null;
    }

    // Check if expired
    if (Date.now() - session.createdAt > SESSION_TTL) {
        sessions.delete(sessionId);
        console.log(`[Session Store] Session expired: ${sessionId}`);
        return null;
    }

    return session;
}

/**
 * Delete a session (cleanup after processing complete)
 */
export function deleteSession(sessionId: string): void {
    sessions.delete(sessionId);
    console.log(`[Session Store] Deleted session: ${sessionId}`);
}

/**
 * Get session count (for debugging)
 */
export function getSessionCount(): number {
    return sessions.size;
}
