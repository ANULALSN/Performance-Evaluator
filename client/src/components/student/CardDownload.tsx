import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Linkedin,
  Twitter,
  MessageCircle,
  Link2,
  Check,
  Loader2,
} from 'lucide-react';
import type { CardData } from './StudentCard';

const SIPP_BASE_URL = 'https://sipp.acadeno.com';

interface CardDownloadProps {
  data: CardData;
}

const CardDownload: React.FC<CardDownloadProps> = ({ data }) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicCardUrl = `${SIPP_BASE_URL}/card/${data._id}`;

  const shareText = encodeURIComponent(
    `🚀 Just hit Level ${data.level} on SIPP — the Student Innovator Performance Platform!\n` +
    `${data.streak} day streak and counting. Building in ${data.techStack} every single day. 💪\n` +
    `#100DaysOfCode #TechLearning #Acadeno`
  );

  const downloadCard = async () => {
    setDownloading(true);
    try {
      // Dynamically import html2canvas to avoid SSR issues
      const { default: html2canvas } = await import('html2canvas');
      const cardElement = document.getElementById('student-card');
      if (!cardElement) {
        (window as any).toast?.('Card element not found. Please try again.', 'error');
        return;
      }

      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      const link = document.createElement('a');
      const safeName = data.name.replace(/\s+/g, '-').toLowerCase();
      link.download = `sipp-card-${safeName}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      (window as any).toast?.('Card downloaded at 3× resolution!', 'success');
    } catch (err) {
      console.error('Download error:', err);
      (window as any).toast?.('Download failed. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicCardUrl);
      setCopied(true);
      (window as any).toast?.('Card link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      (window as any).toast?.('Failed to copy link.', 'error');
    }
  };

  const shareButtons = [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      color: '#0077b5',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicCardUrl)}`,
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: Twitter,
      color: '#1DA1F2',
      href: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(publicCardUrl)}`,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      color: '#25d366',
      href: `https://wa.me/?text=${shareText}%20${encodeURIComponent(publicCardUrl)}`,
    },
  ];

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-[400px]">
      {/* Download Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={downloadCard}
        disabled={downloading}
        className="w-full h-11 flex items-center justify-center gap-3 rounded-xl font-bold text-sm text-white transition-all"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
          opacity: downloading ? 0.7 : 1,
        }}
      >
        {downloading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        {downloading ? 'Rendering 3× PNG…' : '⬇ Download Card'}
      </motion.button>

      {/* Share Row */}
      <div className="flex gap-3 w-full">
        {shareButtons.map(btn => (
          <motion.a
            key={btn.id}
            href={btn.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-white transition-all"
            style={{ background: btn.color, boxShadow: `0 4px 14px ${btn.color}44` }}
          >
            <btn.icon size={14} />
            {btn.label}
          </motion.a>
        ))}

        {/* Copy Link */}
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={copyLink}
          className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-white transition-all"
          style={{
            background: copied ? '#10b981' : '#6d28d9',
            boxShadow: `0 4px 14px ${copied ? '#10b98144' : '#6d28d944'}`,
            transition: 'background 0.3s',
          }}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Check size={14} /> Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Link2 size={14} /> Copy Link
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
};

export default CardDownload;
