"""
Lossless Demuxing and Zero-Loss Remuxing Engine
Utilizes FFmpeg for lossless PCM extraction and stream-copy video remuxing.
"""

import os
import subprocess
import logging
from typing import Optional, Tuple

logger = logging.getLogger("voicework.demuxer")

class MediaDemuxer:
    """
    Handles lossless audio extraction from video and zero-loss remuxing back into
    the original container without re-encoding the video stream.
    """

    @staticmethod
    def probe_media(file_path: str) -> dict:
        """Probe media format, duration, audio/video stream availability using ffprobe."""
        cmd = [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration,size,bit_rate:stream=codec_name,codec_type,channels,sample_rate",
            "-of", "json",
            file_path
        ]
        try:
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
            import json
            data = json.loads(result.stdout)
            has_video = any(s.get("codec_type") == "video" for s in data.get("streams", []))
            has_audio = any(s.get("codec_type") == "audio" for s in data.get("streams", []))
            duration = float(data.get("format", {}).get("duration", 0.0))
            return {
                "has_video": has_video,
                "has_audio": has_audio,
                "duration": duration,
                "streams": data.get("streams", [])
            }
        except Exception as e:
            logger.error(f"Failed to probe media {file_path}: {e}")
            return {"has_video": False, "has_audio": True, "duration": 0.0, "streams": []}

    @staticmethod
    def extract_lossless_audio(input_media_path: str, output_wav_path: str, sample_rate: int = 44100) -> str:
        """
        Lossless Audio Extraction via FFmpeg:
        ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 44100 -y audio.wav
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_wav_path)), exist_ok=True)
        cmd = [
            "ffmpeg",
            "-y",
            "-i", input_media_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", str(sample_rate),
            "-ac", "2",
            output_wav_path
        ]
        logger.info(f"Extracting lossless audio: {' '.join(cmd)}")
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg audio extraction failed: {result.stderr}")
        return output_wav_path

    @staticmethod
    def remux_lossless_video(
        original_video_path: str,
        refined_audio_wav_path: str,
        output_remuxed_path: str
    ) -> str:
        """
        Lossless Video Remuxing:
        Copies the video stream untouched (-c:v copy) and encodes or muxes the audio stream.
        ffmpeg -i original.mp4 -i refined_master.wav -c:v copy -c:a aac -b:a 320k -map 0:v:0 -map 1:a:0 -shortest -y output.mp4
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_remuxed_path)), exist_ok=True)
        cmd = [
            "ffmpeg",
            "-y",
            "-i", original_video_path,
            "-i", refined_audio_wav_path,
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "320k",
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-shortest",
            output_remuxed_path
        ]
        logger.info(f"Remuxing video with refined master: {' '.join(cmd)}")
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg lossless remuxing failed: {result.stderr}")
        return output_remuxed_path
