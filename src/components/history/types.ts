export type HistoryStatus = 'Pending' | 'Completed' | 'Failed';

export type HistoryItem = {
  id: string;
  date: string;
  type: string;
  fromToken: string;
  toToken: string;
  amount: string;
  amountSubtext: string;
  duration: string;
  status: HistoryStatus;
};
