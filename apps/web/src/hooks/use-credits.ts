import { useQuery } from '@tanstack/react-query'
import { creditsService } from '../service/credits'

export function useCredits() {
  return useQuery({
    queryKey: ['credits'],
    queryFn: () => creditsService.getCredits(),
    refetchInterval: 30000,
  })
}

export function useCreditTransactions(limit = 50) {
  return useQuery({
    queryKey: ['credit-transactions', limit],
    queryFn: () => creditsService.getTransactions(limit),
  })
}

