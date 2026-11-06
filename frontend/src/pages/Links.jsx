import { useEffect, useState } from 'react';
import client from '../api/client';
import AppLayout from '../components/AppLayout';

export default function Links() {
  const [links, setLinks] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    client.get('/links/').then((res) => setLinks(res.data));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    const res = await client.post('/links/', { title, url, notes });
    setLinks([res.data, ...links]);
    setTitle('');
    setUrl('');
    setNotes('');
    setShowForm(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this link?')) return;
    await client.delete(`/links/${id}/`);
    setLinks(links.filter((l) => l.id !== id));
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-8 py-10">
        <h1 className="font-display text-2xl text-paper mb-1">Links</h1>
        <p className="text-sand mb-8">Save places you find good notes or material to study from.</p>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full border border-dashed border-white/15 text-sand rounded-2xl py-3 mb-6 hover:border-ember hover:text-ember transition-colors"
          >
            + Save a link
          </button>
        )}

        {showForm && (
          <form onSubmit={handleAdd} className="surface p-5 mb-6 space-y-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 text-paper placeholder:text-sand/50 rounded-sm px-3 py-2 focus:outline-none focus:border-ember"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/[0.04] border border-white/10 text-paper placeholder:text-sand/50 rounded-sm px-3 py-2 focus:outline-none focus:border-ember"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-white/[0.04] border border-white/10 text-paper placeholder:text-sand/50 rounded-sm px-3 py-2 focus:outline-none focus:border-ember"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-ember text-ink px-4 py-2 rounded-full font-semibold hover:bg-ember-dark">
                Save
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sand/70 px-4 py-2 rounded-full font-medium hover:bg-white/5 hover:text-paper">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {links.length === 0 && (
            <p className="text-sand/60 text-sm text-center py-8">No links saved yet.</p>
          )}
          {links.map((link) => (
            <div
              key={link.id}
              className="surface p-4 group flex justify-between items-start gap-3"
            >
              <div className="min-w-0 flex-1">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-paper font-medium hover:text-ember block"
                >
                  {link.title}
                </a>
                <p className="text-xs text-sand/60 truncate mt-0.5">{link.url}</p>
                {link.notes && <p className="text-sm text-sand mt-1.5">{link.notes}</p>}
              </div>
              <button
                onClick={() => handleDelete(link.id)}
                className="text-sand/0 group-hover:text-sand/60 hover:!text-rose text-sm transition-colors shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}