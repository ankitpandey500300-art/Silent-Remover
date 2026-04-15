export interface AudioInterval {
  start: number;
  end: number;
  isSilent: boolean;
}

export async function detectSilences(
  file: File,
  thresholdDb: number = -40,
  minDuration: number = 0.5
): Promise<{ intervals: AudioInterval[], duration: number, peaks: number[] }> {
  // Wait to get AudioContext
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const channelData = audioBuffer.getChannelData(0); // Take first channel
  const sampleRate = audioBuffer.sampleRate;
  
  const threshold = Math.pow(10, thresholdDb / 20); // Convert dB to amplitude scalar
  
  // We inspect in 10ms chunks, much faster than every sample
  const chunkSize = Math.floor(sampleRate * 0.01);
  const totalChunks = Math.floor(channelData.length / chunkSize);
  
  const rawIntervals: AudioInterval[] = [];
  
  let isCurrentSilent = false;
  let currentStart = 0;
  
  for (let i = 0; i < totalChunks; i++) {
    const offset = i * chunkSize;
    let maxAmp = 0;
    
    // Find peak in the chunk
    for (let j = 0; j < chunkSize; j++) {
      if (offset + j < channelData.length) {
        const amp = Math.abs(channelData[offset + j]);
        if (amp > maxAmp) maxAmp = amp;
      }
    }
    
    const chunkIsSilent = maxAmp < threshold;
    const currentTime = (offset / sampleRate);
    
    if (i === 0) {
      isCurrentSilent = chunkIsSilent;
      currentStart = currentTime;
    } else if (chunkIsSilent !== isCurrentSilent) {
      rawIntervals.push({
        start: currentStart,
        end: currentTime,
        isSilent: isCurrentSilent
      });
      isCurrentSilent = chunkIsSilent;
      currentStart = currentTime;
    }
  }
  
  // Process the final chunk
  rawIntervals.push({
    start: currentStart,
    end: audioBuffer.duration,
    isSilent: isCurrentSilent
  });
  
  // Post-process: convert silences shorter than minDuration into loud segments
  for (let i = 0; i < rawIntervals.length; i++) {
    const inter = rawIntervals[i];
    if (inter.isSilent && (inter.end - inter.start) < minDuration) {
      inter.isSilent = false;
    }
  }
  
  // Merge consecutive segments of same type
  const mergedIntervals: AudioInterval[] = [];
  for (let i = 0; i < rawIntervals.length; i++) {
    const inter = rawIntervals[i];
    if (mergedIntervals.length === 0) {
      mergedIntervals.push(inter);
    } else {
      const last = mergedIntervals[mergedIntervals.length - 1];
      if (last.isSilent === inter.isSilent) {
        last.end = inter.end;
      } else {
        mergedIntervals.push(inter);
      }
    }
  }
  
  // Generate visual peaks (200 buckets)
  const numPeaks = 200;
  const peakChunkSize = Math.floor(channelData.length / numPeaks);
  const peaks: number[] = [];
  
  for (let i = 0; i < numPeaks; i++) {
    const offset = i * peakChunkSize;
    let max = 0;
    for (let j = 0; j < peakChunkSize && (offset + j) < channelData.length; j++) {
      const amp = Math.abs(channelData[offset + j]);
      if (amp > max) max = amp;
    }
    peaks.push(max);
  }
  
  const absoluteMax = Math.max(...peaks, 0.01);
  const normalizedPeaks = peaks.map(p => p / absoluteMax);

  return { intervals: mergedIntervals, duration: audioBuffer.duration, peaks: normalizedPeaks };
}
