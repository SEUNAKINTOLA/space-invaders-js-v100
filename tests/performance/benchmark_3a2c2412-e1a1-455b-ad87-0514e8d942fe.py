"""
Space Invaders Core Game Engine Performance Benchmark Suite
========================================================
[Previous docstring remains unchanged]
"""

import time
import sys
import gc
import statistics
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from contextlib import contextmanager
import logging
import json
from datetime import datetime
import platform
from pathlib import Path
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_memory_info_fallback() -> Dict[str, float]:
    """
    Fallback implementation for memory information when psutil is not available.
    Uses standard library resources to estimate memory usage.
    """
    try:
        # Attempt to get RSS from /proc/self/status on Linux
        if sys.platform.startswith('linux'):
            with open('/proc/self/status') as f:
                content = f.read()
                for line in content.split('\n'):
                    if line.startswith('VmRSS:'):
                        rss = float(line.split()[1]) / 1024  # Convert KB to MB
                        return {
                            "rss_mb": rss,
                            "vms_mb": None  # VMS not easily available
                        }
        
        # Fallback to basic Python memory info
        import resource
        usage = resource.getrusage(resource.RUSAGE_SELF)
        return {
            "rss_mb": usage.ru_maxrss / 1024,  # Convert KB to MB
            "vms_mb": None
        }
    except (OSError, ImportError, AttributeError):
        return {
            "rss_mb": None,
            "vms_mb": None,
            "note": "Memory info not available on this platform"
        }

@dataclass
class BenchmarkConfig:
    """Configuration parameters for benchmark execution."""
    iterations: int = 1000
    warmup_iterations: int = 100
    gc_between_tests: bool = True
    detailed_logging: bool = True

@dataclass
class BenchmarkResult:
    """Container for benchmark results with statistical analysis."""
    name: str
    execution_times: List[float]
    mean: float
    median: float
    std_dev: float
    min_time: float
    max_time: float
    total_time: float
    timestamp: str

    @property
    def summary(self) -> Dict[str, float]:
        """Returns a dictionary summary of the benchmark results."""
        return {
            "name": self.name,
            "mean_ms": self.mean * 1000,
            "median_ms": self.median * 1000,
            "std_dev_ms": self.std_dev * 1000,
            "min_ms": self.min_time * 1000,
            "max_ms": self.max_time * 1000
        }

class EnginePerformanceBenchmark:
    """Core engine performance benchmark implementation."""

    def __init__(self, config: Optional[BenchmarkConfig] = None):
        self.config = config or BenchmarkConfig()
        self.results: List[BenchmarkResult] = []
        self._setup_environment()

    def _setup_environment(self) -> None:
        """Prepare the environment for benchmarking."""
        logger.info("Setting up benchmark environment")
        gc.disable()  # Disable garbage collection during benchmarks
        self._log_system_info()

    def _log_system_info(self) -> None:
        """Log system information for result context."""
        system_info = {
            "python_version": sys.version,
            "platform": platform.platform(),
            "processor": platform.processor(),
            "memory": self._get_memory_info()
        }
        logger.info(f"System Info: {json.dumps(system_info, indent=2)}")

    def _get_memory_info(self) -> Dict[str, float]:
        """Get current memory usage information using fallback implementation."""
        return get_memory_info_fallback()

    # [Rest of the class implementation remains unchanged]
    
    @contextmanager
    def _benchmark_context(self, name: str):
        """Context manager for individual benchmark execution."""
        if self.config.gc_between_tests:
            gc.collect()
        
        logger.info(f"Starting benchmark: {name}")
        yield
        logger.info(f"Completed benchmark: {name}")

    def run_benchmark(self, name: str, func: callable) -> BenchmarkResult:
        """Execute a single benchmark function and collect results."""
        execution_times: List[float] = []

        with self._benchmark_context(name):
            # Warmup phase
            for _ in range(self.config.warmup_iterations):
                func()

            # Measurement phase
            for _ in range(self.config.iterations):
                start_time = time.perf_counter()
                func()
                end_time = time.perf_counter()
                execution_times.append(end_time - start_time)

        result = BenchmarkResult(
            name=name,
            execution_times=execution_times,
            mean=statistics.mean(execution_times),
            median=statistics.median(execution_times),
            std_dev=statistics.stdev(execution_times),
            min_time=min(execution_times),
            max_time=max(execution_times),
            total_time=sum(execution_times),
            timestamp=datetime.now().isoformat()
        )

        self.results.append(result)
        self._log_benchmark_result(result)
        return result

    def _log_benchmark_result(self, result: BenchmarkResult) -> None:
        """Log benchmark results with detailed statistics."""
        logger.info(f"""
Benchmark Results for {result.name}:
----------------------------------
Mean execution time: {result.mean * 1000:.2f}ms
Median execution time: {result.median * 1000:.2f}ms
Standard deviation: {result.std_dev * 1000:.2f}ms
Min execution time: {result.min_time * 1000:.2f}ms
Max execution time: {result.max_time * 1000:.2f}ms
Total time: {result.total_time:.2f}s
        """.strip())

    def save_results(self, output_path: Path) -> None:
        """Save benchmark results to a JSON file."""
        results_data = {
            "timestamp": datetime.now().isoformat(),
            "config": vars(self.config),
            "system_info": {
                "python_version": sys.version,
                "platform": platform.platform()
            },
            "results": [result.summary for result in self.results]
        }

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open('w') as f:
            json.dump(results_data, f, indent=2)
        logger.info(f"Benchmark results saved to {output_path}")

def main():
    """Execute the benchmark suite."""
    benchmark = EnginePerformanceBenchmark(
        BenchmarkConfig(
            iterations=1000,
            warmup_iterations=100,
            gc_between_tests=True,
            detailed_logging=True
        )
    )

    # Mock engine components for demonstration
    def mock_engine_init():
        time.sleep(0.001)  # Simulate initialization work

    def mock_frame_processing():
        time.sleep(0.0005)  # Simulate frame processing

    # Run benchmarks
    benchmark.run_benchmark("engine_initialization", mock_engine_init)
    benchmark.run_benchmark("frame_processing", mock_frame_processing)

    # Save results
    output_path = Path("benchmark_results.json")
    benchmark.save_results(output_path)

if __name__ == "__main__":
    main()