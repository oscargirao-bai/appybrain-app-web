import React from 'react';

export default function Banner({ avatarUrl, backgroundUrl }) {
  return (
    <div className="wb-banner" aria-label="profile-banner">
      {backgroundUrl ? (
        <img className="wb-banner-bg" src={backgroundUrl} alt="banner" />
      ) : (
        <div className="wb-banner-grad" />
      )}
      <div className="wb-avatar-ring">
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" />
        ) : (
          <div className="wb-avatar-fallback" />
        )}
      </div>
      <style>{`
        .wb-banner{position:relative;border-radius:0 0 18px 18px;overflow:hidden;height:180px;background:linear-gradient(135deg,#FFE259,#FFD000);display:flex;align-items:center;justify-content:center}
        .wb-banner-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
        .wb-banner-grad{position:absolute;inset:0;background:linear-gradient(135deg,#FFE259,#FFD000)}
        .wb-avatar-ring{position:relative;width:108px;height:108px;border:4px solid #fff;border-radius:999px;overflow:hidden;background:#E3F0FF}
        .wb-avatar-ring img{width:100%;height:100%;object-fit:cover}
        .wb-avatar-fallback{width:100%;height:100%;background:#E3F0FF}
      `}</style>
    </div>
  );
}
