import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-brand-navy py-8 px-4 shadow-md border-b-2 border-brand-gold">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-wider text-white uppercase">
          Dourado <span className="text-brand-gold">&</span> Ercolin
        </h1>
        <div className="flex items-center justify-center mt-3 w-full max-w-xs opacity-90">
          <div className="flex-grow h-[1px] bg-brand-gold"></div>
          <p className="mx-4 text-xs md:text-sm text-brand-goldLight font-sans tracking-[0.3em] uppercase">
            Advogadas
          </p>
          <div className="flex-grow h-[1px] bg-brand-gold"></div>
        </div>
      </div>
    </header>
  );
};