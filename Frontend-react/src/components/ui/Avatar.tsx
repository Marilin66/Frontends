// @ts-nocheck
import React from 'react';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  className = '' 
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (name?: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getColorFromName = (name?: string) => {
    if (!name) return 'bg-primary';
    const colors = [
      'bg-primary',
      'bg-secondary',
      'bg-patient',
      'bg-medecin',
      'bg-adminHopital',
      'bg-superAdmin',
      'bg-laborantin',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${sizes[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center text-white font-medium ${getColorFromName(name)}`}>
          {name ? (
            getInitials(name)
          ) : (
            <User className="w-1/2 h-1/2" />
          )}
        </div>
      )}
    </div>
  );
}

export function AvatarGroup({ 
  children, 
  max = 4,
  className = '' 
}: { 
  children: React.ReactNode; 
  max?: number;
  className?: string;
}) {
  return (
    <div className={`flex -space-x-3 ${className}`}>
      {React.Children.map(children, (child, index) => (
        <div 
          key={index} 
          className="ring-2 ring-white rounded-full"
          style={{ zIndex: children ? (React.Children.count(children) - index) : 0 }}
        >
          {child}
        </div>
      ))}
      {React.Children.count(children) > max && (
        <div className={`w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 ring-2 ring-white`}>
          +{React.Children.count(children) - max}
        </div>
      )}
    </div>
  );
}
