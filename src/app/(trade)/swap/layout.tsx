import { SwapReviewProvider } from '@/lib/swapReviewStore';

export default function SwapLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <SwapReviewProvider>
      {children}
      {modal}
    </SwapReviewProvider>
  );
}
