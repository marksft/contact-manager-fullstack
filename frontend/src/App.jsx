import { useEffect, useState } from "react";

function App() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  function fetchContacts() {
    setLoadingList(true);
    setError("");

    fetch("http://localhost:3001/contacts")
      .then((res) => res.json())
      .then((data) => setContacts(data))
      .catch(() => setError("Erro ao carregar contatos"))
      .finally(() => setLoadingList(false));
  }

  function handleSubmit(e) {
    e.preventDefault();

    setLoadingSubmit(true);
    setError("");

    const url = editingId
      ? `http://localhost:3001/contacts/${editingId}`
      : "http://localhost:3001/contacts";

    const method = editingId ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: phone.replace(/\D/g, ""), // salva sem máscara
        email,
        notes,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        setName("");
        setPhone("");
        setEmail("");
        setNotes("");
        setEditingId(null);
        fetchContacts();
      })
      .catch(() => setError("Erro ao salvar contato"))
      .finally(() => setLoadingSubmit(false));
  }

  function deleteContact(id) {
    if (!confirm("Excluir contato?")) return;

    setLoadingSubmit(true);
    setError("");

    fetch(`http://localhost:3001/contacts/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        fetchContacts();
      })
      .catch(() => setError("Erro ao excluir contato"))
      .finally(() => setLoadingSubmit(false));
  }

  function startEdit(c) {
    setName(c.name);
    setPhone(formatPhone(c.phone));
    setEmail(c.email || "");
    setNotes(c.notes || "");
    setEditingId(c.id);
  }

  function formatPhone(value) {
    const numbers = value.replace(/\D/g, "").slice(0, 11);

    if (numbers.length <= 2) return numbers;

    if (numbers.length <= 6) {
      return numbers.replace(/(\d{2})(\d+)/, "($1) $2");
    }

    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
    }

    return numbers.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
  }

  return (
  <div className="min-h-screen bg-gray-100 flex justify-center p-10">
    <div className="bg-white shadow-2xl rounded-2xl p-6 w-full max-w-5xl">

      {/* HEADER */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Contact Manager
        </h1>
        <p className="text-gray-500">
          Gerencie seus contatos de forma simples
        </p>
      </div>

      {/* ERRO */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
          {error}
        </div>
      )}

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ESQUERDA - FORM */}
        <div>
          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 p-4 rounded-xl shadow-inner flex flex-col gap-3"
          >
            <input
              className="border p-2 rounded w-full"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="border p-2 rounded w-full"
              placeholder="Telefone"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
            />

            <input
              className="border p-2 rounded w-full"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <textarea
              className="border p-2 rounded w-full"
              placeholder="Observações"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <button
              disabled={loadingSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loadingSubmit
                ? "Processando..."
                : editingId
                ? "Salvar alterações"
                : "Adicionar contato"}
            </button>
          </form>
        </div>

        {/* DIREITA - BUSCA + LISTA */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-inner">

          <input
            className="border p-3 rounded-lg w-full mb-4 shadow-sm focus:ring-2 focus:ring-blue-400"
            placeholder="🔍 Buscar contato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loadingList && (
            <p className="text-center text-gray-500 animate-pulse mb-4">
              Carregando contatos...
            </p>
          )}

          <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {contacts
              .filter((c) =>
                c.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((c) => (
                <li
                  key={c.id}
                  className="bg-white p-4 rounded-xl shadow hover:shadow-md transition flex justify-between items-start"
                >
                  <div>
                    <p className="font-bold text-lg text-gray-800">{c.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatPhone(c.phone)}
                    </p>

                    {c.email && (
                      <p className="text-sm text-gray-400">{c.email}</p>
                    )}

                    {c.notes && (
                      <p className="text-xs text-gray-400 mt-1">{c.notes}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => startEdit(c)}
                      className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded text-sm"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => deleteContact(c.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Deletar
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);
}

export default App;