import React, { useEffect, useMemo, useState } from "react";
import { datadogRum } from "@datadog/browser-rum";
import { createRoot } from "react-dom/client";
import { Check, Plus, RefreshCw, Trash2 } from "lucide-react";
import "./styles.css";

const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";

datadogRum.init({
  applicationId: import.meta.env.VITE_DD_RUM_APPLICATION_ID || "a1432b80-8baf-4e21-9572-61360e5ed6de",
  clientToken: import.meta.env.VITE_DD_RUM_CLIENT_TOKEN || "pubca550527baba8b28bc73e591d12898a1",
  site: import.meta.env.VITE_DD_SITE || "us5.datadoghq.com",
  service: import.meta.env.VITE_DD_SERVICE || "todo-frontend",
  env: import.meta.env.VITE_DD_ENV || "prod",
  version: import.meta.env.VITE_DD_VERSION || "v0.0.2",
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: "mask-user-input",
  allowedTracingUrls: [
    (url) => {
      const requestUrl = typeof url === "string" ? url : url.toString();
      return requestUrl.includes("/api");
    }
  ]
});

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openCount = useMemo(() => todos.filter((todo) => !todo.completed).length, [todos]);

  async function loadTodos() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBase}/todos`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load todos");
      }

      setTodos(data.todos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createTodo(event) {
    event.preventDefault();
    const nextTitle = title.trim();

    if (!nextTitle) {
      return;
    }

    const response = await fetch(`${apiBase}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title: nextTitle })
    });

    if (response.ok) {
      setTitle("");
      await loadTodos();
    }
  }

  async function toggleTodo(todo) {
    await fetch(`${apiBase}/todos/${todo.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ completed: !todo.completed })
    });

    await loadTodos();
  }

  async function deleteTodo(todo) {
    await fetch(`${apiBase}/todos/${todo.id}`, {
      method: "DELETE"
    });

    await loadTodos();
  }

  useEffect(() => {
    loadTodos();
  }, []);

  return (
    <main className="shell">
      <section className="panel">
        <header className="header">
          <div>
            <p className="eyebrow">Kubernetes capstone</p>
            <h1>Todo Control Plane</h1>
          </div>
          <button className="iconButton" type="button" onClick={loadTodos} title="Refresh">
            <RefreshCw size={18} />
          </button>
        </header>

        <div className="summary">
          <span>{todos.length} total</span>
          <span>{openCount} open</span>
          <span>{todos.length - openCount} done</span>
        </div>

        <form className="form" onSubmit={createTodo}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a deployment task"
          />
          <button type="submit">
            <Plus size={18} />
            Add
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}
        {loading ? <p className="muted">Loading...</p> : null}

        <ul className="list">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? "done" : ""}>
              <button type="button" className="check" onClick={() => toggleTodo(todo)} title="Toggle">
                <Check size={16} />
              </button>
              <span>{todo.title}</span>
              <button type="button" className="delete" onClick={() => deleteTodo(todo)} title="Delete">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
