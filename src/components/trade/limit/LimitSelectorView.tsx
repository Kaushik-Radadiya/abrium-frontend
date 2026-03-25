'use client';

import { motion } from 'framer-motion';
import { TradeTokenSelectorModal } from '@/components/trade/common/TradeTokenSelectorModal';
import { TokenSelectorModalProps } from '@/types/trade/workspace';

export function LimitSelectorView(props: TokenSelectorModalProps) {
  return (
    <motion.div
      key='limit-selector-ui'
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className='absolute inset-0 flex flex-col gap-4'
    >
      <TradeTokenSelectorModal {...props} />
    </motion.div>
  );
}
