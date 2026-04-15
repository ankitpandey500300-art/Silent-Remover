import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { AudioInterval } from './audio';

export async function processVideo(
  ffmpeg: FFmpeg,
  file: File,
  intervals: AudioInterval[],
  onProgress: (ratio: number) => void
): Promise<Blob> {
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const keepIntervals = intervals.filter(i => !i.isSilent);
  
  if (keepIntervals.length === 0) {
    throw new Error('No audio found to keep.');
  }

  // Construct FFmpeg complex filter
  let filterGraph = '';
  let concatInputs = '';

  keepIntervals.forEach((inter, idx) => {
    const start = inter.start.toFixed(3);
    const end = inter.end.toFixed(3);
    
    // Video trim
    filterGraph += `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${idx}];`;
    // Audio trim
    filterGraph += `[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[a${idx}];`;
    
    concatInputs += `[v${idx}][a${idx}]`;
  });
  
  filterGraph += `${concatInputs}concat=n=${keepIntervals.length}:v=1:a=1[outv][outa]`;

  let maxTime = keepIntervals.reduce((acc, i) => acc + (i.end - i.start), 0);
  
  ffmpeg.on('log', ({ message }) => {
    // Parse time=... to infer progress if progress event fails
    // FFmpeg's built in progress works based on total duration of input
    // Since we're concatenating, it might be weird. Progress event is better.
  });

  ffmpeg.on('progress', ({ progress, time }) => {
    // time is in microseconds since 0.12, progress is generic
    onProgress(progress * 100);
  });

  await ffmpeg.exec([
    '-i', inputName,
    '-filter_complex', filterGraph,
    '-map', '[outv]',
    '-map', '[outa]',
    outputName
  ]);

  const fileData = await ffmpeg.readFile(outputName);
  const data = fileData as Uint8Array;
  return new Blob([data as any], { type: 'video/mp4' });
}
