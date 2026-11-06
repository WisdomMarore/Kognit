import { MessageCircle } from 'lucide-react';

const NUMBER = '263719518113';
const MESSAGE = 'Hi Kognit, I have a question.';

export default function WhatsAppButton() {
  const href = 'https://wa.me/' + NUMBER + '?text=' + encodeURIComponent(MESSAGE);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] text-white pl-4 pr-4 py-3 shadow-lg shadow-black/40 hover:scale-105 transition-transform"
    >
      <MessageCircle size={22} />
      <span className="hidden sm:inline text-sm font-semibold">Chat with us</span>
    </a>
  );
}