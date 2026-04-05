"""
RL Agent - Capital allocation optimizer using a custom Gymnasium environment
and PPO from stable-baselines3.

Falls back to a rule-based heuristic when SB3/torch is unavailable
(keeps the API functional in lightweight deployments).
"""
import numpy as np
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

DEPARTMENTS = ["Engineering", "Marketing", "Sales", "Operations", "HR"]


# ---------------------------------------------------------------------------
# Custom Gym Environment
# ---------------------------------------------------------------------------
class CapitalAllocationEnv:
    """
    Minimal Gymnasium-compatible environment for capital allocation.
    State:  [roi, task_backlog, cash_flow, dept_alloc_0..N]
    Action: continuous allocation fractions per department (sum to 1)
    Reward: simulated ROI improvement
    """

    def __init__(self, state: Dict[str, Any]):
        self.initial_state = state
        self.n_depts = len(DEPARTMENTS)
        self.current_step = 0
        self.max_steps = 30
        self._obs = self._encode(state)

    def _encode(self, state: Dict) -> np.ndarray:
        base = [
            float(state.get("roi", 0)),
            float(state.get("task_backlog", 50)),
            float(state.get("cash_flow", 0)),
        ]
        allocs = state.get("dept_allocations", [1.0 / self.n_depts] * self.n_depts)
        return np.array(base + list(allocs), dtype=np.float32)

    def reset(self):
        self.current_step = 0
        self._obs = self._encode(self.initial_state)
        return self._obs, {}

    def step(self, action: np.ndarray):
        action = np.clip(action, 0, 1)
        action = action / (action.sum() + 1e-8)

        # Simulate ROI: engineering + sales allocation drives ROI up
        eng_idx = DEPARTMENTS.index("Engineering")
        sales_idx = DEPARTMENTS.index("Sales")
        roi_delta = (action[eng_idx] * 0.4 + action[sales_idx] * 0.3
                     - action[DEPARTMENTS.index("HR")] * 0.1)
        reward = float(roi_delta * 10)

        self.current_step += 1
        done = self.current_step >= self.max_steps
        self._obs = np.array(
            [self._obs[0] + roi_delta, self._obs[1] * 0.95, self._obs[2] + reward]
            + list(action), dtype=np.float32
        )
        return self._obs, reward, done, False, {}

    @property
    def observation_space_shape(self):
        return (3 + self.n_depts,)

    @property
    def action_space_shape(self):
        return (self.n_depts,)


# ---------------------------------------------------------------------------
# RL Agent wrapper
# ---------------------------------------------------------------------------
class RLAgent:
    """Wraps PPO training + inference. Falls back to heuristic if SB3 missing."""

    def __init__(self):
        self._model = None
        self._trained = False

    # ------------------------------------------------------------------
    def train(self, state: Dict[str, Any], timesteps: int = 5000) -> bool:
        try:
            import gymnasium as gym
            from stable_baselines3 import PPO
            from stable_baselines3.common.env_util import make_vec_env
            import gymnasium.spaces as spaces

            class _GymEnv(gym.Env):
                def __init__(self_inner):
                    super().__init__()
                    self_inner._env = CapitalAllocationEnv(state)
                    n = 3 + len(DEPARTMENTS)
                    self_inner.observation_space = spaces.Box(
                        low=-np.inf, high=np.inf, shape=(n,), dtype=np.float32)
                    self_inner.action_space = spaces.Box(
                        low=0, high=1, shape=(len(DEPARTMENTS),), dtype=np.float32)

                def reset(self_inner, **kwargs):
                    return self_inner._env.reset()

                def step(self_inner, action):
                    return self_inner._env.step(action)

            env = _GymEnv()
            self._model = PPO("MlpPolicy", env, verbose=0)
            self._model.learn(total_timesteps=timesteps)
            self._trained = True
            return True
        except Exception as e:
            logger.warning(f"PPO training failed, using heuristic: {e}")
            self._trained = False
            return False

    # ------------------------------------------------------------------
    def recommend(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Returns capital allocation recommendation."""
        if self._trained and self._model is not None:
            env = CapitalAllocationEnv(state)
            obs, _ = env.reset()
            action, _ = self._model.predict(obs, deterministic=True)
            action = np.clip(action, 0, 1)
            action = action / (action.sum() + 1e-8)
        else:
            action = self._heuristic_action(state)

        current_allocs = state.get("dept_allocations",
                                   [1.0 / len(DEPARTMENTS)] * len(DEPARTMENTS))
        total_budget = float(state.get("total_budget", 1_000_000))

        recommendations = []
        for i, dept in enumerate(DEPARTMENTS):
            new_alloc = float(action[i])
            old_alloc = float(current_allocs[i]) if i < len(current_allocs) else 1.0 / len(DEPARTMENTS)
            delta = (new_alloc - old_alloc) * total_budget
            recommendations.append({
                "department": dept,
                "current_pct": round(old_alloc * 100, 1),
                "recommended_pct": round(new_alloc * 100, 1),
                "delta_amount": round(delta, 2),
                "action": "increase" if delta > 0 else "decrease" if delta < 0 else "maintain",
            })

        top_move = max(recommendations, key=lambda r: abs(r["delta_amount"]))
        summary = (
            f"Shift {abs(top_move['delta_amount']):,.0f} "
            f"{'to' if top_move['delta_amount'] > 0 else 'from'} "
            f"{top_move['department']}"
        )
        return {
            "recommendations": recommendations,
            "summary": summary,
            "method": "PPO" if self._trained else "heuristic",
        }

    # ------------------------------------------------------------------
    def _heuristic_action(self, state: Dict) -> np.ndarray:
        """Rule-based fallback: over-weight Engineering & Sales."""
        weights = np.array([0.35, 0.15, 0.25, 0.15, 0.10], dtype=np.float32)
        return weights / weights.sum()
