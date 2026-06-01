from flask import Flask, request, jsonify
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), "leaderboard.sqlite")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                score INTEGER NOT NULL,
                updated_at TEXT NOT NULL
            );
            """
        )
        conn.commit()


@app.route("/api/leaderboard", methods=["GET"])
def leaderboard():
    limit = 5
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT name, score
            FROM leaderboard
            ORDER BY score DESC, updated_at DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    top5 = [{"name": r["name"], "score": r["score"]} for r in rows]
    return jsonify({"top5": top5})


@app.route("/api/score", methods=["POST"])
def submit_score():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name") or "").strip()[:24]
    try:
        score = int(data.get("score"))
    except (TypeError, ValueError):
        return jsonify({"ok": False, "error": "score inválido"}), 400

    if not name:
        return jsonify({"ok": False, "error": "nome inválido"}), 400

    with get_conn() as conn:
        conn.execute(
            "INSERT INTO leaderboard (name, score, updated_at) VALUES (?, ?, ?)",
            (name, score, datetime.utcnow().isoformat() + "Z"),
        )
        conn.commit()

    return jsonify({"ok": True})


if __name__ == "__main__":
    init_db()
    # Para acesso a partir do mesmo PC/rede local (alunos no mesmo laboratório)
    app.run(host="0.0.0.0", port=5000, debug=False)

