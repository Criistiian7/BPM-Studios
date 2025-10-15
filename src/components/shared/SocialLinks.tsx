import React from 'react';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';

interface SocialLinksProps {
  socialLinks: {
    facebook?: string | null;
    instagram?: string | null;
    youtube?: string | null;
  };
  size?: 'sm' | 'md';
  showLabels?: boolean;
  className?: string;
}

const SOCIAL_CONFIGS = {
  facebook: {
    icon: FaFacebook,
    label: 'Facebook',
    className: 'bg-[#1877F2] hover:bg-[#166FE5]'
  },
  instagram: {
    icon: FaInstagram,
    label: 'Instagram', 
    className: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:from-[#7232A8] hover:via-[#E91B1B] hover:to-[#F5A742]'
  },
  youtube: {
    icon: FaYoutube,
    label: 'YouTube',
    className: 'bg-[#FF0000] hover:bg-[#E60000]'
  }
};

export const SocialLinks: React.FC<SocialLinksProps> = ({ 
  socialLinks, 
  size = 'md', 
  showLabels = true,
  className = ''
}) => {
  const links = Object.entries(socialLinks).filter(([_, url]) => url);
  
  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {links.map(([platform, url]) => {
        const config = SOCIAL_CONFIGS[platform as keyof typeof SOCIAL_CONFIGS];
        const Icon = config.icon;
        
        return (
          <a
            key={platform}
            href={url!}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all shadow-md ${config.className}`}
            aria-label={config.label}
          >
            <Icon className={size === 'sm' ? 'text-lg' : 'text-xl'} />
            {showLabels && <span className="font-semibold">{config.label}</span>}
          </a>
        );
      })}
    </div>
  );
};