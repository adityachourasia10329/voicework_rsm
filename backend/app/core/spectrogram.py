"""
Mel-Spectrogram Generation & Color-Coded Layer Engine
Generates pre-rendered multi-spectral data and color coordinates:
Green (Target Speech), Red (Traffic/Hum), Blue (Crowd/Chatter), Purple (Music).
"""

import math
import struct
from typing import Dict, List, Any

class SpectrogramEngine:
    """
    Computes time-frequency spectral energy representation color-coded
    by classified audio layer for WebGL/Canvas rendering.
    """

    COLOR_MAP = {
        "speech": {"r": 16, "g": 185, "b": 129},      # Emerald green
        "traffic": {"r": 239, "g": 68, "b": 68},       # Red
        "crowd": {"r": 59, "g": 130, "b": 246},        # Blue
        "music": {"r": 168, "g": 85, "b": 247},        # Purple
        "ambient": {"r": 245, "g": 158, "b": 11}       # Amber
    }

    @classmethod
    def generate_spectrogram_frames(
        cls,
        duration_sec: float,
        frames_per_sec: int = 25,
        freq_bins: int = 64
    ) -> List[Dict[str, Any]]:
        """
        Generates simulated multi-spectral frames containing energy distribution
        across frequency bands and primary layer attribution.
        """
        total_frames = max(10, int(duration_sec * frames_per_sec))
        frames = []

        for frame_idx in range(total_frames):
            time_sec = frame_idx / float(frames_per_sec)

            # Frequency bin energy [0.0 - 1.0]
            speech_energy = max(0.05, 0.7 * abs(math.sin(time_sec * 3.5)))
            traffic_energy = 0.4 if (int(time_sec) % 6 < 2) else 0.08
            crowd_energy = 0.3 if (int(time_sec) % 8 < 3) else 0.05
            music_energy = 0.5 * abs(math.cos(time_sec * 1.8))

            bins = []
            for b in range(freq_bins):
                # Low frequencies: traffic & music bass
                # Mid frequencies: speech formants (300Hz - 3.5kHz)
                # High frequencies: sibilance, air, transients
                bin_ratio = b / float(freq_bins)
                if bin_ratio < 0.2:
                    val = traffic_energy * 0.8 + music_energy * 0.4
                    layer = "traffic" if traffic_energy > 0.2 else "music"
                elif 0.2 <= bin_ratio <= 0.65:
                    val = speech_energy * 0.9 + crowd_energy * 0.3
                    layer = "speech" if speech_energy > 0.3 else "crowd"
                else:
                    val = speech_energy * 0.4 + music_energy * 0.6
                    layer = "music" if music_energy > 0.25 else "ambient"

                bins.append({
                    "freqHz": int(20 * math.pow(1000, bin_ratio)),
                    "energy": round(min(1.0, val + 0.05 * math.sin(b)), 3),
                    "layer": layer
                })

            frames.append({
                "timeSec": round(time_sec, 3),
                "bins": bins,
                "dominantLayer": "speech" if speech_energy > 0.4 else "traffic"
            })

        return frames
