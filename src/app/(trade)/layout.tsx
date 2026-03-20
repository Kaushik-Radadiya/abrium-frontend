'use client';

// import TradeTopPanel from '@/components/trade/common/TradeTopPanel';

export default function TradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='mx-auto h-full py-10 min-[1441px]:min-w-110 xl:max-w-95 min-[1441px]:max-w-max sm:max-w-90 w-full'>
      {/* <TradeTopPanel /> */}
      <div className='relative flex-1'>{children}</div>
    </main>
  );
}
