'use client'

import React, { useState } from 'react';

const ShareButtons = ({ 
  title = "Million Dollar Birth Card", 
  description = "Discover your entrepreneurial blueprint through Cardology",
  url = typeof window !== 'undefined' ? window.location.href : '',
  cardData = null 
}) => {
  const [copied, setCopied] = useState(false);

  // Generate shareable content based on card data
  const getShareContent = () => {
    if (cardData) {
      return {
        title: `${title} - ${cardData.name || 'Your Reading'}`,
        text: `I just discovered my ${cardData.birthCard || 'birth card'} and it's revealing my entrepreneurial blueprint! 🃏✨`,
        url: url
      };
    }
    return {
      title: title,
      text: description,
      url: url
    };
  };

  const shareContent = getShareContent();

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareContent.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Share via Web Share API (mobile)
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareContent.title,
          text: shareContent.text,
          url: shareContent.url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  // Facebook sharing
  const shareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareContent.url)}&quote=${encodeURIComponent(shareContent.text)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  // Instagram (copy link for Stories/Posts)
  const shareInstagram = () => {
    const instagramText = `${shareContent.text}\n\n${shareContent.url}`;
    copyToClipboard();
    alert('Link copied! Paste it in your Instagram story or post.');
  };

  // TikTok (copy link)
  const shareTikTok = () => {
    const tiktokText = `${shareContent.text}\n\n${shareContent.url}`;
    copyToClipboard();
    alert('Link copied! Paste it in your TikTok video description or comments.');
  };

  // Twitter/X sharing
  const shareTwitter = () => {
    const twitterText = `${shareContent.text} ${shareContent.url}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  // LinkedIn sharing
  const shareLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareContent.url)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  // WhatsApp sharing
  const shareWhatsApp = () => {
    const whatsappText = `${shareContent.text} ${shareContent.url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Telegram sharing
  const shareTelegram = () => {
    const telegramText = `${shareContent.text} ${shareContent.url}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareContent.url)}&text=${encodeURIComponent(shareContent.text)}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className="share-icons-container">
      <div className="share-icons-row">
        {/* Facebook */}
        <button
          onClick={shareFacebook}
          className="share-icon-btn"
          title="Share on Facebook"
          aria-label="Share on Facebook"
        >
          <svg className="share-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        {/* Instagram */}
        <button
          onClick={shareInstagram}
          className="share-icon-btn"
          title="Share on Instagram"
          aria-label="Share on Instagram"
        >
          <svg className="share-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </button>

        {/* TikTok */}
        <button
          onClick={shareTikTok}
          className="share-icon-btn"
          title="Share on TikTok"
          aria-label="Share on TikTok"
        >
          <svg className="share-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        </button>

        {/* X (formerly Twitter) */}
        <button
          onClick={shareTwitter}
          className="share-icon-btn"
          title="Share on X"
          aria-label="Share on X"
        >
          <svg className="share-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </button>

        {/* WhatsApp */}
        <button
          onClick={shareWhatsApp}
          className="share-icon-btn"
          title="Share on WhatsApp"
          aria-label="Share on WhatsApp"
        >
          <svg className="share-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </button>

        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className={`share-icon-btn ${copied ? 'copied' : ''}`}
          title="Copy Link"
          aria-label="Copy link to clipboard"
        >
          <svg className="share-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
        </button>
      </div>

      <style jsx>{`
        .share-icons-container {
          padding: 20px 0;
          margin: 40px 0;
          text-align: center;
        }

        .share-icons-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .share-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .share-icon-btn:hover {
          transform: scale(1.1);
          color: #333;
        }

        .share-icon-btn:active {
          transform: scale(0.95);
        }

        .share-icon {
          width: 24px;
          height: 24px;
        }

        /* Platform-specific hover colors */
        .share-icon-btn:hover:nth-child(1) {
          color: #1877F2; /* Facebook */
        }

        .share-icon-btn:hover:nth-child(2) {
          color: #E4405F; /* Instagram */
        }

        .share-icon-btn:hover:nth-child(3) {
          color: #000000; /* TikTok */
        }

        .share-icon-btn:hover:nth-child(4) {
          color: #000000; /* X */
        }

        .share-icon-btn:hover:nth-child(5) {
          color: #25D366; /* WhatsApp */
        }

        .share-icon-btn:hover:nth-child(6) {
          color: #10B981; /* Copy */
        }

        .share-icon-btn.copied {
          color: #10B981;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .share-icons-row {
            gap: 15px;
          }
          
          .share-icon-btn {
            width: 36px;
            height: 36px;
          }
          
          .share-icon {
            width: 20px;
            height: 20px;
          }
        }

        @media (max-width: 480px) {
          .share-icons-row {
            gap: 12px;
          }
          
          .share-icon-btn {
            width: 32px;
            height: 32px;
          }
          
          .share-icon {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default ShareButtons;
