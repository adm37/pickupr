import { MessageCircle } from 'lucide-react';
import { logEvent } from '../lib/tracking';

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a 
        href="https://wa.me/31612345678" // Using a dummy number, user can change later if needed, though they asked to remove phone number from footer. 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={() => logEvent('WhatsApp Clicked', 'User clicked the floating WhatsApp button')}
        className="flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-xl hover:bg-green-600 transition-transform hover:scale-110 active:scale-95 group relative"
      >
        <MessageCircle className="w-7 h-7" />
        
        {/* Tooltip */}
        <span className="absolute right-full mr-4 bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg">
          Chat with us
          <span className="absolute top-1/2 -mt-1.5 -right-1.5 border-t-8 border-b-8 border-l-8 border-transparent border-l-zinc-900"></span>
        </span>
      </a>
    </div>
  );
}
