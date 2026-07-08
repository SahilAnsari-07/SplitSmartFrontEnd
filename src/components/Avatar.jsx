import React from 'react';
import { getInitials, getAvatarColor } from '../utils/constants';

const Avatar = React.memo(function Avatar({ name, size = 'md', className = '' }) {
  const color = getAvatarColor(name);
  const initials = getInitials(name);

  const sizes = {
    sm: 'w-7 h-7 text-[0.6rem]',
    md: 'w-9 h-9 text-[0.8rem]',
    lg: 'w-10 h-10 text-[0.85rem]',
    xl: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold shrink-0 ${sizes[size]} ${className}`}
      style={{ background: color }}
      title={name}
    >
      {initials}
    </div>
  );
});

export default Avatar;
