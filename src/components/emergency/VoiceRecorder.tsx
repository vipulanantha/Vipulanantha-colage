import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, RotateCcw, Volume2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, durationSeconds: number) => void;
  onRecordingRemoved: () => void;
  maxDurationSeconds?: number;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onRecordingRemoved,
  maxDurationSeconds = 120, // 2 minutes max
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch {
        recorder = new MediaRecorder(stream);
      }

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        onRecordingComplete(blob, duration);

        // Stop all audio tracks to turn off mic light
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(200);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => {
          if (prev + 1 >= maxDurationSeconds) {
            stopRecording();
            return maxDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Failed to access microphone:', err);
      setError(err?.message || 'Could not access microphone. Please allow audio permissions in your browser.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setDuration(0);
    setIsPlaying(false);
    onRecordingRemoved();
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-purple-100 text-purple-900 rounded-lg">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Voice Emergency Dispatch (Optional)</div>
            <div className="text-[10px] text-slate-500">Record a clear voice message for responders (Max {maxDurationSeconds}s)</div>
          </div>
        </div>

        {audioBlob && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>Voice Attached</span>
          </span>
        )}
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recording State */}
      {isRecording && (
        <div className="bg-rose-500/10 border border-rose-300 rounded-xl p-3 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
            <div className="font-mono text-sm font-black text-rose-700 tracking-wider">
              🎙️ Recording: {formatTime(duration)}
            </div>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Recording</span>
          </button>
        </div>
      )}

      {/* Audio Playback State */}
      {!isRecording && audioUrl && (
        <div className="bg-white border border-purple-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={togglePlayback}
              className="p-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl shadow-xs flex items-center justify-center cursor-pointer transition-all shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <div>
              <div className="text-xs font-extrabold text-slate-900 flex items-center space-x-2">
                <span>Recorded Voice Message</span>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                  {formatTime(duration)}
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                Size: {(audioBlob?.size ? audioBlob.size / 1024 : 0).toFixed(1)} KB • Private Storage
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center space-x-1 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-record</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
              title="Delete Recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Initial Idle State */}
      {!isRecording && !audioUrl && (
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={startRecording}
            className="px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-950 border border-purple-200 text-xs font-bold rounded-xl shadow-2xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4 text-rose-600" />
            <span>Record Voice Dispatch</span>
          </button>
          <span className="text-[11px] text-slate-400">Microphone permission required</span>
        </div>
      )}
    </div>
  );
};
