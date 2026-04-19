import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'sybau.db')


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    conn = get_db()
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS conversations (
                id         TEXT PRIMARY KEY,
                title      TEXT NOT NULL DEFAULT 'New Conversation',
                model      TEXT NOT NULL,
                preview    TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                id              TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                role            TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
                content         TEXT NOT NULL DEFAULT '',
                thinking        TEXT,
                model           TEXT,
                created_at      TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);

            CREATE TABLE IF NOT EXISTS custom_models (
                id            TEXT PRIMARY KEY,
                name          TEXT NOT NULL UNIQUE,
                base_model    TEXT NOT NULL,
                system_prompt TEXT NOT NULL DEFAULT '',
                created_at    TEXT NOT NULL
            );
        """)
        conn.commit()
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Conversations
# ---------------------------------------------------------------------------

def list_conversations() -> list[dict]:
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM conversations ORDER BY updated_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def create_conversation(id: str, title: str, model: str, preview: str | None, created_at: str) -> dict:
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO conversations (id, title, model, preview, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (id, title, model, preview, created_at, created_at),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM conversations WHERE id = ?", (id,)).fetchone()
        return dict(row)
    finally:
        conn.close()


def get_conversation(id: str) -> dict | None:
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM conversations WHERE id = ?", (id,)).fetchone()
        if row is None:
            return None
        conv = dict(row)
        msgs = conn.execute(
            "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
            (id,),
        ).fetchall()
        conv["messages"] = [dict(m) for m in msgs]
        return conv
    finally:
        conn.close()


def update_conversation(id: str, title: str | None = None, preview: str | None = None, updated_at: str | None = None) -> dict | None:
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM conversations WHERE id = ?", (id,)).fetchone()
        if row is None:
            return None
        current = dict(row)
        new_title = title if title is not None else current["title"]
        new_preview = preview if preview is not None else current["preview"]
        new_updated_at = updated_at if updated_at is not None else current["updated_at"]
        conn.execute(
            "UPDATE conversations SET title = ?, preview = ?, updated_at = ? WHERE id = ?",
            (new_title, new_preview, new_updated_at, id),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM conversations WHERE id = ?", (id,)).fetchone()
        return dict(row)
    finally:
        conn.close()


def delete_conversation(id: str) -> bool:
    conn = get_db()
    try:
        cursor = conn.execute("DELETE FROM conversations WHERE id = ?", (id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Messages
# ---------------------------------------------------------------------------

def create_message(id: str, conversation_id: str, role: str, content: str, thinking: str | None, model: str | None, created_at: str) -> dict:
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO messages (id, conversation_id, role, content, thinking, model, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (id, conversation_id, role, content, thinking, model, created_at),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM messages WHERE id = ?", (id,)).fetchone()
        return dict(row)
    finally:
        conn.close()


def update_message(id: str, content: str, thinking: str | None = None) -> dict | None:
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM messages WHERE id = ?", (id,)).fetchone()
        if row is None:
            return None
        current = dict(row)
        new_thinking = thinking if thinking is not None else current["thinking"]
        conn.execute(
            "UPDATE messages SET content = ?, thinking = ? WHERE id = ?",
            (content, new_thinking, id),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM messages WHERE id = ?", (id,)).fetchone()
        return dict(row)
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Custom Models
# ---------------------------------------------------------------------------

def list_custom_models() -> list[dict]:
    conn = get_db()
    try:
        rows = conn.execute("SELECT * FROM custom_models ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def create_custom_model(id: str, name: str, base_model: str, system_prompt: str, created_at: str) -> dict:
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO custom_models (id, name, base_model, system_prompt, created_at) VALUES (?, ?, ?, ?, ?)",
            (id, name, base_model, system_prompt, created_at),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM custom_models WHERE id = ?", (id,)).fetchone()
        return dict(row)
    finally:
        conn.close()


def delete_custom_model(id: str) -> bool:
    conn = get_db()
    try:
        cursor = conn.execute("DELETE FROM custom_models WHERE id = ?", (id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()
