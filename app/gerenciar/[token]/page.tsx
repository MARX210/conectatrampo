'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Opportunity = {
  id: number | string;
  title: string;
  description: string;
  category: string;
  kind: string;
  location: string;
  mode: string;
  pay: string;
  contact: string;
  url: string | null;
  status: string;
};

const initialForm = {
  title: '',
  description: '',
  category: '',
  kind: 'Emprego',
  location: '',
  mode: '',
  pay: '',
  contact: '',
  url: '',
};

export default function ManageOpportunityPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const token = params.token;

  const [form, setForm] = useState(initialForm);
  const [opportunity, setOpportunity] =
    useState<Opportunity | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadOpportunity() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/manage/${encodeURIComponent(token)}`,
        { cache: 'no-store' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Não foi possível carregar a publicação.'
        );
      }

      const item: Opportunity = data.opportunity;

      setOpportunity(item);

      setForm({
        title: item.title || '',
        description: item.description || '',
        category: item.category || '',
        kind: item.kind || 'Emprego',
        location: item.location || '',
        mode: item.mode || '',
        pay: item.pay || '',
        contact: item.contact || '',
        url: item.url || '',
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro inesperado.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOpportunity();

    // A URL do token identifica a publicação.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function updateField(
    field: keyof typeof initialForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        `/api/manage/${encodeURIComponent(token)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Não foi possível salvar as alterações.'
        );
      }

      setOpportunity(data.opportunity);
      setMessage('Alterações salvas com sucesso.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao salvar.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(status: 'active' | 'filled') {
    const confirmation =
      status === 'filled'
        ? 'Deseja marcar esta oportunidade como preenchida? Ela deixará de aparecer na lista pública.'
        : 'Deseja reativar esta oportunidade? Ela voltará a aparecer na lista pública.';

    if (!window.confirm(confirmation)) {
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        `/api/manage/${encodeURIComponent(token)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Não foi possível alterar o status.'
        );
      }

      setOpportunity((current) =>
        current
          ? { ...current, status }
          : current
      );

      setMessage(
        status === 'filled'
          ? 'Oportunidade marcada como preenchida.'
          : 'Oportunidade reativada.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao alterar o status.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteOpportunity() {
    const confirmation = window.confirm(
      'Tem certeza de que deseja excluir esta oportunidade definitivamente? Esta ação não poderá ser desfeita.'
    );

    if (!confirmation) {
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/manage/${encodeURIComponent(token)}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Não foi possível excluir a publicação.'
        );
      }

      window.alert('Publicação excluída com sucesso.');

      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao excluir.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p>Carregando sua publicação...</p>
      </main>
    );
  }

  if (!opportunity) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">
          Não foi possível abrir esta publicação
        </h1>

        <p className="mt-3 text-red-600" role="alert">
          {error || 'O link pode estar inválido ou ter sido removido.'}
        </p>

        <a
          href="/"
          className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-white"
        >
          Voltar ao ConectaTrampo
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <a href="/" className="text-sm underline">
          ← Voltar ao ConectaTrampo
        </a>

        <h1 className="mt-5 text-3xl font-bold">
          Gerenciar oportunidade
        </h1>

        <p className="mt-2 text-gray-600">
          Edite os dados, atualize o status ou remova sua publicação.
        </p>
      </header>

      <section className="mb-6 rounded-xl border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">
              Status da publicação
            </p>

            <p className="mt-1 font-semibold">
              {opportunity.status === 'filled'
                ? 'Vaga preenchida'
                : opportunity.status === 'active'
                  ? 'Publicação ativa'
                  : opportunity.status}
            </p>
          </div>

          {opportunity.status === 'active' ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void changeStatus('filled')}
              className="rounded-lg border border-green-700 px-4 py-2 text-green-800 disabled:opacity-50"
            >
              Marcar como preenchida
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => void changeStatus('active')}
              className="rounded-lg border px-4 py-2 disabled:opacity-50"
            >
              Reativar oportunidade
            </button>
          )}
        </div>
      </section>

      {message && (
        <p
          className="mb-4 rounded-lg bg-green-50 p-3 text-green-800"
          role="status"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          className="mb-4 rounded-lg bg-red-50 p-3 text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={saveChanges}
        className="space-y-5 rounded-xl border p-5"
      >
        <div>
          <label htmlFor="title" className="mb-2 block font-medium">
            Título da oportunidade
          </label>

          <input
            id="title"
            required
            maxLength={160}
            value={form.title}
            onChange={(event) =>
              updateField('title', event.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block font-medium"
          >
            Descrição
          </label>

          <textarea
            id="description"
            required
            maxLength={1800}
            rows={6}
            value={form.description}
            onChange={(event) =>
              updateField('description', event.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label htmlFor="kind" className="mb-2 block font-medium">
            Tipo de oportunidade
          </label>

          <select
            id="kind"
            value={form.kind}
            onChange={(event) =>
              updateField('kind', event.target.value)
            }
            className="w-full rounded-lg border p-3"
          >
            <option value="Emprego">Emprego</option>
            <option value="Freelance">Freelance</option>
            <option value="Serviço">Serviço</option>
            <option value="Link externo">Link externo</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-2 block font-medium"
          >
            Categoria
          </label>

          <input
            id="category"
            maxLength={80}
            value={form.category}
            onChange={(event) =>
              updateField('category', event.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="mb-2 block font-medium"
          >
            Localização
          </label>

          <input
            id="location"
            maxLength={120}
            value={form.location}
            onChange={(event) =>
              updateField('location', event.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label htmlFor="mode" className="mb-2 block font-medium">
            Modalidade de trabalho
          </label>

          <select
            id="mode"
            value={form.mode}
            onChange={(event) =>
              updateField('mode', event.target.value)
            }
            className="w-full rounded-lg border p-3"
          >
            <option value="">A combinar</option>
            <option value="Remoto">Remoto</option>
            <option value="Presencial">Presencial</option>
            <option value="Híbrido">Híbrido</option>
          </select>
        </div>

        <div>
          <label htmlFor="pay" className="mb-2 block font-medium">
            Remuneração
          </label>

          <input
            id="pay"
            maxLength={120}
            value={form.pay}
            onChange={(event) =>
              updateField('pay', event.target.value)
            }
            placeholder="Ex.: R$ 2.500 ou a combinar"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label
            htmlFor="contact"
            className="mb-2 block font-medium"
          >
            Contato
          </label>

          <input
            id="contact"
            maxLength={180}
            value={form.contact}
            onChange={(event) =>
              updateField('contact', event.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label htmlFor="url" className="mb-2 block font-medium">
            Link externo
          </label>

          <input
            id="url"
            type="url"
            value={form.url}
            onChange={(event) =>
              updateField('url', event.target.value)
            }
            placeholder="https://..."
            className="w-full rounded-lg border p-3"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>

      <section className="mt-8 rounded-xl border border-red-200 p-5">
        <h2 className="text-xl font-bold text-red-700">
          Excluir publicação
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Use esta opção se a publicação não deve mais existir.
          A exclusão é definitiva.
        </p>

        <button
          type="button"
          disabled={saving}
          onClick={() => void deleteOpportunity()}
          className="mt-4 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          Excluir definitivamente
        </button>
      </section>
    </main>
  );
}