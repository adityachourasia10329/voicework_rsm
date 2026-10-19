"""
Arbitrary-Length Audio Chunker & Crossfade Reassembly Pipeline
Prevents GPU Out-Of-Memory (OOM) failures by segmenting audio into overlapping
blocks with linear crossfades and seamless reassembly.
"""

import os
import wave
import math
import struct
from typing import List, Tuple, Generator

class AudioChunker:
    """
    Splits long audio streams into overlapping windows and seamlessly
    splices them back using linear crossfade curves.
    """

    def __init__(
        self,
        chunk_duration_sec: float = 60.0,
        overlap_sec: float = 2.0,
        sample_rate: int = 44100,
        num_channels: int = 2
    ):
        self.chunk_duration_sec = chunk_duration_sec
        self.overlap_sec = overlap_sec
        self.sample_rate = sample_rate
        self.num_channels = num_channels
        self.samples_per_chunk = int(chunk_duration_sec * sample_rate)
        self.samples_overlap = int(overlap_sec * sample_rate)
        self.samples_step = self.samples_per_chunk - self.samples_overlap

    def calculate_chunks_metadata(self, total_duration_sec: float) -> List[dict]:
        """Calculates start, end, and crossfade offsets for all audio chunks."""
        if total_duration_sec <= self.chunk_duration_sec:
            return [{
                "chunk_index": 0,
                "start_sec": 0.0,
                "end_sec": total_duration_sec,
                "is_first": True,
                "is_last": True,
                "fade_in_sec": 0.0,
                "fade_out_sec": 0.0
            }]

        chunks = []
        current_start = 0.0
        index = 0

        while current_start < total_duration_sec:
            current_end = min(current_start + self.chunk_duration_sec, total_duration_sec)
            is_first = (index == 0)
            is_last = (current_end >= total_duration_sec)

            chunks.append({
                "chunk_index": index,
                "start_sec": current_start,
                "end_sec": current_end,
                "duration_sec": current_end - current_start,
                "is_first": is_first,
                "is_last": is_last,
                "fade_in_sec": 0.0 if is_first else self.overlap_sec,
                "fade_out_sec": 0.0 if is_last else self.overlap_sec
            })

            if is_last:
                break
            current_start += (self.chunk_duration_sec - self.overlap_sec)
            index += 1

        return chunks

    @staticmethod
    def apply_linear_crossfade(
        buffer_a: bytearray,
        buffer_b: bytearray,
        overlap_samples: int,
        channels: int = 2
    ) -> bytearray:
        """
        Crossfades the trailing end of buffer_a with the leading start of buffer_b
        using a smooth equal-power or linear interpolation.
        """
        bytes_per_sample = 2  # 16-bit PCM
        frame_size = bytes_per_sample * channels
        overlap_bytes = overlap_samples * frame_size

        if len(buffer_a) < overlap_bytes or len(buffer_b) < overlap_bytes:
            return buffer_a + buffer_b

        # Head of buffer A (before overlap)
        result = buffer_a[:-overlap_bytes]

        # Overlap region
        fade_region = bytearray(overlap_bytes)
        for i in range(overlap_samples):
            # linear weights
            alpha = i / float(overlap_samples)
            weight_b = alpha
            weight_a = 1.0 - alpha

            for c in range(channels):
                offset = (i * channels + c) * bytes_per_sample
                # unpack 16-bit signed int
                sample_a = struct.unpack_from("<h", buffer_a, len(buffer_a) - overlap_bytes + offset)[0]
                sample_b = struct.unpack_from("<h", buffer_b, offset)[0]

                blended = int(sample_a * weight_a + sample_b * weight_b)
                blended = max(-32768, min(32767, blended))
                struct.pack_into("<h", fade_region, offset, blended)

        result.extend(fade_region)
        # Tail of buffer B (after overlap)
        result.extend(buffer_b[overlap_bytes:])
        return result
