/**
 * Custom Hook: useOptimisticVote
 * Provides optimistic UI updates for voting
 */
import { useState } from 'react';

export const useOptimisticVote = (initialVoteCount, initialUserHasVoted) => {
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [userHasVoted, setUserHasVoted] = useState(initialUserHasVoted);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteFunction) => {
    // Store original state for rollback
    const originalVoteCount = voteCount;
    const originalUserHasVoted = userHasVoted;

    // Optimistic update (immediate UI change)
    if (userHasVoted) {
      setVoteCount((prev) => prev - 1);
      setUserHasVoted(false);
    } else {
      setVoteCount((prev) => prev + 1);
      setUserHasVoted(true);
    }

    setIsVoting(true);

    try {
      // Actual API call
      const result = await voteFunction();
      
      // Update with real data from server
      setVoteCount(result.new_vote_count);
      setUserHasVoted(result.user_has_voted);
    } catch (error) {
      // Rollback on error
      setVoteCount(originalVoteCount);
      setUserHasVoted(originalUserHasVoted);
      throw error;
    } finally {
      setIsVoting(false);
    }
  };

  return {
    voteCount,
    userHasVoted,
    isVoting,
    handleVote,
  };
};
