// hooks/useOnlineStatus.js
import { useState, useCallback } from "react";

export function useOnlineStatus(otherUserId) {
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const handleStatusChange = useCallback(({ userId, online }) => {
    setOnlineUsers((prev) => {
      const next = new Set(prev);
      if (online) next.add(userId);
      else next.delete(userId);
      return next;
    });
  }, []);

  const isOnline = useCallback(
    (userId) => onlineUsers.has(userId),
    [onlineUsers]
  );

  return { handleStatusChange, isOnline, isOtherOnline: isOnline(otherUserId) };
}