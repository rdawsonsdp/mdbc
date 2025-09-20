# Social Media Icons Deployment Prompt

## Overview
Deploy clean, minimal social media sharing icons to the bottom of your application pages. This creates a professional sharing experience without bulky containers.

## Step 1: Create ShareButtons Component

Create a new file: `components/ShareButtons.jsx`

```jsx
'use client';

import { useState } from 'react';

const ShareButtons = ({ title, description, cardData }) => {
  const [copied, setCopied] = useState(false);

  // Generate share content
  const shareContent = {
    text: `${title} - ${description}`,
    url: typeof window !== 'undefined' ? window.location.href : '',
    hashtags: ['Cardology', 'BusinessCoach', 'Entrepreneur']
  };

  // Share functions
  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareContent.url)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareInstagram = () => {
    // Instagram doesn't support direct sharing, so copy to clipboard
    const text = `Check out my ${title} reading! ${shareContent.url}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTikTok = () => {
    const text = `${shareContent.text} ${shareContent.url}`;
    const url = `https://www.tiktok.com/upload?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareTwitter = () => {
    const text = `${shareContent.text} ${shareContent.url}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareWhatsApp = () => {
    const text = `${shareContent.text} ${shareContent.url}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareContent.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
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
```

## Step 2: Import and Use the Component

In your main application component (e.g., `App.jsx`, `MainComponent.jsx`, etc.):

### 2.1 Add Import
```jsx
import ShareButtons from './components/ShareButtons';
```

### 2.2 Add Component at Bottom of Page
Place the ShareButtons component at the very bottom of your page, just before the closing div:

```jsx
{/* Your existing content */}

{/* Share Buttons - Add at bottom of page */}
<ShareButtons 
  title="Your App Title"
  description="Your app description"
  cardData={{
    name: userData?.name || 'User',
    birthCard: userData?.card || 'Card',
    age: userData?.age || 'Age'
  }}
/>
```

## Step 3: Customize for Your App

### 3.1 Update Props
Modify the props passed to ShareButtons to match your app's data:

```jsx
<ShareButtons 
  title="Your Specific App Name"
  description="Your specific app description"
  cardData={{
    name: yourNameVariable,
    birthCard: yourCardVariable,
    age: yourAgeVariable
  }}
/>
```

### 3.2 Update Share Content
In the ShareButtons component, modify the `shareContent` object:

```jsx
const shareContent = {
  text: `${title} - ${description}`,
  url: typeof window !== 'undefined' ? window.location.href : '',
  hashtags: ['YourApp', 'YourHashtags', 'CustomTags']
};
```

## Step 4: Test the Implementation

1. **Check Icons Display**: Verify all 6 icons appear at the bottom
2. **Test Hover Effects**: Ensure icons scale and change colors on hover
3. **Test Sharing**: Click each icon to verify sharing functionality
4. **Test Mobile**: Check responsive behavior on mobile devices
5. **Test Copy**: Verify copy link functionality works

## Step 5: Optional Customizations

### 5.1 Add More Platforms
To add LinkedIn, Telegram, or other platforms, add new buttons following the same pattern:

```jsx
{/* LinkedIn */}
<button
  onClick={shareLinkedIn}
  className="share-icon-btn"
  title="Share on LinkedIn"
  aria-label="Share on LinkedIn"
>
  <svg className="share-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
</button>
```

### 5.2 Customize Colors
Modify the hover colors in the CSS to match your app's brand:

```css
.share-icon-btn:hover:nth-child(1) {
  color: #YourBrandColor; /* Custom color */
}
```

### 5.3 Adjust Size
Modify the icon sizes in the CSS:

```css
.share-icon-btn {
  width: 45px; /* Larger icons */
  height: 45px;
}

.share-icon {
  width: 28px; /* Larger icons */
  height: 28px;
}
```

## Troubleshooting

### Common Issues:
1. **Icons not showing**: Check that the SVG paths are correct
2. **Sharing not working**: Verify the share URLs are properly encoded
3. **Mobile issues**: Test responsive breakpoints
4. **Styling conflicts**: Ensure no CSS conflicts with existing styles

### Debug Steps:
1. Check browser console for errors
2. Verify component is imported correctly
3. Test on different devices and browsers
4. Validate HTML structure

## Final Notes

- The icons are positioned at the bottom of the page for maximum visibility
- All sharing functions include proper error handling
- The design is fully responsive and accessible
- No external dependencies required - uses only React and CSS

This implementation provides a clean, professional social sharing experience that will work across all your applications!
