"""
Space Invaders - Player Controls and Movement E2E Test Suite
==========================================================

This module provides comprehensive end-to-end testing for player controls and movement
features, validating core gameplay mechanics and user input handling.
"""

import unittest
import time
import logging
import sys
import os
from typing import Dict, Optional, Tuple, List
from dataclasses import dataclass
from enum import Enum, auto

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TestResult(Enum):
    """Enumeration of possible test results."""
    PASS = auto()
    FAIL = auto()
    ERROR = auto()

@dataclass
class MovementMetrics:
    """Captures detailed metrics about player movement tests."""
    response_time_ms: float
    position_accuracy: float
    frame_time_ms: float
    input_lag_ms: float
    collision_checks: int

@dataclass
class TestMetrics:
    """Aggregates test execution metrics."""
    start_time: float
    end_time: float
    memory_start: float
    memory_end: float
    movement_metrics: List[MovementMetrics]
    
    @property
    def duration(self) -> float:
        """Calculate total test duration in seconds."""
        return self.end_time - self.start_time
    
    @property
    def memory_delta(self) -> float:
        """Calculate memory usage delta in MB."""
        return (self.memory_end - self.memory_start) / 1024 / 1024

class PlayerControlTestError(Exception):
    """Custom exception for player control test failures."""
    pass

def get_process_memory() -> float:
    """
    Cross-platform function to get current process memory usage.
    Falls back to different methods depending on platform availability.
    
    Returns:
        float: Memory usage in bytes
    """
    try:
        # First attempt: Use resource module (Unix-like systems)
        import resource
        return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss * 1024
    except ImportError:
        try:
            # Second attempt: Use psutil if available
            import psutil
            return psutil.Process().memory_info().rss
        except ImportError:
            try:
                # Third attempt: Windows-specific solution
                import ctypes
                kernel32 = ctypes.windll.kernel32
                process_handle = kernel32.GetCurrentProcess()
                memory_counter = ctypes.c_size_t()
                kernel32.GetProcessMemoryInfo(
                    process_handle,
                    ctypes.byref(memory_counter),
                    ctypes.sizeof(memory_counter)
                )
                return memory_counter.value
            except Exception:
                # Final fallback: Return 0 if no method works
                logger.warning("Unable to measure memory usage - functionality disabled")
                return 0.0

class PlayerMovementTests(unittest.TestCase):
    """End-to-end tests for player movement and control systems."""

    @classmethod
    def setUpClass(cls) -> None:
        """Initialize test environment and resources."""
        logger.info("Initializing Player Movement Test Suite")
        cls.metrics = TestMetrics(
            start_time=time.time(),
            end_time=0.0,
            memory_start=get_process_memory(),
            memory_end=0.0,
            movement_metrics=[]
        )

    @classmethod
    def tearDownClass(cls) -> None:
        """Clean up resources and log final metrics."""
        cls.metrics.end_time = time.time()
        cls.metrics.memory_end = get_process_memory()
        
        logger.info(f"""
        Test Suite Metrics:
        ==================
        Duration: {cls.metrics.duration:.2f}s
        Memory Delta: {cls.metrics.memory_delta:.2f}MB
        Tests Run: {len(cls.metrics.movement_metrics)}
        """)

    def setUp(self) -> None:
        """Set up individual test cases."""
        self.start_time = time.time()
        logger.info(f"Starting test: {self._testMethodName}")

    def tearDown(self) -> None:
        """Clean up after each test case."""
        duration = time.time() - self.start_time
        logger.info(f"Test completed in {duration:.2f}s")

    # [Rest of the test methods remain unchanged...]
    # Original test methods (test_player_horizontal_movement, test_movement_boundaries,
    # test_input_responsiveness) stay exactly the same as they don't involve imports

if __name__ == '__main__':
    unittest.main(verbosity=2)