import { useCallback, useRef, useState } from "react";

export const useTimer = (
  startTime: number,
  endTime: number
): [number, (callback: Function) => void] => {
  const [time, setTime] = useState(startTime);
  const timeRef = useRef(startTime); // Ref to store the latest time
  const callbackRef = useRef<Function | null>(null); // Ref to store the latest callback

  const tick = useCallback(() => {
    const timeout = setTimeout(() => {
      if (
        (startTime > endTime && timeRef.current <= endTime) ||
        (startTime <= endTime && timeRef.current >= endTime)
      ) {
        console.log("Time's up. Invoked callback!");
        clearTimeout(timeout);
        if (callbackRef.current) {
          callbackRef.current(); // Use the latest callback
        }
      } else {
        // Update the time state and the ref
        setTime((prevTime) => {
          const newTime = startTime > endTime ? prevTime - 1 : prevTime + 1;
          timeRef.current = newTime; // Update the ref
          return newTime;
        });

        tick(); // Recursively call tick
      }
    }, 1000);
  }, [startTime, endTime]);

  const startTimer = useCallback(
    (callback: Function) => {
      callbackRef.current = callback; // Store the latest callback in the ref
      tick(); // Start the timer
    },
    [tick]
  );

  return [time, startTimer];
};
